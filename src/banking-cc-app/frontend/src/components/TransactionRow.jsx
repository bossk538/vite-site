const CATEGORY_LABEL = {
  groceries: "Groceries",
  dining: "Dining",
  travel: "Travel",
  entertainment: "Entertainment",
  utilities: "Utilities",
  shopping: "Shopping",
  other: "Other",
  payment: "Payment",
};

export default function TransactionRow({ transaction }) {
  const isPayment = transaction.type === "payment";
  const sign = isPayment ? "−" : "";
  return (
    <li className="transaction-row">
      <div className="transaction-row-main">
        <p className="transaction-merchant">{transaction.merchant}</p>
        <p className="transaction-meta">
          {CATEGORY_LABEL[transaction.category] || transaction.category} ·{" "}
          {new Date(transaction.createdAt).toLocaleString()}
        </p>
        {transaction.status === "declined" && (
          <p className="transaction-declined">Declined — {transaction.declineReason}</p>
        )}
      </div>
      <div
        className={`transaction-amount ${
          transaction.status === "declined" ? "amount-declined" : isPayment ? "amount-payment" : ""
        }`}
      >
        {sign}${transaction.amount.toFixed(2)}
      </div>
    </li>
  );
}
