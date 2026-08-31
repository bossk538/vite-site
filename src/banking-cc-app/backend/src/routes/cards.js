const express = require("express");
const mongoose = require("mongoose");
const CreditCard = require("../models/CreditCard");
const Transaction = require("../models/Transaction");
const { requireAuth } = require("../middleware/auth");
const { decideCreditLimit } = require("../services/creditDecision");
const {
  generateFakeCardNumber,
  maskCardNumber,
  generateExpiry,
  generateFakeCvv,
} = require("../utils/cardNumber");

const router = express.Router();

async function loadOwnedCard(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid card id" });
    return null;
  }
  const card = await CreditCard.findOne({ _id: req.params.id, userId: req.user.id });
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return null;
  }
  return card;
}

// POST /cards/apply - simulated card application + instant "underwriting".
router.post("/apply", requireAuth, async (req, res) => {
  try {
    const { annualIncome, requestedLimit, cardholderName } = req.body;

    if (!annualIncome || !requestedLimit) {
      return res.status(400).json({ error: "annualIncome and requestedLimit are required" });
    }

    const decision = decideCreditLimit({ annualIncome, requestedLimit });
    if (!decision.approved) {
      return res.status(200).json({ approved: false, reason: decision.reason });
    }

    const fullNumber = generateFakeCardNumber();
    const cvv = generateFakeCvv();
    const expiry = generateExpiry();

    const card = await CreditCard.create({
      userId: req.user.id,
      cardholderName: cardholderName || req.user.name,
      maskedNumber: maskCardNumber(fullNumber),
      last4: fullNumber.slice(-4),
      expiry,
      creditLimit: decision.approvedLimit,
      availableCredit: decision.approvedLimit,
      currentBalance: 0,
      status: "active",
    });

    // The full number and CVV are returned exactly once, at issuance, and
    // are never persisted - same pattern a real issuer follows.
    res.status(201).json({
      approved: true,
      card: card.toPublicJSON(),
      issuance: {
        fullNumber: `${fullNumber.slice(0, 4)} ${fullNumber.slice(4, 8)} ${fullNumber.slice(8, 12)} ${fullNumber.slice(12, 16)}`,
        cvv,
        expiry,
        notice: "This number is shown once and is not stored. It is a synthetic demo number, not a real payment instrument.",
      },
    });
  } catch (err) {
    console.error("apply for card error:", err.message);
    res.status(500).json({ error: "Failed to process card application" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const cards = await CreditCard.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ cards: cards.map((c) => c.toPublicJSON()) });
  } catch (err) {
    console.error("list cards error:", err.message);
    res.status(500).json({ error: "Failed to list cards" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  const card = await loadOwnedCard(req, res);
  if (!card) return;
  res.json({ card: card.toPublicJSON() });
});

router.post("/:id/freeze", requireAuth, async (req, res) => {
  const card = await loadOwnedCard(req, res);
  if (!card) return;
  if (card.status === "closed") {
    return res.status(409).json({ error: "Card is closed and cannot be frozen" });
  }
  card.status = card.status === "frozen" ? "active" : "frozen";
  await card.save();
  res.json({ card: card.toPublicJSON() });
});

router.post("/:id/close", requireAuth, async (req, res) => {
  const card = await loadOwnedCard(req, res);
  if (!card) return;
  card.status = "closed";
  await card.save();
  res.json({ card: card.toPublicJSON() });
});

// POST /cards/:id/payment - simulated payment from an external (unspecified,
// off-screen) funding source. Reduces the balance and frees up credit.
router.post("/:id/payment", requireAuth, async (req, res) => {
  const card = await loadOwnedCard(req, res);
  if (!card) return;

  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }
  if (card.status === "closed") {
    return res.status(409).json({ error: "Card is closed" });
  }
  if (amount > card.currentBalance) {
    return res.status(400).json({ error: "Payment cannot exceed the current balance" });
  }

  try {
    card.currentBalance = Math.round((card.currentBalance - amount) * 100) / 100;
    card.availableCredit = Math.round((card.availableCredit + amount) * 100) / 100;
    await card.save();

    const transaction = await Transaction.create({
      cardId: card._id,
      userId: req.user.id,
      type: "payment",
      merchant: "Payment received",
      category: "payment",
      amount,
      status: "approved",
    });

    res.status(201).json({ card: card.toPublicJSON(), transaction });
  } catch (err) {
    console.error("card payment error:", err.message);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

module.exports = router;
