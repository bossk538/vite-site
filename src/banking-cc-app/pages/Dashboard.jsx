import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../api";
import StatCard from "../components/StatCard.jsx";
import SpendingByCategoryChart from "../components/SpendingByCategoryChart.jsx";
import SpendingOverTimeChart from "../components/SpendingOverTimeChart.jsx";
import TransactionRow from "../components/TransactionRow.jsx";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    dashboardApi
      .summary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!summary) return <p>Loading dashboard...</p>;

  const { totals, spendByCategory, spendOverTime, recentTransactions } = summary;

  if (totals.cardCount === 0) {
    return (
      <div className="page">
        <h1>Welcome to Meridian Demo Bank</h1>
        <p>
          You don't have any cards yet. <Link to="/cards/apply">Apply for one</Link> to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="stat-grid">
        <StatCard label="Total balance" value={`$${totals.totalBalance.toFixed(2)}`} />
        <StatCard label="Available credit" value={`$${totals.totalAvailableCredit.toFixed(2)}`} />
        <StatCard label="Total credit limit" value={`$${totals.totalCreditLimit.toFixed(2)}`} />
        <StatCard label="Spend, last 30 days" value={`$${totals.thisMonthSpend.toFixed(2)}`} />
      </div>

      <div className="dashboard-charts">
        <section className="panel">
          <h2>Spending by category</h2>
          <p className="panel-note">Last 30 days, approved purchases only.</p>
          <SpendingByCategoryChart data={spendByCategory} />
        </section>

        <section className="panel">
          <h2>Spending over time</h2>
          <p className="panel-note">Last 30 days.</p>
          <SpendingOverTimeChart data={spendOverTime} />
        </section>
      </div>

      <div className="page-header">
        <h2>Recent activity</h2>
        <button className="link-button" onClick={() => setShowTable((v) => !v)}>
          {showTable ? "Hide table view" : "Show table view"}
        </button>
      </div>

      {recentTransactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : showTable ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <tr key={t._id}>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>{t.merchant}</td>
                  <td>{t.category}</td>
                  <td>{t.status}</td>
                  <td>${t.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="transaction-list">
          {recentTransactions.map((t) => (
            <TransactionRow key={t._id} transaction={t} />
          ))}
        </ul>
      )}
    </div>
  );
}
