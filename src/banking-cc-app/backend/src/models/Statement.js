const mongoose = require("mongoose");

const statementSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditCard", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    previousBalance: { type: Number, required: true },
    purchasesTotal: { type: Number, required: true },
    paymentsTotal: { type: Number, required: true },
    interestCharged: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    minimumPaymentDue: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    transactionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Statement", statementSchema);
