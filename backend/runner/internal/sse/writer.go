package sse

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Writer struct {
	w       http.ResponseWriter
	flusher http.Flusher
}

func NewWriter(w http.ResponseWriter) *Writer {
	flusher, _ := w.(http.Flusher)
	return &Writer{w: w, flusher: flusher}
}

func (s *Writer) SetHeaders() {
	s.w.Header().Set("Content-Type", "text/event-stream")
	s.w.Header().Set("Cache-Control", "no-cache")
	s.w.Header().Set("Connection", "keep-alive")
}

func (s *Writer) Send(event string, data any) {
	fmt.Fprintf(s.w, "event: %s\n", event)
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Fprintf(s.w, "data: {\"error\":\"marshal failed\"}\n\n")
	} else {
		fmt.Fprintf(s.w, "data: %s\n\n", jsonData)
	}
	if s.flusher != nil {
		s.flusher.Flush()
	}
}
