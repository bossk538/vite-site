const express = require("express");
const mongoose = require("mongoose");
const CreditCard = require("../models/CreditCard");
const Transaction = require("../models/Transaction");
const { requireAuth } = require("../middleware/auth");
const { evaluatePurchase } = require("../services/transactionRules");

const router = express.Router();

// POST /transactions - simulate a card-present/card-not-present purchase.
// There is no real merchant network here; this endpoint stands in for one so
// the demo has a way to generate realistic transaction activity.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { cardId, merchant, category, amount } = req.body;

    if (!cardId || !mongoose.isValidObjectId(cardId)) {
      return res.status(400).json({ error: "A valid cardId is required" });
    }
    if (!merchant || typeof merchant !== "string") {
      return res.status(400).json({ error: "merchant is required" });
    }
    const parsedAmount = Math.round(Number(amount) * 100) / 100;

    const card = await CreditCard.findOne({ _id: cardId, userId: req.user.id });
    if (!card) return res.status(404).json({ error: "Card not found" });

    const decision = await evaluatePurchase({ card, amount: parsedAmount });

    const transaction = await Transaction.create({
      cardId: card._id,
      userId: req.user.id,
      type: "purchase",
      merchant,
      category: category || "other",
      amount: parsedAmount > 0 ? parsedAmount : 0,
      status: decision.approved ? "approved" : "declined",
      declineReason: decision.approved ? null : decision.reason,
    });

    if (decision.approved) {
      card.availableCredit = Math.round((card.availableCredit - parsedAmount) * 100) / 100;
      card.currentBalance = Math.round((card.currentBalance + parsedAmount) * 100) / 100;
      await card.save();
    }

    res.status(decision.approved ? 201 : 200).json({
      transaction,
      card: card.toPublicJSON(),
    });
  } catch (err) {
    console.error("create transaction error:", err.message);
    res.status(500).json({ error: "Failed to process transaction" });
  }
});

// GET /transactions?cardId=&status=&category=&from=&to=&limit=
router.get("/", requireAuth, async (req, res) => {
  try {
    const { cardId, status, category, from, to, limit = 50 } = req.query;
    const filter = { userId: req.user.id };

    if (cardId) {
      if (!mongoose.isValidObjectId(cardId)) {
        return res.status(400).json({ error: "Invalid cardId" });
      }
      filter.cardId = cardId;
    }
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum);

    res.json({ transactions });
  } catch (err) {
    console.error("list transactions error:", err.message);
    res.status(500).json({ error: "Failed to list transactions" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid transaction id" });
    }
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    res.json({ transaction });
  } catch (err) {
    console.error("get transaction error:", err.message);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

module.exports = router;
