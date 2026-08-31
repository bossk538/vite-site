import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import DisclaimerBanner from "./components/DisclaimerBanner.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Cards from "./pages/Cards.jsx";
import ApplyCard from "./pages/ApplyCard.jsx";
import CardDetail from "./pages/CardDetail.jsx";
import Statements from "./pages/Statements.jsx";
import StatementDetail from "./pages/StatementDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function CreditCardApp() {
  return (
    <div className="app">
      <DisclaimerBanner />
      <Navbar />
      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/cards"
            element={
              <RequireAuth>
                <Cards />
              </RequireAuth>
            }
          />
          <Route
            path="/cards/apply"
            element={
              <RequireAuth>
                <ApplyCard />
              </RequireAuth>
            }
          />
          <Route
            path="/cards/:id"
            element={
              <RequireAuth>
                <CardDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/statements"
            element={
              <RequireAuth>
                <Statements />
              </RequireAuth>
            }
          />
          <Route
            path="/statements/:id"
            element={
              <RequireAuth>
                <StatementDetail />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
