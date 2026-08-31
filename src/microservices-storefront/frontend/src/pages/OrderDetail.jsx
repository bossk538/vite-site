import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { orderApi } from "../api";

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    orderApi
      .get(id)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p>Loading order...</p>;

  return (
    <div className="page">
      {location.state?.justPlaced && (
        <p className="success">Thanks — your order has been placed!</p>
      )}
      <h1>Order #{order._id.slice(-6)}</h1>
      <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>
      <p className={`status status-${order.status}`}>{order.status}</p>

      <ul className="cart-list">
        {order.items.map((item) => (
          <li key={item.productId} className="cart-row">
            <div className="cart-row-body">
              <p className="cart-row-name">{item.name}</p>
              <p className="cart-row-price">
                ${item.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <p className="cart-row-subtotal">${(item.price * item.quantity).toFixed(2)}</p>
          </li>
        ))}
      </ul>

      <p className="checkout-total">Total: ${order.total.toFixed(2)}</p>

      {order.shippingAddress && (
        <div className="shipping-address">
          <h2>Shipping to</h2>
          <p>{order.shippingAddress.line1}</p>
          <p>
            {order.shippingAddress.city}
            {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
            {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
      )}
    </div>
  );
}
