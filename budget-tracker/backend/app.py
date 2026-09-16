"""
Budget Tracker API
A small Flask + SQLite REST API for tracking transactions, categories,
monthly summaries, and savings goal progress.
"""
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Transaction, Goal

VALID_CATEGORIES = [
    "Housing", "Food", "Transportation", "Utilities",
    "Entertainment", "Health", "Savings", "Other",
]


def create_app(db_uri="sqlite:///budget.db"):
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    CORS(app)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})

    @app.route("/api/transactions", methods=["GET"])
    def list_transactions():
        month = request.args.get("month")  # format: YYYY-MM
        query = Transaction.query
        if month:
            query = query.filter(Transaction.date.startswith(month))
        transactions = query.order_by(Transaction.date.desc()).all()
        return jsonify([t.to_dict() for t in transactions])

    @app.route("/api/transactions", methods=["POST"])
    def create_transaction():
        data = request.get_json(force=True)

        required = ["description", "amount", "category", "type", "date"]
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        if data["type"] not in ("income", "expense"):
            return jsonify({"error": "type must be 'income' or 'expense'"}), 400

        if data["category"] not in VALID_CATEGORIES and data["type"] == "expense":
            return jsonify({"error": f"category must be one of {VALID_CATEGORIES}"}), 400

        try:
            amount = float(data["amount"])
        except (TypeError, ValueError):
            return jsonify({"error": "amount must be a number"}), 400

        try:
            datetime.strptime(data["date"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "date must be in YYYY-MM-DD format"}), 400

        t = Transaction(
            description=data["description"],
            amount=amount,
            category=data["category"],
            type=data["type"],
            date=data["date"],
        )
        db.session.add(t)
        db.session.commit()
        return jsonify(t.to_dict()), 201

    @app.route("/api/transactions/<int:tx_id>", methods=["DELETE"])
    def delete_transaction(tx_id):
        t = Transaction.query.get_or_404(tx_id)
        db.session.delete(t)
        db.session.commit()
        return "", 204

    @app.route("/api/summary", methods=["GET"])
    def summary():
        """Monthly income vs. expense totals, plus spend-by-category breakdown."""
        month = request.args.get("month")
        query = Transaction.query
        if month:
            query = query.filter(Transaction.date.startswith(month))
        transactions = query.all()

        income = sum(t.amount for t in transactions if t.type == "income")
        expenses = sum(t.amount for t in transactions if t.type == "expense")

        by_category = {}
        for t in transactions:
            if t.type == "expense":
                by_category[t.category] = by_category.get(t.category, 0) + t.amount

        return jsonify({
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "net": round(income - expenses, 2),
            "by_category": [
                {"category": k, "total": round(v, 2)} for k, v in by_category.items()
            ],
        })

    @app.route("/api/trend", methods=["GET"])
    def trend():
        """Income vs expenses grouped by month, for the trend chart."""
        transactions = Transaction.query.all()
        months = {}
        for t in transactions:
            key = t.date[:7]  # YYYY-MM
            months.setdefault(key, {"month": key, "income": 0, "expenses": 0})
            if t.type == "income":
                months[key]["income"] += t.amount
            else:
                months[key]["expenses"] += t.amount

        ordered = sorted(months.values(), key=lambda m: m["month"])
        for m in ordered:
            m["income"] = round(m["income"], 2)
            m["expenses"] = round(m["expenses"], 2)
        return jsonify(ordered)

    @app.route("/api/goal", methods=["GET"])
    def get_goal():
        goal = Goal.query.first()
        if not goal:
            return jsonify(None)
        return jsonify(goal.to_dict())

    @app.route("/api/goal", methods=["PUT"])
    def set_goal():
        data = request.get_json(force=True)
        try:
            target = float(data["target_amount"])
        except (KeyError, TypeError, ValueError):
            return jsonify({"error": "target_amount must be a number"}), 400

        goal = Goal.query.first()
        if not goal:
            goal = Goal(target_amount=target, name=data.get("name", "Savings Goal"))
            db.session.add(goal)
        else:
            goal.target_amount = target
            goal.name = data.get("name", goal.name)
        db.session.commit()
        return jsonify(goal.to_dict())

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
