import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Aisle
      </Link>
      <nav className="nav-links">
        <Link to="/cart">Cart{itemCount > 0 ? ` (${itemCount})` : ""}</Link>
        {user ? (
          <>
            <Link to="/orders">Orders</Link>
            <span className="nav-user">Hi, {user.name}</span>
            <button className="link-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
