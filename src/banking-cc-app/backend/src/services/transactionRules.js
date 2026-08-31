// Synchronous, rule-based authorization engine for simulated purchases.
// Every rule is deliberately simple and readable - this models the *shape*
// of real authorization logic (status checks, limit checks, velocity/fraud
// checks) without claiming to be a production risk engine.

const Transaction = require("../models/Transaction");

const SINGLE_TRANSACTION_MAX = 5000;
const VELOCITY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const VELOCITY_MAX_APPROVED = 5;

async function evaluatePurchase({ card, amount }) {
  if (card.status !== "active") {
    return { approved: false, reason: `card_${card.status}` };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { approved: false, reason: "invalid_amount" };
  }

  if (amount > SINGLE_TRANSACTION_MAX) {
    return { approved: false, reason: "exceeds_single_transaction_limit" };
  }

  if (amount > card.availableCredit) {
    return { approved: false, reason: "insufficient_credit" };
  }

  const windowStart = new Date(Date.now() - VELOCITY_WINDOW_MS);
  const recentApprovedCount = await Transaction.countDocuments({
    cardId: card._id,
    type: "purchase",
    status: "approved",
    createdAt: { $gte: windowStart },
  });
  if (recentApprovedCount >= VELOCITY_MAX_APPROVED) {
    return { approved: false, reason: "velocity_limit_exceeded" };
  }

  return { approved: true, reason: null };
}

module.exports = { evaluatePurchase, SINGLE_TRANSACTION_MAX, VELOCITY_MAX_APPROVED };
