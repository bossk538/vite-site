const mongoose = require("mongoose");

const CATEGORIES = [
  "groceries",
  "dining",
  "travel",
  "entertainment",
  "utilities",
  "shopping",
  "other",
  "payment",
];

const transactionSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditCard", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["purchase", "payment"], required: true },
    merchant: { type: String, default: "" },
    category: { type: String, enum: CATEGORIES, default: "other" },
    amount: { type: Number, required: true, min: 0.01 },
    status: { type: String, enum: ["approved", "declined"], required: true },
    declineReason: { type: String, default: null },
  },
  { timestamps: true }
);

transactionSchema.index({ cardId: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
module.exports.CATEGORIES = CATEGORIES;
