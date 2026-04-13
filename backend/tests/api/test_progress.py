import pytest


@pytest.fixture
def enrolled_client(client):
    client.post("/api/enroll/hello-world/go", json={"difficulty": "junior", "locale": "es"})
    return client


def test_get_progress_empty(enrolled_client):
    resp = enrolled_client.get("/api/progress/hello-world/go")
    assert resp.status_code == 200
    data = resp.json()
    assert data["passed"] == []
    assert data["difficulty"] == "junior"


def test_get_progress_not_enrolled(client):
    resp = client.get("/api/progress/hello-world/go")
    assert resp.status_code == 404
