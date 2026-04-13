import pytest


@pytest.fixture
def enrolled_client(client):
    client.post("/api/enroll/hello-world/go", json={"difficulty": "junior", "locale": "es"})
    return client


def test_get_resources_junior(enrolled_client):
    resp = enrolled_client.get("/api/resources/hello-world/go/basics/hello")
    assert resp.status_code == 200
    resources = resp.json()
    assert len(resources) == 2  # doc + hint (junior sees both)
    types = [r["type"] for r in resources]
    assert "doc" in types
    assert "hint" in types
    assert all("content" in r for r in resources)


def test_get_resources_senior_no_hints(client):
    client.post("/api/enroll/hello-world/go", json={"difficulty": "senior", "locale": "es"})
    resp = client.get("/api/resources/hello-world/go/basics/hello")
    assert resp.status_code == 200
    resources = resp.json()
    types = [r["type"] for r in resources]
    assert "hint" not in types


def test_get_resources_english(client):
    client.post("/api/enroll/hello-world/go", json={"difficulty": "junior", "locale": "en"})
    resp = client.get("/api/resources/hello-world/go/basics/hello")
    assert resp.status_code == 200
    resources = resp.json()
    doc = next(r for r in resources if r["type"] == "doc")
    assert "The fmt package" in doc["content"]


def test_get_resources_not_enrolled(client):
    resp = client.get("/api/resources/hello-world/go/basics/hello")
    assert resp.status_code == 404
