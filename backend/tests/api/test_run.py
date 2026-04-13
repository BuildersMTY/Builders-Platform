# backend/tests/api/test_run.py
import pytest

@pytest.fixture
def enrolled_client(client):
    client.post("/api/enroll/hello-world/go", json={"difficulty": "junior", "locale": "es"})
    return client

def test_run_returns_run_id(enrolled_client):
    resp = enrolled_client.post("/api/run/hello-world/go/basics/hello")
    assert resp.status_code == 200
    data = resp.json()
    assert "run_id" in data

def test_run_not_enrolled(client):
    resp = client.post("/api/run/hello-world/go/basics/hello")
    assert resp.status_code == 404

def test_run_invalid_submodule(enrolled_client):
    resp = enrolled_client.post("/api/run/hello-world/go/nonexistent/sub")
    assert resp.status_code == 404
