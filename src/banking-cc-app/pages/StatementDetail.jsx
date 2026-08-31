import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { statementApi } from "../api";

export default function StatementDetail() {
  const { id } = useParams();
  const [statement, setStatement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    statementApi
      .get(id)
      .then(setStatement)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!statement) return <p>Loading statement...</p>;

  return (
    <div className="page">
      <h1>Statement</h1>
      <p>
        {new Date(statement.periodStart).toLocaleDateString()} –{" "}
        {new Date(statement.periodEnd).toLocaleDateString()}
      </p>

      <div className="statement-summary">
        <div className="stat-block">
          <span className="stat-label">Previous balance</span>
          <span className="stat-value">${statement.previousBalance.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Purchases</span>
          <span className="stat-value">${statement.purchasesTotal.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Payments</span>
          <span className="stat-value">−${statement.paymentsTotal.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Interest charged</span>
          <span className="stat-value">${statement.interestCharged.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">New balance</span>
          <span className="stat-value">${statement.newBalance.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Minimum payment due</span>
          <span className="stat-value">${statement.minimumPaymentDue.toFixed(2)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Due date</span>
          <span className="stat-value">{new Date(statement.dueDate).toLocaleDateString()}</span>
        </div>
      </div>

      <h2>Transactions this cycle</h2>
      {statement.transactionIds.length === 0 ? (
        <p>No transactions this cycle.</p>
      ) : (
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
              {statement.transactionIds.map((t) => (
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
      )}
    </div>
  );
}
