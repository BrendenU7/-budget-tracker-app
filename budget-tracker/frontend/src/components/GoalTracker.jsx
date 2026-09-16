import { useState } from "react";

export default function GoalTracker({ goal, netTotal, onSetGoal }) {
  const [editing, setEditing] = useState(!goal);
  const [target, setTarget] = useState(goal?.target_amount || "");

  const progress = goal && goal.target_amount > 0
    ? Math.max(0, Math.min(100, (netTotal / goal.target_amount) * 100))
    : 0;

  async function handleSave(e) {
    e.preventDefault();
    if (!target) return;
    await onSetGoal({ name: "Savings Goal", target_amount: parseFloat(target) });
    setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          step="0.01"
          placeholder="Target amount, e.g. 5000"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <button type="submit">Set goal</button>
      </form>
    );
  }

  return (
    <div>
      <div className="summary-row">
        <span>
          ${netTotal.toFixed(2)} saved toward ${goal.target_amount.toFixed(2)}
        </span>
        <button className="danger" onClick={() => setEditing(true)}>
          Edit goal
        </button>
      </div>
      <div className="goal-bar-track">
        <div className="goal-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
