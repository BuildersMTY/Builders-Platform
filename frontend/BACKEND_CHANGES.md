# Backend Changes Required for Workspace Redesign

> These changes support the frontend redesign (Phases A-E).
> All changes are additive — zero breaking changes to existing YAML or API contracts.

---

## 1. Python Models (`backend/api/course_loader/models.py`)

```python
STAGE_DEFAULTS = {"doc": 0, "spec": 0, "signature": 1, "hint": 2}

class Resource(BaseModel):
    title: str
    file: str
    type: str
    visible_to: list[str] = []
    stage: int | None = None          # NEW — when to reveal (0=immediate, 1=after first run, 2=after failure)

    @property
    def effective_stage(self) -> int:
        if self.stage is not None:
            return self.stage
        return STAGE_DEFAULTS.get(self.type, 0)


class TestSpec(BaseModel):
    # ... existing fields unchanged ...
    description: str | None = None    # NEW — human-readable test name ("GET /health returns 200")
    hint_on_fail: str | None = None   # NEW — targeted guidance shown on failure


class Submodule(BaseModel):
    # ... existing fields unchanged ...
    goal: str | None = None           # NEW — high-level intent, becomes TaskBrief headline
    on_pass: str | None = None        # NEW — custom completion message shown in SuccessOverlay
```

---

## 2. Resource Endpoint (`backend/api/routers/resources.py`)

Add `stage` to the response payload:

```python
# In get_resources(), change the result.append:
result.append({
    "title": res.title,
    "type": res.type,
    "content": content,
    "stage": res.effective_stage,     # NEW
})
```

---

## 3. Run Endpoint (`backend/api/routers/run.py`)

No code changes needed — `model_dump(exclude_none=True)` already passes through
any new fields present in the YAML. The `description` and `hint_on_fail` fields
will flow from YAML → Pydantic model → runner request automatically.

---

## 4. Go Runner Models (`backend/runner/internal/models/request.go`)

Add two optional fields to the TestSpec struct:

```go
type TestSpec struct {
    // ... existing fields ...
    Description string `json:"description,omitempty"` // NEW
    HintOnFail  string `json:"hint_on_fail,omitempty"` // NEW
}
```

---

## 5. Go Runner Dispatchers (`backend/runner/internal/dispatch/*.go`)

In each dispatcher (http.go, script.go, unit.go, stdout.go, tcp.go), include
the new fields in SSE events:

```go
// In test_start event (all dispatchers):
w.Send("test_start", map[string]any{
    "index":       index,
    "type":        spec.Type,
    "description": spec.Description,  // NEW — empty string if not set
})

// In test_failed events (all dispatchers), add hint_on_fail:
w.Send("test_failed", map[string]any{
    "index":        index,
    "error":        "...",
    "expected":     ...,              // already present in http.go, tcp.go, stdout.go
    "actual":       ...,              // already present
    "hint_on_fail": spec.HintOnFail, // NEW
    "description":  spec.Description, // NEW
})

// In test_done events:
w.Send("test_done", map[string]any{
    "index":       index,
    "passed":      true,
    "description": spec.Description,  // NEW
})
```

---

## 6. SSE Event Name Fix (Bug)

The Go runner emits `test_done` and `test_failed`.
The frontend was listening for `test_pass` and `test_fail`.

**Frontend is already fixed** — it now listens for the correct event names
and keeps legacy listeners for backward compatibility.

**No backend changes needed for this fix.**

The runner also already sends `expected`/`actual` in `test_failed` payloads
(http.go, tcp.go, stdout.go). The frontend now parses and displays these.

---

## 7. Course YAML Changes (per-course, not platform code)

All fields are optional. Existing YAML works unchanged.

```yaml
# Submodule additions:
- id: listen
  title: "Listener TCP y accept loop"
  goal: >-                                    # NEW — 1-2 sentence high-level intent
    Haz que el servidor escuche conexiones TCP
    entrantes y maneje cada una en una goroutine.
  spec: >-                                    # unchanged
    Implementa Server.Start: abre un listener...
  on_pass: >-                                 # NEW — shown in SuccessOverlay
    Tu servidor ya acepta conexiones TCP. Cada
    cliente se maneja en su propia goroutine.
  stubs:
    - path: server.go
  tests:
    - description: "TCP connection accepted"  # NEW — shown in test panel
      type: script
      file: tests/tcp_listen_test.sh
      timeout_ms: 5000
      hint_on_fail: >-                        # NEW — shown below failed test
        Verifica que net.Listen use s.Addr y
        que el accept loop no termine tras la
        primera conexión.
  resources:
    - title: "net.Listen y TCP accept loops"
      file: tcp/server_doc.md
      type: doc
      visible_to: [junior, mid, senior]
      # stage: 0 (auto-default from type=doc)

    - title: "Signature: Server.Start"
      file: tcp/listen_signature.md
      type: signature
      visible_to: [junior, mid, senior]
      # stage: 1 (auto-default from type=signature)

    - title: "Hint: listener y goroutines"
      file: tcp/listen_hint.md
      type: hint
      visible_to: [junior]
      stage: 2                                # explicit (same as default)
```

### Stage defaults by resource type:

| `type` | Default `stage` | Trigger |
|--------|----------------|---------|
| `doc` | 0 | Immediate — shown on submodule activation |
| `spec` | 0 | Immediate |
| `signature` | 1 | After first test run (any outcome) |
| `hint` | 2 | After a failed test run |
| *(other)* | 0 | Immediate |

---

## 8. Frontend Types Already Updated

`frontend/src/lib/types.ts` does NOT need changes yet — the frontend reads
these fields from SSE event payloads (parsed dynamically) and resource API
responses (extra fields are ignored by TypeScript). The types can be updated
when the backend ships these fields.

---

## 9. Phase E — Course YAML Content Enrichment

After the backend model changes (section 1) ship, enrich `_courses/http-server/go/course.yaml`
with the new fields. Below is the complete list of additions needed per submodule.

### 9.1 Add `goal` to all 15 submodules

Each submodule needs a 1-2 sentence `goal` field — the high-level "what".
The existing `spec` stays as the procedural "how".

```yaml
# Module 1 — TCP Foundation
- id: listen
  goal: "Haz que el servidor escuche conexiones TCP y maneje cada una en una goroutine."
- id: handle-conn
  goal: "Parsea un request HTTP entrante y delega al handler configurado."

# Module 2 — HTTP Parsing
- id: request-line
  goal: "Extrae method, path y version de la primera línea del request."
- id: headers
  goal: "Lee los headers HTTP del request y guárdalos en un mapa."
- id: body
  goal: "Lee el body del request usando Content-Length."

# Module 3 — HTTP Response
- id: write-header
  goal: "Escribe la status line y los headers al socket TCP."
- id: write
  goal: "Escribe el body de la respuesta con auto-200 y Content-Length."

# Module 4 — Router
- id: register
  goal: "Registra handlers por method+path y despacha requests entrantes."
- id: dispatch
  goal: "Diferencia 404 de 405 y soporta un handler fallback."

# Module 5 — Static Files
- id: serve-file
  goal: "Sirve archivos estáticos con el MIME type correcto."
- id: traversal
  goal: "Protege contra path traversal (../) en las rutas."
- id: index
  goal: "Sirve index.html cuando la ruta apunta a un directorio."

# Module 6 — Middleware
- id: apply
  goal: "Encadena middlewares alrededor del handler base."
- id: cors
  goal: "Responde preflight OPTIONS y agrega headers CORS."
- id: logger
  goal: "Loggea method, path, status code y duración de cada request."
```

### 9.2 Add `on_pass` to all 15 submodules

Custom completion messages — short, teaching moment at peak engagement.

```yaml
# tcp/listen
on_pass: "Tu servidor ya acepta conexiones TCP concurrentes con goroutines."

# tcp/handle-conn
on_pass: "El servidor parsea requests y delega al handler — el ciclo HTTP básico está completo."

# parsing/request-line
on_pass: "Puedes extraer method, path y version de cualquier request HTTP/1.1."

# parsing/headers
on_pass: "Los headers se parsean en un loop hasta la línea vacía — así funciona HTTP."

# parsing/body
on_pass: "Content-Length te dice exactamente cuántos bytes leer — sin más, sin menos."

# response/write-header
on_pass: "Tu servidor responde con status lines y headers HTTP válidos."

# response/write
on_pass: "Auto-200 y Content-Length automático — tu ResponseWriter es funcional."

# router/register
on_pass: "Tienes un router con dispatch exacto por method+path."

# router/dispatch
on_pass: "404 vs 405 — tu router distingue 'ruta no existe' de 'método no permitido'."

# static/serve-file
on_pass: "Puedes servir CSS, JS, HTML — cualquier archivo con su MIME type correcto."

# static/traversal
on_pass: "Tu servidor está protegido contra path traversal — nadie puede leer archivos fuera del directorio."

# static/index
on_pass: "Directorios sirven index.html automáticamente — como cualquier servidor web real."

# middleware/apply
on_pass: "La cadena de middlewares envuelve el handler en orden inverso — decorator pattern en Go."

# middleware/cors
on_pass: "Tu API acepta requests cross-origin con preflight OPTIONS."

# middleware/logger
on_pass: "Cada request se loggea con method, path, status y duración — observabilidad básica."
```

### 9.3 Add `description` to all tests

Each test needs a human-readable `description` for the TestPanel.

```yaml
# tcp/listen test
- description: "TCP connection accepted on port"
  type: script
  file: tests/tcp_listen_test.sh

# tcp/handle-conn test
- description: "handleConnection processes request without crashing"
  type: script
  file: tests/tcp_handle_conn_test.sh

# parsing/request-line test
- description: "parseRequestLine extracts method, path, version"
  type: unit
  match: TestParseRequestLine

# parsing/headers test
- description: "parseHeaders reads key-value pairs until empty line"
  type: unit
  match: TestParseHeaders

# parsing/body test
- description: "parseBody reads exactly Content-Length bytes"
  type: unit
  match: TestParseBody

# response/write-header test
- description: "GET /nope returns 404"
  type: http
  ...

# response/write test
- description: "404 response includes 'Not Found' body"
  type: http
  ...

# router/register tests
- description: "GET /health returns 200 with status ok"
- description: "POST /echo returns echoed body"

# router/dispatch tests
- description: "POST /health returns 405 Method Not Allowed"
- description: "GET /nonexistent returns 404"

# static/serve-file test
- description: "GET /style.css returns 200 with text/css"

# static/traversal tests
- description: "GET /style.css still returns 200"
- description: "Path traversal attempt blocked"

# static/index test
- description: "GET / returns index.html with text/html"

# middleware/apply test
- description: "ApplyMiddlewares chains in correct order"

# middleware/cors tests
- description: "OPTIONS /health returns CORS headers"
- description: "GET /health includes CORS headers"

# middleware/logger test
- description: "GET /health response is valid after logging"
```

### 9.4 Add `hint_on_fail` to tests with common failure patterns

Only add to tests where the failure mode is non-obvious:

```yaml
# tcp/listen
hint_on_fail: "Verifica que net.Listen use s.Addr y que el accept loop no termine tras la primera conexión."

# tcp/handle-conn
hint_on_fail: "Asegúrate de usar defer conn.Close() y de llamar s.Handler.ServeHTTP cuando el handler no es nil."

# parsing/request-line
hint_on_fail: "Usa strings.Split con exactamente 3 partes. Recuerda recortar \\r\\n con TrimRight."

# response/write-header
hint_on_fail: "Verifica que wroteHeader sea un guard (return si ya escribiste). El formato es 'HTTP/1.1 CODE REASON\\r\\n'."

# response/write
hint_on_fail: "Si WriteHeader no se llamó, auto-setea Content-Length y llama WriteHeader(200) antes de escribir."

# static/traversal
hint_on_fail: "Usa filepath.Clean + filepath.Abs + strings.HasPrefix para validar que el path no escape de baseDir."

# middleware/apply
hint_on_fail: "Itera en orden inverso: for i := len(mw)-1; i >= 0; i--. El primer middleware es el más externo."

# middleware/cors
hint_on_fail: "Para OPTIONS, responde WriteHeader(200) y return sin llamar next.ServeHTTP."
```
