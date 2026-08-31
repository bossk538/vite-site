import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cardApi, statementApi } from "../api";

export default function Statements() {
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cardApi
      .list()
      .then((data) => {
        setCards(data);
        if (data.length > 0) setSelectedCardId(data[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCardId) return;
    statementApi.list(selectedCardId).then(setStatements).catch((err) => setError(err.message));
  }, [selectedCardId]);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      await statementApi.generate(selectedCardId);
      const updated = await statementApi.list(selectedCardId);
      setStatements(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (cards.length === 0) {
    return (
      <p>
        You don't have any cards yet. <Link to="/cards/apply">Apply for one</Link>.
      </p>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Statements</h1>
        <button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate statement for current cycle"}
        </button>
      </div>

      <label className="statement-card-select">
        Card
        <select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)}>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.maskedNumber}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}

      {statements.length === 0 ? (
        <p>No statements yet for this card — generate one above.</p>
      ) : (
        <ul className="order-list">
          {statements.map((s) => (
            <li key={s._id} className="order-row">
              <Link to={`/statements/${s._id}`}>
                <span>
                  {new Date(s.periodStart).toLocaleDateString()} –{" "}
                  {new Date(s.periodEnd).toLocaleDateString()}
                </span>
                <span>New balance: ${s.newBalance.toFixed(2)}</span>
                <span>Min due: ${s.minimumPaymentDue.toFixed(2)}</span>
                <span>Due {new Date(s.dueDate).toLocaleDateString()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
