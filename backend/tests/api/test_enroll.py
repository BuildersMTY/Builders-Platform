# backend/tests/api/test_enroll.py
def test_enroll_creates_enrollment(client):
    resp = client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["course_slug"] == "hello-world"
    assert data["language"] == "go"
    assert data["difficulty"] == "junior"

def test_enroll_seeds_working_files(client):
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    resp = client.get("/api/files/hello-world/go")
    assert resp.status_code == 200
    files = resp.json()
    paths = [f["filepath"] for f in files]
    assert "main.go" in paths

def test_enroll_duplicate_returns_409(client):
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    resp = client.post("/api/enroll/hello-world/go", json={
        "difficulty": "senior",
        "locale": "en",
    })
    assert resp.status_code == 409

def test_enroll_nonexistent_course_returns_404(client):
    resp = client.post("/api/enroll/nonexistent/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    assert resp.status_code == 404
