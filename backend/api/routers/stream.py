# backend/api/routers/stream.py
from __future__ import annotations
import json
import httpx
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from api.config import settings
from api.db.models import Progress
from api.routers.run import pending_runs

router = APIRouter(prefix="/api/stream", tags=["stream"])

@router.get("/{run_id}")
async def stream_run(run_id: str):
    pending = pending_runs.pop(run_id, None)
    if not pending:
        raise HTTPException(status_code=404, detail="Run not found or already consumed")

    run_request = pending["request"]
    user_id = pending["user_id"]
    course_slug = pending["course_slug"]
    language = pending["language"]
    submodule_id = pending["submodule_id"]

    async def event_generator():
        all_passed = False
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream(
                    "POST",
                    f"{settings.runner_url}/run",
                    json=run_request,
                    headers={"Accept": "text/event-stream"},
                ) as response:
                    event_name = None
                    data_buffer = ""

                    async for line in response.aiter_lines():
                        if line.startswith("event: "):
                            event_name = line[7:].strip()
                        elif line.startswith("data: "):
                            data_buffer = line[6:]
                        elif line == "" and event_name:
                            yield {"event": event_name, "data": data_buffer}

                            if event_name == "run_complete":
                                try:
                                    result = json.loads(data_buffer)
                                    all_passed = result.get("all_passed", False)
                                except json.JSONDecodeError:
                                    pass

                            event_name = None
                            data_buffer = ""

        except httpx.ConnectError:
            yield {
                "event": "system_error",
                "data": json.dumps({"error": "Runner service unavailable"}),
            }

        # Record progress if all passed
        if all_passed:
            from api.db.database import engine
            from sqlmodel import Session as SyncSession
            with SyncSession(engine) as db:
                progress = Progress(
                    user_id=user_id,
                    course_slug=course_slug,
                    language=language,
                    submodule_id=submodule_id,
                )
                db.add(progress)
                db.commit()

    return EventSourceResponse(event_generator())
