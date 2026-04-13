package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"buildmancer/runner/internal/models"
)

func TestRunHandlerBuildOnly(t *testing.T) {
	req := models.RunRequest{
		RunID:    "test-1",
		Language: "go",
		BuildCmd: "echo build-done",
		Files:    map[string]string{"main.go": "package main"},
		Tests:    []models.TestSpec{},
	}
	body, _ := json.Marshal(req)
	httpReq := httptest.NewRequest("POST", "/run", bytes.NewReader(body))
	rec := httptest.NewRecorder()
	HandleRun(rec, httpReq)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	respBody := rec.Body.String()
	if !strings.Contains(respBody, "build_done") {
		t.Errorf("missing build_done in response: %s", respBody)
	}
	if !strings.Contains(respBody, "run_complete") {
		t.Errorf("missing run_complete: %s", respBody)
	}
}
