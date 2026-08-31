import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    orderApi
      .list()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page">
      <h1>Your orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order._id} className="order-row">
              <Link to={`/orders/${order._id}`}>
                <span>Order #{order._id.slice(-6)}</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className={`status status-${order.status}`}>{order.status}</span>
                <span>${order.total.toFixed(2)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
