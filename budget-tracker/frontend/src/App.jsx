import { useEffect, useState, useCallback } from "react";
import { api } from "./api";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import { CategoryPie, TrendLine } from "./components/SpendingChart";
import GoalTracker from "./components/GoalTracker";

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export default function App() {
  const [month] = useState(currentMonth());
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, net: 0, by_category: [] });
  const [overallNet, setOverallNet] = useState(0);
  const [trend, setTrend] = useState([]);
  const [goal, setGoal] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [txs, sum, allTimeSum, trendData, goalData] = await Promise.all([
        api.listTransactions(month),
        api.summary(month),
        api.summary(),
        api.trend(),
        api.getGoal(),
      ]);
      setTransactions(txs);
      setSummary(sum);
      setOverallNet(allTimeSum.net);
      setTrend(trendData);
      setGoal(goalData);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        "Couldn't reach the API. Is the Flask backend running on port 5000?"
      );
    }
  }, [month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleAdd(tx) {
    await api.createTransaction(tx);
    await refresh();
  }

  async function handleDelete(id) {
    await api.deleteTransaction(id);
    await refresh();
  }

  async function handleSetGoal(g) {
    await api.setGoal(g);
    await refresh();
  }

  return (
    <div className="app">
      <h1>Budget Tracker</h1>
      <p className="subtitle">Track income, expenses, and a savings goal — {month}</p>

      {loadError && <p className="error">{loadError}</p>}

      <div className="card">
        <h2>This month</h2>
        <div className="summary-row">
          <div className="stat income">
            <div>Income</div>
            <div className="value">${summary.income.toFixed(2)}</div>
          </div>
          <div className="stat expense">
            <div>Expenses</div>
            <div className="value">${summary.expenses.toFixed(2)}</div>
          </div>
          <div className="stat">
            <div>Net</div>
            <div className="value">${summary.net.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Savings goal</h2>
        <GoalTracker goal={goal} netTotal={overallNet} onSetGoal={handleSetGoal} />
      </div>

      <div className="card">
        <h2>Add a transaction</h2>
        <TransactionForm onAdd={handleAdd} />
      </div>

      <div className="grid">
        <div className="card">
          <h2>Spending by category</h2>
          <CategoryPie data={summary.by_category} />
        </div>
        <div className="card">
          <h2>Income vs. expenses</h2>
          <TrendLine data={trend} />
        </div>
      </div>

      <div className="card">
        <h2>Transactions this month</h2>
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      </div>
    </div>
  );
}
