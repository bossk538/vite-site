import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Meridian <span>Demo Bank</span>
      </Link>
      {user && (
        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/cards">Cards</Link>
          <Link to="/statements">Statements</Link>
          <span className="nav-user">Hi, {user.name}</span>
          <button className="link-button" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
