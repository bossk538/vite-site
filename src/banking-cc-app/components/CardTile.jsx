import { Link } from "react-router-dom";

const STATUS_LABEL = {
  active: "Active",
  frozen: "Frozen",
  closed: "Closed",
};

export default function CardTile({ card }) {
  return (
    <Link to={`/cards/${card.id}`} className={`card-tile status-tint-${card.status}`}>
      <div className="card-tile-top">
        <span className="card-tile-brand">Meridian</span>
        <span className={`status-pill status-${card.status}`}>{STATUS_LABEL[card.status]}</span>
      </div>
      <div className="card-tile-number">{card.maskedNumber}</div>
      <div className="card-tile-bottom">
        <div>
          <div className="card-tile-label">Cardholder</div>
          <div>{card.cardholderName}</div>
        </div>
        <div>
          <div className="card-tile-label">Expires</div>
          <div>{card.expiry}</div>
        </div>
      </div>
      <div className="card-tile-balance">
        <span>Balance: ${card.currentBalance.toFixed(2)}</span>
        <span>Available: ${card.availableCredit.toFixed(2)}</span>
      </div>
    </Link>
  );
}
