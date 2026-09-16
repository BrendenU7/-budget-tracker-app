export default function TransactionList({ transactions, onDelete }) {
  if (!transactions.length) {
    return <p className="empty">No transactions yet — add one above.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>{t.date}</td>
            <td>{t.description}</td>
            <td>{t.type === "income" ? "Income" : t.category}</td>
            <td className={`amount ${t.type}`}>
              {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
            </td>
            <td>
              <button className="danger" onClick={() => onDelete(t.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
