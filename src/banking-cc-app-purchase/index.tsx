import React, { useState } from 'react';

const CATEGORIES = ["groceries", "dining", "travel", "entertainment", "utilities", "shopping", "other"];

export const SimulatePurchase = () => {
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("groceries");
  const [amount, setAmount] = useState("");
  const [lastResult, setLastResult] = useState(null);

  async function handleSimulatePurchase(e) {
    e.preventDefault();
    setActionBusy(true);
    setActionError("");
    setLastResult(null);
    try {
      const data = await transactionApi.simulate({
        cardId: id,
        merchant,
        category,
        amount: Number(amount),
      });
      setLastResult(data.transaction);
      setMerchant("");
      setAmount("");
      await refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionBusy(false);
    }
  }

  return (
        <div className="card-detail-grid">
        <section className="panel">
          <h2>Simulate a purchase (demo)</h2>
          <p className="panel-note">
            There's no real merchant network — use this to generate transaction activity and see
            the authorization rules in action.
          </p>
          <form onSubmit={handleSimulatePurchase} className="inline-form">
            <label>
              Merchant
              <input required value={merchant} onChange={(e) => setMerchant(e.target.value)} />
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount ($)
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <button type="submit" disabled={actionBusy}>
              {actionBusy ? "Processing..." : "Run transaction"}
            </button>
          </form>
          {lastResult && (
            <p className={lastResult.status === "approved" ? "success" : "error"}>
              {lastResult.status === "approved"
                ? `Approved — $${lastResult.amount.toFixed(2)} at ${lastResult.merchant}`
                : `Declined — ${lastResult.declineReason}`}
            </p>
          )}
        </section>
      </div>
  );
};
