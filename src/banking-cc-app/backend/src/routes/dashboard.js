const express = require("express");
const CreditCard = require("../models/CreditCard");
const Transaction = require("../models/Transaction");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const SPEND_WINDOW_DAYS = 30;

router.get("/summary", requireAuth, async (req, res) => {
  try {
    const cards = await CreditCard.find({ userId: req.user.id });

    const totals = cards.reduce(
      (acc, card) => {
        if (card.status !== "closed") {
          acc.totalCreditLimit += card.creditLimit;
          acc.totalAvailableCredit += card.availableCredit;
          acc.totalBalance += card.currentBalance;
        }
        return acc;
      },
      { totalCreditLimit: 0, totalAvailableCredit: 0, totalBalance: 0 }
    );

    const windowStart = new Date(Date.now() - SPEND_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const recentPurchases = await Transaction.find({
      userId: req.user.id,
      type: "purchase",
      status: "approved",
      createdAt: { $gte: windowStart },
    }).sort({ createdAt: 1 });

    const spendByCategoryMap = {};
    for (const t of recentPurchases) {
      spendByCategoryMap[t.category] = round2((spendByCategoryMap[t.category] || 0) + t.amount);
    }
    const spendByCategory = Object.entries(spendByCategoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const spendByDayMap = {};
    for (const t of recentPurchases) {
      const day = t.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      spendByDayMap[day] = round2((spendByDayMap[day] || 0) + t.amount);
    }
    // Fill every day in the window (including zero-spend days) so the chart
    // reads as a continuous timeline rather than sparse points.
    const spendOverTime = [];
    for (let i = SPEND_WINDOW_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      spendOverTime.push({ date: key, amount: spendByDayMap[key] || 0 });
    }

    const recentTransactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const thisMonthSpend = round2(recentPurchases.reduce((sum, t) => sum + t.amount, 0));

    res.json({
      totals: {
        totalCreditLimit: round2(totals.totalCreditLimit),
        totalAvailableCredit: round2(totals.totalAvailableCredit),
        totalBalance: round2(totals.totalBalance),
        thisMonthSpend,
        cardCount: cards.filter((c) => c.status !== "closed").length,
      },
      spendByCategory,
      spendOverTime,
      recentTransactions,
    });
  } catch (err) {
    console.error("dashboard summary error:", err.message);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
});

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = router;
