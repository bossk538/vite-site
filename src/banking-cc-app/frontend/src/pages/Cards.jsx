import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cardApi } from "../api";
import CardTile from "../components/CardTile.jsx";

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cardApi
      .list()
      .then(setCards)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your cards</h1>
        <Link to="/cards/apply">
          <button>Apply for a card</button>
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading cards...</p>
      ) : cards.length === 0 ? (
        <p>
          You don't have any cards yet. <Link to="/cards/apply">Apply for one</Link>.
        </p>
      ) : (
        <div className="card-grid">
          {cards.map((card) => (
            <CardTile key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
