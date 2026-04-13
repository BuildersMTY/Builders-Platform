package sse

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWriterSend(t *testing.T) {
	rec := httptest.NewRecorder()
	w := NewWriter(rec)
	w.Send("test_event", map[string]string{"key": "value"})
	body := rec.Body.String()
	if !strings.Contains(body, "event: test_event\n") {
		t.Errorf("missing event line, got: %s", body)
	}
	if !strings.Contains(body, `data: {"key":"value"}`) {
		t.Errorf("missing data line, got: %s", body)
	}
}

func TestWriterSendMultiple(t *testing.T) {
	rec := httptest.NewRecorder()
	w := NewWriter(rec)
	w.Send("first", map[string]int{"n": 1})
	w.Send("second", map[string]int{"n": 2})
	body := rec.Body.String()
	if strings.Count(body, "event: ") != 2 {
		t.Errorf("expected 2 events, got: %s", body)
	}
}
