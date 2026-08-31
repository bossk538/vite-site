const express = require("express");
const mongoose = require("mongoose");
const CreditCard = require("../models/CreditCard");
const Statement = require("../models/Statement");
const { requireAuth } = require("../middleware/auth");
const { generateStatement } = require("../services/statementGenerator");

const router = express.Router();

router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { cardId } = req.body;
    if (!cardId || !mongoose.isValidObjectId(cardId)) {
      return res.status(400).json({ error: "A valid cardId is required" });
    }
    const card = await CreditCard.findOne({ _id: cardId, userId: req.user.id });
    if (!card) return res.status(404).json({ error: "Card not found" });

    const statement = await generateStatement(card);
    res.status(201).json({ statement });
  } catch (err) {
    console.error("generate statement error:", err.message);
    res.status(500).json({ error: "Failed to generate statement" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const { cardId } = req.query;
    const filter = { userId: req.user.id };
    if (cardId) {
      if (!mongoose.isValidObjectId(cardId)) {
        return res.status(400).json({ error: "Invalid cardId" });
      }
      filter.cardId = cardId;
    }
    const statements = await Statement.find(filter).sort({ periodEnd: -1 });
    res.json({ statements });
  } catch (err) {
    console.error("list statements error:", err.message);
    res.status(500).json({ error: "Failed to list statements" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid statement id" });
    }
    const statement = await Statement.findOne({ _id: req.params.id, userId: req.user.id }).populate(
      "transactionIds"
    );
    if (!statement) return res.status(404).json({ error: "Statement not found" });
    res.json({ statement });
  } catch (err) {
    console.error("get statement error:", err.message);
    res.status(500).json({ error: "Failed to fetch statement" });
  }
});

module.exports = router;
