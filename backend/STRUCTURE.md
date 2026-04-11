builders-platform/ /      ← Python + Go (este repo)
 backend/ 
  api/           <<<<<<<<<<<>>>>>>>>>>>         ← FastAPI app
    main.py
    routers/
      courses.py          GET /courses, GET /courses/:slug
      files.py            PATCH /files/:course/:submodule/:path  (autosave)
      run.py              POST /run/:course/:submodule
      stream.py           GET /stream/:run_id  (SSE)
    models/               pydantic models
    db/                   SQLite con SQLModel
    course_loader/        parse + validate course.yaml → dataclasses
  runner/                 ← Go service
    cmd/server/main.go
    internal/
      build/
      dispatch/           unit.go  http.go  tcp.go  stdout.go  script.go
      lifecycle/
  docker-compose.yml      api + runner juntos

builders-courses/         ← repo de content (source de cursos)
  courses/
    memory-allocator/c/
      course.yaml
      src/
      solution/
      resources/