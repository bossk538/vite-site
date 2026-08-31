const Transaction = require("../models/Transaction");
const Statement = require("../models/Statement");

const MIN_PAYMENT_FLOOR = 25;
const MIN_PAYMENT_RATE = 0.02;
const DUE_DATE_OFFSET_DAYS = 21; // typical grace period before a payment is due

// Closes out a billing cycle for a card: sums activity since the last
// statement (or since the card was opened, for the first one), applies a
// simplified interest charge on any carried balance, and records the result.
// In a real system this would run on a schedule per card; here it's
// triggered on demand so the demo doesn't need a job scheduler.
async function generateStatement(card) {
  const periodStart = card.lastStatementDate || card.createdAt;
  const periodEnd = new Date();

  const transactions = await Transaction.find({
    cardId: card._id,
    createdAt: { $gte: periodStart, $lte: periodEnd },
  }).sort({ createdAt: 1 });

  const purchasesTotal = round2(
    transactions
      .filter((t) => t.type === "purchase" && t.status === "approved")
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const paymentsTotal = round2(
    transactions
      .filter((t) => t.type === "payment" && t.status === "approved")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const lastStatement = await Statement.findOne({ cardId: card._id }).sort({ periodEnd: -1 });
  const previousBalance = lastStatement ? lastStatement.newBalance : 0;

  const interestCharged = previousBalance > 0 ? round2(previousBalance * (card.apr / 100 / 12)) : 0;

  const newBalance = round2(previousBalance + purchasesTotal - paymentsTotal + interestCharged);
  const minimumPaymentDue = newBalance <= 0
    ? 0
    : round2(Math.max(MIN_PAYMENT_FLOOR, newBalance * MIN_PAYMENT_RATE, 0));
  const cappedMinimumPaymentDue = Math.min(minimumPaymentDue, Math.max(newBalance, 0));

  const dueDate = new Date(periodEnd);
  dueDate.setDate(dueDate.getDate() + DUE_DATE_OFFSET_DAYS);

  const statement = await Statement.create({
    cardId: card._id,
    userId: card.userId,
    periodStart,
    periodEnd,
    previousBalance,
    purchasesTotal,
    paymentsTotal,
    interestCharged,
    newBalance,
    minimumPaymentDue: cappedMinimumPaymentDue,
    dueDate,
    transactionIds: transactions.map((t) => t._id),
  });

  // Interest is a real charge against the card, so it also lands on the
  // live balance/available credit - not just the statement snapshot.
  if (interestCharged > 0) {
    card.currentBalance = round2(card.currentBalance + interestCharged);
    card.availableCredit = round2(Math.max(0, card.availableCredit - interestCharged));
  }
  card.lastStatementDate = periodEnd;
  await card.save();

  return statement;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { generateStatement };
