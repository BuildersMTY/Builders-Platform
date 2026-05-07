# backend/api/dependencies.py
import httpx
from fastapi import Request, HTTPException
from sqlmodel import Session
from api.db.database import engine
from api.config import settings


def get_db():
    with Session(engine) as session:
        yield session


async def get_current_user(request: Request) -> str:
    """Validate session cookie against SharkAuth and return user_id.

    Falls back to settings.default_user_id when SharkAuth is not configured
    or unreachable (dev mode).
    """
    if not settings.shark_auth_url:
        return settings.default_user_id

    cookie = request.headers.get("cookie", "")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{settings.shark_auth_url}/api/v1/auth/me",
                headers={"Cookie": cookie},
                timeout=5.0,
            )
    except Exception:
        # SharkAuth unreachable — fallback for local dev
        return settings.default_user_id

    if resp.status_code == 200:
        data = resp.json()
        user_id = data.get("id")
        if user_id:
            return user_id

    raise HTTPException(status_code=401, detail="Not authenticated")
