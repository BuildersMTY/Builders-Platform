# backend/tests/api/test_courses.py
def test_list_courses(client):
    resp = client.get("/api/courses")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    course = data[0]
    assert "slug" in course
    assert "title" in course
    assert "language" in course


def test_list_courses_with_locale(client):
    resp = client.get("/api/courses?locale=en")
    assert resp.status_code == 200
    data = resp.json()
    titles = [c["title"] for c in data]
    assert "Hello World" in titles


def test_get_course_detail(client):
    resp = client.get("/api/courses/hello-world/go")
    assert resp.status_code == 200
    data = resp.json()
    assert data["meta"]["slug"] == "hello-world"
    assert len(data["modules"]) == 1
    assert len(data["modules"][0]["submodules"]) == 2


def test_get_course_detail_english(client):
    resp = client.get("/api/courses/hello-world/go?locale=en")
    assert resp.status_code == 200
    data = resp.json()
    assert data["meta"]["title"] == "Hello World"


def test_get_course_not_found(client):
    resp = client.get("/api/courses/nonexistent/go")
    assert resp.status_code == 404
