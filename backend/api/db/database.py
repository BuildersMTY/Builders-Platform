# backend/api/db/database.py
from sqlmodel import Session, SQLModel, create_engine
from api.config import settings

engine = create_engine(settings.database_url, echo=False)


def create_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
