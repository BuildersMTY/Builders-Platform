Fase 1
Core funcional — sin Docker, sin git
~5h
1
Course loader (Python)
Pydantic models que mapean course.yaml 1:1. Función load_course(path) que valida slug, test types, que cada file: y path: resuelve a un archivo real. Base de todo lo demás.
2
SQLite schema
Tres tablas: working_files(user_id, course_slug, submodule_id, filepath, content, updated_at) · progress(user_id, course_slug, module_id, submodule_id, passed_at) · enrollments(user_id, course_slug, difficulty, started_at).
3
Go orchestrator — host exec
POST /run recibe RunRequest{course, submodule, files map[path]content}. Materializa archivos en /tmp/{run_id}/, corre build_cmd directo en host, dispatch por test.type, streamea output como SSE. Destruye tmpdir al terminar. Sin Docker aún.
4
FastAPI endpoints mínimos
GET /courses · GET /courses/:slug · PATCH /files/:course/:submodule/:path (autosave cada 2s) · POST /run/:course/:submodule (lee working_files de DB, llama al Go runner, proxea SSE) · GET /progress/:course.
Fase 2
Sandbox — ejecución dentro de Docker
~3h
1
Runner images por lenguaje
Una imagen por lenguaje: buildersmty/runner-go, runner-c, runner-python, etc. Cada una solo contiene el toolchain + bash + curl + nc. Dockerfile vive en runners/{lang}/Dockerfile. El orquestador Go lee meta.runner del YAML para saber cuál usar.
2
Go orchestrator — swap a Docker exec
Reemplazar el exec.Command("go", "build", ...) directo por docker run --rm -v {tmpdir}:/workspace {meta.runner} build_cmd. La interfaz del RunRequest no cambia — Python ni se entera del swap. Mismo SSE output.
3
Resource limits + isolation
Agregar --memory=256m --cpus=0.5 --network=none --read-only al docker run. Solo el workspace montado como writable. Previene que código del estudiante abuse el host o haga requests externos.
4
Container pool (warm containers)
Pre-spin N containers por lenguaje en idle para eliminar cold start. El orchestrator tiene un pool[lang]chan ContainerID. Al recibir un run, toma uno del pool, lo usa, lo destruye, spawnea uno nuevo para reponer. Tamaño del pool configurable por lenguaje.
Fase 3
Git flow — historial y entrega del repo
~3h
1
Repo por estudiante al enrollarse
Al hacer POST /enroll, el backend clona el courses/{slug}/{lang}/src/ en un bare repo por estudiante en el server (o en GitHub via API). Crea una branch student/{user_id}. Los stubs son el commit inicial: "[{course}] Initial stubs".
2
Commit al pasar cada submodule
Cuando el Go runner reporta all_passed: true, el Python backend lee working_files para ese submodule, aplica los cambios al repo del estudiante, y hace commit con mensaje "[{course}] Pass {module_id}/{submodule_id}". El mensaje viene directo del YAML — el loader ya tiene el submodule.id.
3
Entrega al completar el curso
Cuando progress muestra todos los submodules con passed_at != null, el backend hace el repo público (o lo pushea a la cuenta de GitHub del estudiante via OAuth). El estudiante recibe el link. El historial de commits refleja su progresión exacta por el curso.
4
Workspace sync bidireccional (opcional)
Permitir que el estudiante clone localmente y pushee su trabajo de vuelta. El backend acepta pushes a su branch, actualiza working_files en DB, y refleja los cambios en el editor del browser. Útil para seniors que prefieren su editor local.