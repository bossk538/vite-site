import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cardApi, transactionApi } from "../api";
import TransactionRow from "../components/TransactionRow.jsx";

const CATEGORIES = ["groceries", "dining", "travel", "entertainment", "utilities", "shopping", "other"];

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("groceries");
  const [amount, setAmount] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const [paymentAmount, setPaymentAmount] = useState("");

  const refresh = useCallback(async () => {
    const [cardData, txnData] = await Promise.all([
      cardApi.get(id),
      transactionApi.list({ cardId: id }),
    ]);
    setCard(cardData);
    setTransactions(txnData);
  }, [id]);

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, [refresh]);

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

  async function handleFreeze() {
    setActionBusy(true);
    setActionError("");
    try {
      const updated = await cardApi.freeze(id);
      setCard(updated);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleClose() {
    setActionBusy(true);
    setActionError("");
    try {
      const updated = await cardApi.close(id);
      setCard(updated);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionBusy(false);
    }
  }

  async function handlePayment(e) {
    e.preventDefault();
    setActionBusy(true);
    setActionError("");
    try {
      await cardApi.pay(id, Number(paymentAmount));
      setPaymentAmount("");
      await refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionBusy(false);
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!card) return <p>Loading card...</p>;

  return (
    <div className="page card-detail">
      <div className="page-header">
        <h1>{card.maskedNumber}</h1>
        <span className={`status-pill status-${card.status}`}>{card.status}</span>
      </div>

      <div className="card-stats">
        <div className="stat-block">
          <span className="stat-label">Balance</span>
          <span className="stat-value">${card.currentBalance.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Available credit</span>
          <span className="stat-value">${card.availableCredit.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Credit limit</span>
          <span className="stat-value">${card.creditLimit.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">APR</span>
          <span className="stat-value">{card.apr}%</span>
        </div>
      </div>

      {actionError && <p className="error">{actionError}</p>}

      <div className="card-actions">
        <button disabled={actionBusy || card.status === "closed"} onClick={handleFreeze}>
          {card.status === "frozen" ? "Unfreeze card" : "Freeze card"}
        </button>
        <button
          className="danger-button"
          disabled={actionBusy || card.status === "closed"}
          onClick={handleClose}
        >
          Close card
        </button>
        <button className="link-button" onClick={() => navigate("/statements")}>
          View statements
        </button>
      </div>

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

        <section className="panel">
          <h2>Make a payment</h2>
          <p className="panel-note">Simulated payment from an off-screen funding source.</p>
          <form onSubmit={handlePayment} className="inline-form">
            <label>
              Amount ($)
              <input
                type="number"
                min="0.01"
                max={card.currentBalance}
                step="0.01"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </label>
            <button type="submit" disabled={actionBusy || card.currentBalance <= 0}>
              {actionBusy ? "Processing..." : "Submit payment"}
            </button>
          </form>
        </section>
      </div>

      <h2>Transaction history</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <ul className="transaction-list">
          {transactions.map((t) => (
            <TransactionRow key={t._id} transaction={t} />
          ))}
        </ul>
      )}
    </div>
  );
}
