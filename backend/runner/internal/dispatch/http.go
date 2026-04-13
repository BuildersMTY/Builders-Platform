package dispatch

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

// HTTPDispatcher sends an HTTP request to the running binary and validates the response.
type HTTPDispatcher struct{}

func (d *HTTPDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{"index": index, "type": "http"})

	if spec.Request == nil {
		w.Send("test_failed", map[string]any{"index": index, "error": "missing request spec"})
		return false, nil
	}
	if spec.Expected == nil {
		w.Send("test_failed", map[string]any{"index": index, "error": "missing expected spec"})
		return false, nil
	}

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	reqCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	method := spec.Request.Method
	if method == "" {
		method = http.MethodGet
	}

	port := env.Port
	url := fmt.Sprintf("http://localhost:%d%s", port, spec.Request.Path)

	var bodyReader io.Reader
	if spec.Request.Body != "" {
		bodyReader = strings.NewReader(spec.Request.Body)
	}

	req, err := http.NewRequestWithContext(reqCtx, method, url, bodyReader)
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("build request: %v", err)})
		return false, err
	}

	for k, v := range spec.Request.Headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("request failed: %v", err)})
		return false, nil
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("read body: %v", err)})
		return false, nil
	}
	bodyStr := string(bodyBytes)

	w.Send("test_output", map[string]any{
		"index":  index,
		"status": resp.StatusCode,
		"body":   bodyStr,
	})

	// Validate status.
	if spec.Expected.Status != 0 && resp.StatusCode != spec.Expected.Status {
		w.Send("test_failed", map[string]any{
			"index":    index,
			"error":    "status code mismatch",
			"expected": spec.Expected.Status,
			"actual":   resp.StatusCode,
		})
		return false, nil
	}

	// Validate body equals.
	if spec.Expected.BodyEquals != "" {
		want := strings.TrimRight(spec.Expected.BodyEquals, "\r\n")
		got := strings.TrimRight(bodyStr, "\r\n")
		if got != want {
			w.Send("test_failed", map[string]any{
				"index":    index,
				"error":    "body mismatch",
				"expected": want,
				"actual":   got,
			})
			return false, nil
		}
	}

	// Validate body contains.
	if spec.Expected.BodyContains != "" && !strings.Contains(bodyStr, spec.Expected.BodyContains) {
		w.Send("test_failed", map[string]any{
			"index":    index,
			"error":    "body does not contain expected string",
			"expected": spec.Expected.BodyContains,
			"actual":   bodyStr,
		})
		return false, nil
	}

	// Validate response headers.
	for k, want := range spec.Expected.Headers {
		got := resp.Header.Get(k)
		if !strings.EqualFold(got, want) {
			w.Send("test_failed", map[string]any{
				"index":    index,
				"error":    fmt.Sprintf("header %q mismatch", k),
				"expected": want,
				"actual":   got,
			})
			return false, nil
		}
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
