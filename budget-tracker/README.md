# Budget Tracker

A full-stack expense and savings-goal tracker: log income/expenses, see
spending broken down by category, track an income-vs-expenses trend over
time, and watch progress toward a savings goal.

Built to round out a resume with the stack a typical software engineering
internship posting asks for: **React** on the frontend, **Python/Flask**
on the backend, a **SQL** database, **data visualization** (Recharts),
**CI** (GitHub Actions), and a deploy path to **AWS**.

## Stack

- **Frontend:** React + Vite, Recharts for charts
- **Backend:** Flask + Flask-SQLAlchemy REST API
- **Database:** SQLite (swap the connection string for Postgres/MySQL in production)
- **Tests:** pytest (backend)
- **CI:** GitHub Actions — runs backend tests and a frontend build on every push

## Project structure

```
budget-tracker/
├── backend/
│   ├── app.py          # Flask app + all API routes (factory pattern)
│   ├── models.py        # SQLAlchemy models: Transaction, Goal
│   ├── test_app.py      # pytest suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── components/  # TransactionForm, TransactionList, SpendingChart, GoalTracker
│   └── package.json
└── .github/workflows/ci.yml
```

## Running locally

**Backend** (from `backend/`):
```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py          # runs on http://localhost:5000
```

**Frontend** (from `frontend/`, in a second terminal):
```bash
npm install
npm run dev             # runs on http://localhost:5173, proxies /api to :5000
```

**Run the tests:**
```bash
cd backend && pytest -q
```

## API endpoints

| Method | Route                       | Purpose                              |
|--------|------------------------------|---------------------------------------|
| GET    | `/api/transactions?month=YYYY-MM` | List transactions, optionally by month |
| POST   | `/api/transactions`          | Create a transaction                  |
| DELETE | `/api/transactions/<id>`     | Delete a transaction                  |
| GET    | `/api/summary?month=YYYY-MM` | Income/expense/net totals + category breakdown |
| GET    | `/api/trend`                 | Income vs. expenses grouped by month  |
| GET    | `/api/goal`                  | Current savings goal                  |
| PUT    | `/api/goal`                  | Set/update the savings goal           |

## Deploying to AWS (free-tier friendly)

**Backend — Elastic Beanstalk (simplest) or EC2:**
1. `pip freeze > requirements.txt` (already included)
2. Install the EB CLI: `pip install awsebcli`
3. From `backend/`: `eb init -p python-3.12 budget-tracker` then `eb create budget-tracker-env`
4. Note the environment URL EB gives you — you'll point the frontend at it.
5. For a production database, swap `SQLALCHEMY_DATABASE_URI` for an RDS Postgres/MySQL instance instead of SQLite.

**Frontend — S3 + CloudFront, or Amplify (simplest):**
1. `npm run build` produces `frontend/dist/`
2. Easiest path: connect the repo in **AWS Amplify Hosting** and point it at `frontend/`, build command `npm run build`, output dir `dist`.
3. Manual path: create an S3 bucket with static website hosting enabled, `aws s3 sync dist/ s3://your-bucket-name`, then front it with CloudFront for HTTPS.
4. Before building for production, point `frontend/src/api.js`'s `BASE` constant (or set a `VITE_API_URL` env var) at your deployed backend URL instead of the local `/api` proxy.

## Possible extensions

- Swap SQLite for Postgres via RDS
- Add user accounts/auth (Flask-Login or AWS Cognito)
- Recurring transactions
- Export to CSV
