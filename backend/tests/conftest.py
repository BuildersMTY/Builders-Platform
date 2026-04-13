# backend/tests/conftest.py
from pathlib import Path
import pytest
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine
from fastapi.testclient import TestClient
from api.course_loader import cache as course_cache
from api.db.models import Enrollment, WorkingFile, Progress  # noqa: F401 — needed for metadata
from api.dependencies import get_db

FIXTURES_PATH = Path(__file__).parent / "fixtures"

_test_engine = create_engine(
    "sqlite://",
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@pytest.fixture
def courses_path() -> Path:
    return FIXTURES_PATH / "courses"


@pytest.fixture
def hello_world_path(courses_path: Path) -> Path:
    return courses_path / "hello-world" / "go"


@pytest.fixture
def db_session():
    SQLModel.metadata.create_all(_test_engine)
    with Session(_test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(_test_engine)


@pytest.fixture
def client(courses_path, db_session, monkeypatch):
    from api.main import app
    from api.config import settings
    import api.db.database as db_module
    course_cache.load_all(courses_path)
    settings.courses_path = str(courses_path)
    settings.default_user_id = "test-user"
    import api.main as main_module
    monkeypatch.setattr(db_module, "create_tables", lambda: None)
    monkeypatch.setattr(main_module, "create_tables", lambda: None)

    def _override_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
