const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listTransactions: (month) =>
    fetch(`${BASE}/transactions${month ? `?month=${month}` : ""}`).then(handle),

  createTransaction: (tx) =>
    fetch(`${BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    }).then(handle),

  deleteTransaction: (id) =>
    fetch(`${BASE}/transactions/${id}`, { method: "DELETE" }).then(handle),

  summary: (month) =>
    fetch(`${BASE}/summary${month ? `?month=${month}` : ""}`).then(handle),

  trend: () => fetch(`${BASE}/trend`).then(handle),

  getGoal: () => fetch(`${BASE}/goal`).then(handle),

  setGoal: (goal) =>
    fetch(`${BASE}/goal`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    }).then(handle),
};
