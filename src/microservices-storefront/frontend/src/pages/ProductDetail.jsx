import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    productApi
      .get(id)
      .then(setProduct)
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      navigate("/login");
      return;
    }
    setAdding(true);
    setError("");
    try {
      await addItem(product._id, quantity);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  if (error && !product) return <p className="error">{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div className="page product-detail">
      <div className="product-detail-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">No image</div>
        )}
      </div>
      <div className="product-detail-body">
        <p className="product-card-category">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-detail-price">${product.price.toFixed(2)}</p>
        <p>{product.description}</p>
        <p className="stock-note">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>

        <div className="add-to-cart-row">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
          />
          <button disabled={adding || product.stock === 0} onClick={handleAddToCart}>
            {adding ? "Adding..." : "Add to cart"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
