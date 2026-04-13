package dispatch

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

func newSSEWriter() *sse.Writer {
	rec := httptest.NewRecorder()
	return sse.NewWriter(rec)
}

func TestUnitDispatcher_Pass(t *testing.T) {
	w := newSSEWriter()
	d := &UnitDispatcher{}
	spec := models.TestSpec{
		Type:      "unit",
		Match:     "TestSomething",
		TimeoutMs: 10000,
	}
	env := RunEnv{
		EnvVars: []string{"BUILDMANCER_UNIT_CMD=echo PASS && exit 0"},
	}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestUnitDispatcher_Fail(t *testing.T) {
	w := newSSEWriter()
	d := &UnitDispatcher{}
	spec := models.TestSpec{
		Type:      "unit",
		Match:     "TestSomething",
		TimeoutMs: 10000,
	}
	env := RunEnv{
		EnvVars: []string{"BUILDMANCER_UNIT_CMD=echo FAIL && exit 1"},
	}

	passed, err := d.Dispatch(context.Background(), 1, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false")
	}
}

func TestUnitDispatcher_MatchInterpolation(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	d := &UnitDispatcher{}
	spec := models.TestSpec{
		Type:      "unit",
		Match:     "MyTest",
		TimeoutMs: 10000,
	}
	// Print the interpolated match so we can verify it.
	env := RunEnv{
		EnvVars: []string{"BUILDMANCER_UNIT_CMD=echo {match}"},
	}

	passed, err := d.Dispatch(context.Background(), 2, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
	body := rec.Body.String()
	if !strings.Contains(body, "MyTest") {
		t.Errorf("expected 'MyTest' in SSE output, got: %s", body)
	}
}

func TestUnitDispatcher_Timeout(t *testing.T) {
	w := newSSEWriter()
	d := &UnitDispatcher{}
	spec := models.TestSpec{
		Type:      "unit",
		Match:     "X",
		TimeoutMs: 100, // 100ms — very short
	}
	// sleep 2 seconds — will time out; shorter sleep means faster cleanup on Windows.
	env := RunEnv{
		EnvVars: []string{"BUILDMANCER_UNIT_CMD=sleep 2"},
	}

	passed, err := d.Dispatch(context.Background(), 3, spec, env, w)
	if err == nil {
		t.Error("expected a timeout error")
	}
	if passed {
		t.Error("expected passed=false on timeout")
	}
}
