const mongoose = require("mongoose");

const creditCardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cardholderName: { type: String, required: true },
    // We deliberately never persist the full card number or CVV anywhere -
    // only a masked display string and the last 4 digits, mirroring real
    // PCI-DSS handling even though this data is entirely synthetic.
    maskedNumber: { type: String, required: true },
    last4: { type: String, required: true },
    expiry: { type: String, required: true }, // "MM/YY"
    creditLimit: { type: Number, required: true, min: 0 },
    availableCredit: { type: Number, required: true, min: 0 },
    currentBalance: { type: Number, required: true, default: 0, min: 0 },
    apr: { type: Number, required: true, default: 24.99 },
    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active",
    },
    lastStatementDate: { type: Date, default: null },
  },
  { timestamps: true }
);

creditCardSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    cardholderName: this.cardholderName,
    maskedNumber: this.maskedNumber,
    last4: this.last4,
    expiry: this.expiry,
    creditLimit: this.creditLimit,
    availableCredit: this.availableCredit,
    currentBalance: this.currentBalance,
    apr: this.apr,
    status: this.status,
    lastStatementDate: this.lastStatementDate,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("CreditCard", creditCardSchema);
