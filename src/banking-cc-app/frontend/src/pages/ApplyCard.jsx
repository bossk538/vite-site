import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cardApi } from "../api";
import { useAuth } from "../context/AuthContext.jsx";

export default function ApplyCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cardholderName, setCardholderName] = useState(user?.name || "");
  const [annualIncome, setAnnualIncome] = useState("");
  const [requestedLimit, setRequestedLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = await cardApi.apply({
        cardholderName,
        annualIncome: Number(annualIncome),
        requestedLimit: Number(requestedLimit),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.approved) {
    return (
      <div className="page apply-result">
        <h1>Application approved</h1>
        <div className="issuance-card">
          <p className="issuance-warning">
            This number and CVV are shown once and are never stored. This is a synthetic demo
            number — it cannot be used anywhere.
          </p>
          <div className="issuance-number">{result.issuance.fullNumber}</div>
          <div className="issuance-row">
            <span>Expiry: {result.issuance.expiry}</span>
            <span>CVV: {result.issuance.cvv}</span>
          </div>
          <div className="issuance-row">
            <span>Credit limit: ${result.card.creditLimit.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={() => navigate(`/cards/${result.card.id}`)}>Go to card</button>
      </div>
    );
  }

  if (result && !result.approved) {
    return (
      <div className="page">
        <h1>Application not approved</h1>
        <p className="error">Reason: {result.reason}</p>
        <button onClick={() => setResult(null)}>Try again</button>
      </div>
    );
  }

  return (
    <div className="page apply-page">
      <h1>Apply for a card</h1>
      <p className="auth-note">
        Approval uses simplified demo underwriting (roughly 15% of stated annual income, capped
        between $500–$25,000) — not a real credit decision.
      </p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Cardholder name
          <input
            required
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
        </label>
        <label>
          Annual income ($)
          <input
            type="number"
            min="0"
            required
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
          />
        </label>
        <label>
          Requested credit limit ($)
          <input
            type="number"
            min="0"
            required
            value={requestedLimit}
            onChange={(e) => setRequestedLimit(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit application"}
        </button>
      </form>
    </div>
  );
}
