# backend/api/dependencies.py
from sqlmodel import Session
from api.db.database import engine


def get_db():
    with Session(engine) as session:
        yield session
