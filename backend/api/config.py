# backend/api/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://buildmancer:buildmancer@localhost:5432/buildmancer"
    runner_url: str = "http://localhost:9000"
    courses_path: str = "./_courses"
    default_user_id: str = "local"
    shark_auth_url: str | None = None
    shark_admin_key: str | None = None

    model_config = {"env_file": "../.env"}


settings = Settings()
