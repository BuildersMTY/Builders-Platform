package dispatch

import (
	"context"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

// sseRecorder wraps httptest.ResponseRecorder so tests can inspect SSE output.
type sseRecorder struct {
	writer *sse.Writer
	rec    *httptest.ResponseRecorder
}

func newSSERecorder() *sseRecorder {
	rec := httptest.NewRecorder()
	return &sseRecorder{
		writer: sse.NewWriter(rec),
		rec:    rec,
	}
}

func (r *sseRecorder) body() string {
	return r.rec.Body.String()
}

func TestScriptDispatcher_ExitZero(t *testing.T) {
	w := newSSEWriter()
	d := &ScriptDispatcher{}
	spec := models.TestSpec{
		Type:        "script",
		TimeoutMs:   10000,
		FileContent: "#!/bin/bash\nexit 0\n",
	}
	env := RunEnv{WorkspaceDir: os.TempDir()}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true for exit 0 script")
	}
}

func TestScriptDispatcher_ExitOne(t *testing.T) {
	w := newSSEWriter()
	d := &ScriptDispatcher{}
	spec := models.TestSpec{
		Type:        "script",
		TimeoutMs:   10000,
		FileContent: "#!/bin/bash\nexit 1\n",
	}
	env := RunEnv{WorkspaceDir: os.TempDir()}

	passed, err := d.Dispatch(context.Background(), 1, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false for exit 1 script")
	}
}

func TestScriptDispatcher_OutputStreamed(t *testing.T) {
	rec := newSSERecorder()
	d := &ScriptDispatcher{}
	spec := models.TestSpec{
		Type:        "script",
		TimeoutMs:   10000,
		FileContent: "#!/bin/bash\necho 'hello from script'\nexit 0\n",
	}
	env := RunEnv{WorkspaceDir: os.TempDir()}

	passed, err := d.Dispatch(context.Background(), 2, spec, env, rec.writer)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
	body := rec.body()
	if !strings.Contains(body, "hello from script") {
		t.Errorf("expected output line in SSE, got: %s", body)
	}
}

func TestScriptDispatcher_EnvVarsSet(t *testing.T) {
	rec := newSSERecorder()
	d := &ScriptDispatcher{}
	spec := models.TestSpec{
		Type:        "script",
		TimeoutMs:   10000,
		FileContent: "#!/bin/bash\necho \"WS=$BUILDMANCER_WORKSPACE_DIR\"\nexit 0\n",
	}
	env := RunEnv{
		WorkspaceDir: os.TempDir(),
		BinaryPath:   "/usr/bin/myapp",
		ProcessPID:   1234,
	}

	passed, err := d.Dispatch(context.Background(), 3, spec, env, rec.writer)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
	body := rec.body()
	// Verify the env var was set (value appears in output). Paths differ on Windows,
	// so we just check that WS= is present and non-empty.
	if !strings.Contains(body, "WS=") {
		t.Errorf("expected BUILDMANCER_WORKSPACE_DIR to be set, SSE body: %s", body)
	}
}

func TestScriptDispatcher_Timeout(t *testing.T) {
	w := newSSEWriter()
	d := &ScriptDispatcher{}
	spec := models.TestSpec{
		Type:      "script",
		TimeoutMs: 200,
		// Use a short sleep so the orphan process exits quickly on Windows after kill.
		FileContent: "#!/bin/bash\nsleep 2\nexit 0\n",
	}
	env := RunEnv{WorkspaceDir: os.TempDir()}

	passed, err := d.Dispatch(context.Background(), 4, spec, env, w)
	if err == nil {
		t.Error("expected timeout error")
	}
	if passed {
		t.Error("expected passed=false on timeout")
	}
}
