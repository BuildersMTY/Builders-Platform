# backend/tests/course_loader/test_loader.py
from pathlib import Path
import pytest
from api.course_loader.loader import load_course, load_all_courses, ValidationError


def test_load_course_parses_yaml(hello_world_path: Path):
    course = load_course(hello_world_path)
    assert course.meta.slug == "hello-world"
    assert course.meta.language == "go"
    assert course.meta.title == "Hola Mundo"
    assert len(course.modules) == 1
    assert len(course.modules[0].submodules) == 2


def test_load_course_sets_full_ids(hello_world_path: Path):
    course = load_course(hello_world_path)
    subs = course.modules[0].submodules
    assert subs[0].full_id == "basics/hello"
    assert subs[1].full_id == "basics/echo"


def test_load_course_validates_stub_paths(hello_world_path: Path, tmp_path: Path):
    import shutil, yaml
    broken = tmp_path / "broken" / "go"
    shutil.copytree(hello_world_path, broken)
    with open(broken / "course.yaml") as f:
        data = yaml.safe_load(f)
    data["modules"][0]["submodules"][0]["stubs"][0]["path"] = "nonexistent.go"
    with open(broken / "course.yaml", "w") as f:
        yaml.dump(data, f)
    with pytest.raises(ValidationError, match="nonexistent.go"):
        load_course(broken)


def test_load_course_validates_resource_paths(hello_world_path: Path, tmp_path: Path):
    import shutil, yaml
    broken = tmp_path / "broken" / "go"
    shutil.copytree(hello_world_path, broken)
    with open(broken / "course.yaml") as f:
        data = yaml.safe_load(f)
    data["modules"][0]["submodules"][0]["resources"][0]["file"] = "missing.md"
    with open(broken / "course.yaml", "w") as f:
        yaml.dump(data, f)
    with pytest.raises(ValidationError, match="missing.md"):
        load_course(broken)


def test_load_course_validates_script_paths(hello_world_path: Path, tmp_path: Path):
    import shutil, yaml
    broken = tmp_path / "broken" / "go"
    shutil.copytree(hello_world_path, broken)
    with open(broken / "course.yaml") as f:
        data = yaml.safe_load(f)
    data["modules"][0]["submodules"][1]["tests"][1]["file"] = "tests/missing.sh"
    with open(broken / "course.yaml", "w") as f:
        yaml.dump(data, f)
    with pytest.raises(ValidationError, match="missing.sh"):
        load_course(broken)


def test_load_all_courses(courses_path: Path):
    courses = load_all_courses(courses_path)
    assert len(courses) >= 1
    slugs = [c.meta.slug for c in courses]
    assert "hello-world" in slugs
