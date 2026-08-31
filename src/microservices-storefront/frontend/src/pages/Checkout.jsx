import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { orderApi } from "../api";

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const order = await orderApi.checkout(address);
      await refresh();
      navigate(`/orders/${order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (cart.items.length === 0) {
    return <p>Your cart is empty — add something before checking out.</p>;
  }

  return (
    <div className="page checkout">
      <h1>Checkout</h1>

      <div className="checkout-summary">
        <h2>Order summary</h2>
        <ul>
          {cart.items.map((item) => (
            <li key={item.productId}>
              {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
        <p className="checkout-total">Total: ${cart.total.toFixed(2)}</p>
      </div>

      <form className="checkout-form" onSubmit={handlePlaceOrder}>
        <h2>Shipping address</h2>
        <label>
          Address line
          <input
            required
            value={address.line1}
            onChange={(e) => updateField("line1", e.target.value)}
          />
        </label>
        <label>
          City
          <input
            required
            value={address.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </label>
        <label>
          State / Province
          <input value={address.state} onChange={(e) => updateField("state", e.target.value)} />
        </label>
        <label>
          Postal code
          <input
            required
            value={address.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
          />
        </label>
        <label>
          Country
          <input
            required
            value={address.country}
            onChange={(e) => updateField("country", e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <p className="payment-note">
          This is a demo storefront — no real payment is collected. Placing the order confirms it
          immediately.
        </p>

        <button type="submit" disabled={placing}>
          {placing ? "Placing order..." : `Place order — $${cart.total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
