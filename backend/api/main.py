# backend/api/main.py
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from api.config import settings
from api.course_loader import cache as course_cache
from api.db.database import create_tables
from api.routers import courses


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    course_cache.load_all(Path(settings.courses_path))
    yield


app = FastAPI(title="Buildmancer API", lifespan=lifespan)
app.include_router(courses.router)
