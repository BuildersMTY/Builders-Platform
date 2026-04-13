# backend/tests/conftest.py
from pathlib import Path
import pytest

FIXTURES_PATH = Path(__file__).parent / "fixtures"


@pytest.fixture
def courses_path() -> Path:
    return FIXTURES_PATH / "courses"


@pytest.fixture
def hello_world_path(courses_path: Path) -> Path:
    return courses_path / "hello-world" / "go"
