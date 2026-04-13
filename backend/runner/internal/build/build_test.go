package build

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"

	"buildmancer/runner/internal/sse"
)

func TestBuildSuccess(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	err := Run(context.Background(), "echo build-ok", "/tmp", map[string]string{}, w)
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}
	body := rec.Body.String()
	if !strings.Contains(body, "build_start") {
		t.Error("missing build_start event")
	}
	if !strings.Contains(body, "build_done") {
		t.Error("missing build_done event")
	}
	if !strings.Contains(body, "build-ok") {
		t.Error("missing build output")
	}
}

func TestBuildFailure(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	err := Run(context.Background(), "false", "/tmp", map[string]string{}, w)
	body := rec.Body.String()
	if err == nil && !strings.Contains(body, "build_failed") {
		t.Error("expected build_failed event or error")
	}
}

func TestBuildEmptyCmd(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	err := Run(context.Background(), "", "/tmp", map[string]string{}, w)
	if err != nil {
		t.Fatalf("empty build should succeed, got: %v", err)
	}
}
