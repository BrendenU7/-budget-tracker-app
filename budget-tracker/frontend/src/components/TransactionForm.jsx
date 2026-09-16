import { useState } from "react";

const CATEGORIES = [
  "Housing", "Food", "Transportation", "Utilities",
  "Entertainment", "Health", "Savings", "Other",
];

export default function TransactionForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!description.trim() || !amount) {
      setError("Description and amount are required.");
      return;
    }

    try {
      await onAdd({
        description: description.trim(),
        amount: parseFloat(amount),
        category: type === "income" ? "Other" : category,
        type,
        date,
      });
      setDescription("");
      setAmount("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="tx-form">
      <div>
        <label>Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Groceries"
        />
      </div>
      <div>
        <label>Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div>
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div>
        <label>Category</label>
        <select
          value={type === "income" ? "Other" : category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={type === "income"}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label>&nbsp;</label>
        <button type="submit">Add</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
