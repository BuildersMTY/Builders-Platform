# backend/tests/db/test_models.py
from datetime import datetime, timezone
from sqlmodel import Session, create_engine, SQLModel
from api.db.models import Enrollment, WorkingFile, Progress

def _make_engine():
    engine = create_engine("sqlite://", echo=False)
    SQLModel.metadata.create_all(engine)
    return engine

def test_create_enrollment():
    engine = _make_engine()
    with Session(engine) as session:
        enrollment = Enrollment(
            user_id="local",
            course_slug="hello-world",
            language="go",
            difficulty="junior",
            locale="es",
        )
        session.add(enrollment)
        session.commit()
        session.refresh(enrollment)
        assert enrollment.id is not None
        assert enrollment.user_id == "local"
        assert enrollment.course_slug == "hello-world"
        assert enrollment.language == "go"
        assert enrollment.difficulty == "junior"
        assert enrollment.locale == "es"
        assert enrollment.started_at is not None

def test_create_working_file():
    engine = _make_engine()
    with Session(engine) as session:
        wf = WorkingFile(
            user_id="local",
            course_slug="hello-world",
            language="go",
            filepath="main.go",
            content='package main\n\nfunc Hello() string { return "" }',
        )
        session.add(wf)
        session.commit()
        session.refresh(wf)
        assert wf.id is not None
        assert wf.filepath == "main.go"
        assert "package main" in wf.content

def test_create_progress():
    engine = _make_engine()
    with Session(engine) as session:
        prog = Progress(
            user_id="local",
            course_slug="hello-world",
            language="go",
            submodule_id="basics/hello",
        )
        session.add(prog)
        session.commit()
        session.refresh(prog)
        assert prog.id is not None
        assert prog.submodule_id == "basics/hello"
        assert prog.passed_at is not None

def test_enrollment_unique_constraint():
    engine = _make_engine()
    with Session(engine) as session:
        e1 = Enrollment(user_id="local", course_slug="hello-world", language="go", difficulty="junior", locale="es")
        e2 = Enrollment(user_id="local", course_slug="hello-world", language="go", difficulty="senior", locale="en")
        session.add(e1)
        session.commit()
        session.add(e2)
        try:
            session.commit()
            assert False, "Should have raised IntegrityError"
        except Exception:
            session.rollback()
