import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">No image</div>
        )}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="product-card-category">{product.category}</p>
        <p className="product-card-price">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
