import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useState } from "react";

export default function Cart() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleQuantityChange(productId, quantity) {
    if (quantity < 1) return;
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(productId) {
    try {
      await removeItem(productId);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="page">
      <h1>Your cart</h1>
      {error && <p className="error">{error}</p>}
      {cart.items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/">Continue shopping</Link>.
        </p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.items.map((item) => (
              <li key={item.productId} className="cart-row">
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                <div className="cart-row-body">
                  <p className="cart-row-name">{item.name}</p>
                  <p className="cart-row-price">${item.price.toFixed(2)} each</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 1)
                  }
                />
                <p className="cart-row-subtotal">${(item.price * item.quantity).toFixed(2)}</p>
                <button className="link-button" onClick={() => handleRemove(item.productId)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <p>Total: ${cart.total.toFixed(2)}</p>
            <button onClick={() => navigate("/checkout")}>Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}
