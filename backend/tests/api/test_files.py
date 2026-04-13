import pytest


@pytest.fixture
def enrolled_client(client):
    client.post("/api/enroll/hello-world/go", json={"difficulty": "junior", "locale": "es"})
    return client


def test_get_files(enrolled_client):
    resp = enrolled_client.get("/api/files/hello-world/go")
    assert resp.status_code == 200
    files = resp.json()
    assert len(files) >= 1
    assert all("filepath" in f and "content" in f for f in files)


def test_get_files_not_enrolled(client):
    resp = client.get("/api/files/hello-world/go")
    assert resp.status_code == 404


def test_patch_file(enrolled_client):
    new_content = 'package main\n\nfunc Hello() string { return "Hello, World!" }'
    resp = enrolled_client.patch("/api/files/hello-world/go/main.go", json={"content": new_content})
    assert resp.status_code == 200
    resp = enrolled_client.get("/api/files/hello-world/go")
    files = resp.json()
    main_go = next(f for f in files if f["filepath"] == "main.go")
    assert main_go["content"] == new_content


def test_patch_file_not_enrolled(client):
    resp = client.patch("/api/files/hello-world/go/main.go", json={"content": "test"})
    assert resp.status_code == 404


def test_patch_file_nested_path(enrolled_client):
    resp = enrolled_client.patch("/api/files/hello-world/go/internal/parser.go", json={"content": "package internal"})
    assert resp.status_code == 200
    resp = enrolled_client.get("/api/files/hello-world/go")
    files = resp.json()
    paths = [f["filepath"] for f in files]
    assert "internal/parser.go" in paths
