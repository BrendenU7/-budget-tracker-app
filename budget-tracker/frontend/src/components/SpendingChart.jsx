import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#60a5fa", "#f87171", "#34d399", "#fbbf24", "#a78bfa", "#f472b6", "#2dd4bf", "#94a3b8"];

export function CategoryPie({ data }) {
  if (!data.length) {
    return <p className="empty">No expenses this month yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => entry.category}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data }) {
  if (!data.length) {
    return <p className="empty">Add transactions across a few months to see a trend.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} />
        <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
