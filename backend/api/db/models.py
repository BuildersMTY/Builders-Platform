# backend/api/db/models.py
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, UniqueConstraint


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Enrollment(SQLModel, table=True):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_slug", "language"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    course_slug: str
    language: str
    difficulty: str
    locale: str = "es"
    started_at: datetime = Field(default_factory=_now)


class WorkingFile(SQLModel, table=True):
    __tablename__ = "working_files"
    __table_args__ = (UniqueConstraint("user_id", "course_slug", "language", "filepath"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    course_slug: str
    language: str
    filepath: str
    content: str
    updated_at: datetime = Field(default_factory=_now)


class Progress(SQLModel, table=True):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("user_id", "course_slug", "language", "submodule_id"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    course_slug: str
    language: str
    submodule_id: str
    passed_at: datetime = Field(default_factory=_now)
