package dispatch

import (
	"context"
	"encoding/hex"
	"fmt"
	"io"
	"net"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

// TCPDispatcher sends raw bytes over a TCP connection and validates the response.
type TCPDispatcher struct{}

func (d *TCPDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{"index": index, "type": "tcp"})

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	port := spec.Port
	if port == 0 {
		port = env.Port
	}
	addr := fmt.Sprintf("localhost:%d", port)

	// Dial with deadline.
	dialer := &net.Dialer{Timeout: timeout}
	conn, err := dialer.DialContext(ctx, "tcp", addr)
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("connect to %s: %v", addr, err)})
		return false, nil
	}
	defer conn.Close()

	deadline := time.Now().Add(timeout)
	_ = conn.SetDeadline(deadline)

	// Build bytes to send.
	var sendBytes []byte
	if spec.SendHex != "" {
		sendBytes, err = hex.DecodeString(spec.SendHex)
		if err != nil {
			w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("decode send_hex: %v", err)})
			return false, err
		}
	} else {
		sendBytes = []byte(spec.Send)
	}

	if _, err := conn.Write(sendBytes); err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("send: %v", err)})
		return false, nil
	}

	// Half-close the write side so the server sees EOF and can send its response.
	// TCPConn supports CloseWrite; fall back to full Close otherwise.
	if tc, ok := conn.(*net.TCPConn); ok {
		_ = tc.CloseWrite()
	}

	// Read response — read until connection closes or deadline.
	respBytes, err := io.ReadAll(conn)
	if err != nil {
		// A timeout here means the server left the connection open; treat what
		// we received so far as the response.
		if netErr, ok := err.(net.Error); !ok || !netErr.Timeout() {
			w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("read response: %v", err)})
			return false, nil
		}
	}

	w.Send("test_output", map[string]any{"index": index, "bytes": len(respBytes)})

	// Validate hex response.
	if spec.ExpectedHex != "" {
		wantBytes, hexErr := hex.DecodeString(spec.ExpectedHex)
		if hexErr != nil {
			w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("decode expected_hex: %v", hexErr)})
			return false, hexErr
		}
		if string(respBytes) != string(wantBytes) {
			w.Send("test_failed", map[string]any{
				"index":    index,
				"error":    "hex response mismatch",
				"expected": spec.ExpectedHex,
				"actual":   hex.EncodeToString(respBytes),
			})
			return false, nil
		}
	}

	// Validate text response.
	if spec.ExpectedResponse != "" {
		want := strings.TrimRight(spec.ExpectedResponse, "\r\n")
		got := strings.TrimRight(string(respBytes), "\r\n")
		if got != want {
			w.Send("test_failed", map[string]any{
				"index":    index,
				"error":    "tcp response mismatch",
				"expected": want,
				"actual":   got,
			})
			return false, nil
		}
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
