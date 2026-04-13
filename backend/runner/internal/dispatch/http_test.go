package dispatch

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
)

// portFromURL extracts the integer port from a httptest.Server URL.
func portFromURL(rawURL string) int {
	// rawURL looks like "http://127.0.0.1:PORT"
	parts := strings.Split(rawURL, ":")
	if len(parts) < 3 {
		return 0
	}
	p, _ := strconv.Atoi(parts[2])
	return p
}

func TestHTTPDispatcher_StatusMatch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	}))
	defer srv.Close()

	w := newSSEWriter()
	d := &HTTPDispatcher{}
	spec := models.TestSpec{
		Type:      "http",
		TimeoutMs: 10000,
		Request:   &models.HTTPRequest{Method: "GET", Path: "/"},
		Expected:  &models.HTTPExpected{Status: 200, BodyContains: "ok"},
	}
	env := RunEnv{Port: portFromURL(srv.URL)}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestHTTPDispatcher_StatusMismatch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer srv.Close()

	w := newSSEWriter()
	d := &HTTPDispatcher{}
	spec := models.TestSpec{
		Type:      "http",
		TimeoutMs: 10000,
		Request:   &models.HTTPRequest{Method: "GET", Path: "/"},
		Expected:  &models.HTTPExpected{Status: 200},
	}
	env := RunEnv{Port: portFromURL(srv.URL)}

	passed, err := d.Dispatch(context.Background(), 1, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false on status mismatch")
	}
}

func TestHTTPDispatcher_BodyEquals(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("exact body"))
	}))
	defer srv.Close()

	w := newSSEWriter()
	d := &HTTPDispatcher{}
	spec := models.TestSpec{
		Type:      "http",
		TimeoutMs: 10000,
		Request:   &models.HTTPRequest{Method: "GET", Path: "/"},
		Expected:  &models.HTTPExpected{BodyEquals: "exact body"},
	}
	env := RunEnv{Port: portFromURL(srv.URL)}

	passed, err := d.Dispatch(context.Background(), 2, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestHTTPDispatcher_BodyEqualsMismatch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("wrong body"))
	}))
	defer srv.Close()

	w := newSSEWriter()
	d := &HTTPDispatcher{}
	spec := models.TestSpec{
		Type:      "http",
		TimeoutMs: 10000,
		Request:   &models.HTTPRequest{Method: "GET", Path: "/"},
		Expected:  &models.HTTPExpected{BodyEquals: "expected body"},
	}
	env := RunEnv{Port: portFromURL(srv.URL)}

	passed, err := d.Dispatch(context.Background(), 3, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false on body mismatch")
	}
}

func TestHTTPDispatcher_PostWithBody(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("created"))
	}))
	defer srv.Close()

	w := newSSEWriter()
	d := &HTTPDispatcher{}
	spec := models.TestSpec{
		Type:      "http",
		TimeoutMs: 10000,
		Request: &models.HTTPRequest{
			Method: "POST",
			Path:   "/",
			Body:   `{"key":"value"}`,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
		},
		Expected: &models.HTTPExpected{Status: 201, BodyContains: "created"},
	}
	env := RunEnv{Port: portFromURL(srv.URL)}

	passed, err := d.Dispatch(context.Background(), 4, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestHTTPDispatcher_ResponseHeaders(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Custom", "myvalue")
		w.Write([]byte("ok"))
	}))
	defer srv.Close()

	w := newSSEWriter()
	d := &HTTPDispatcher{}
	spec := models.TestSpec{
		Type:      "http",
		TimeoutMs: 10000,
		Request:   &models.HTTPRequest{Method: "GET", Path: "/"},
		Expected: &models.HTTPExpected{
			Headers: map[string]string{"X-Custom": "myvalue"},
		},
	}
	env := RunEnv{Port: portFromURL(srv.URL)}

	passed, err := d.Dispatch(context.Background(), 5, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestHTTPDispatcher_MissingRequestSpec(t *testing.T) {
	w := newSSEWriter()
	d := &HTTPDispatcher{}
	spec := models.TestSpec{
		Type:      "http",
		TimeoutMs: 10000,
		Expected:  &models.HTTPExpected{Status: 200},
	}
	env := RunEnv{Port: 8080}

	passed, err := d.Dispatch(context.Background(), 6, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false when request spec is missing")
	}
}
