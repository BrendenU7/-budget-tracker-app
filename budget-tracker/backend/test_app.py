import os
import tempfile
import pytest
from app import create_app


@pytest.fixture
def client():
    db_fd, db_path = tempfile.mkstemp()
    app = create_app(db_uri=f"sqlite:///{db_path}")
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client

    os.close(db_fd)
    os.unlink(db_path)


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.get_json()["status"] == "ok"


def test_create_and_list_transaction(client):
    payload = {
        "description": "Groceries",
        "amount": 54.20,
        "category": "Food",
        "type": "expense",
        "date": "2026-09-01",
    }
    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 201
    body = res.get_json()
    assert body["description"] == "Groceries"

    res = client.get("/api/transactions")
    assert res.status_code == 200
    assert len(res.get_json()) == 1


def test_create_transaction_missing_field(client):
    res = client.post("/api/transactions", json={"description": "Oops"})
    assert res.status_code == 400


def test_create_transaction_invalid_type(client):
    payload = {
        "description": "Freelance",
        "amount": 100,
        "category": "Other",
        "type": "not_a_type",
        "date": "2026-09-01",
    }
    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 400


def test_summary(client):
    client.post("/api/transactions", json={
        "description": "Paycheck", "amount": 2000,
        "category": "Other", "type": "income", "date": "2026-09-01",
    })
    client.post("/api/transactions", json={
        "description": "Rent", "amount": 900,
        "category": "Housing", "type": "expense", "date": "2026-09-02",
    })
    res = client.get("/api/summary?month=2026-09")
    body = res.get_json()
    assert body["income"] == 2000
    assert body["expenses"] == 900
    assert body["net"] == 1100
    assert body["by_category"][0]["category"] == "Housing"


def test_delete_transaction(client):
    res = client.post("/api/transactions", json={
        "description": "Coffee", "amount": 5,
        "category": "Food", "type": "expense", "date": "2026-09-03",
    })
    tx_id = res.get_json()["id"]
    res = client.delete(f"/api/transactions/{tx_id}")
    assert res.status_code == 204
    res = client.get("/api/transactions")
    assert len(res.get_json()) == 0


def test_goal_set_and_get(client):
    res = client.put("/api/goal", json={"target_amount": 5000, "name": "Emergency Fund"})
    assert res.status_code == 200
    res = client.get("/api/goal")
    body = res.get_json()
    assert body["target_amount"] == 5000
    assert body["name"] == "Emergency Fund"
