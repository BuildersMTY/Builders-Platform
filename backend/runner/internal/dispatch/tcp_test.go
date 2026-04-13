package dispatch

import (
	"context"
	"encoding/hex"
	"io"
	"net"
	"testing"
	"time"

	"buildmancer/runner/internal/models"
)

// startEchoServer starts a TCP server that echoes whatever it receives, then closes the connection.
func startEchoServer(t *testing.T) (port int, stop func()) {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	port = ln.Addr().(*net.TCPAddr).Port

	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			conn, err := ln.Accept()
			if err != nil {
				return
			}
			go func(c net.Conn) {
				defer c.Close()
				_ = c.SetDeadline(time.Now().Add(5 * time.Second))
				data, _ := io.ReadAll(c)
				c.Write(data)
			}(conn)
		}
	}()

	return port, func() {
		ln.Close()
		<-done
	}
}

func TestTCPDispatcher_TextEcho(t *testing.T) {
	port, stop := startEchoServer(t)
	defer stop()

	w := newSSEWriter()
	d := &TCPDispatcher{}
	spec := models.TestSpec{
		Type:             "tcp",
		TimeoutMs:        5000,
		Send:             "hello",
		ExpectedResponse: "hello",
	}
	env := RunEnv{Port: port}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestTCPDispatcher_HexEcho(t *testing.T) {
	port, stop := startEchoServer(t)
	defer stop()

	w := newSSEWriter()
	d := &TCPDispatcher{}
	payload := []byte{0xDE, 0xAD, 0xBE, 0xEF}
	spec := models.TestSpec{
		Type:        "tcp",
		TimeoutMs:   5000,
		SendHex:     hex.EncodeToString(payload),
		ExpectedHex: hex.EncodeToString(payload),
	}
	env := RunEnv{Port: port}

	passed, err := d.Dispatch(context.Background(), 1, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestTCPDispatcher_ResponseMismatch(t *testing.T) {
	port, stop := startEchoServer(t)
	defer stop()

	w := newSSEWriter()
	d := &TCPDispatcher{}
	spec := models.TestSpec{
		Type:             "tcp",
		TimeoutMs:        5000,
		Send:             "hello",
		ExpectedResponse: "world", // echo server returns "hello", not "world"
	}
	env := RunEnv{Port: port}

	passed, err := d.Dispatch(context.Background(), 2, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false on response mismatch")
	}
}

func TestTCPDispatcher_SpecPort(t *testing.T) {
	// spec.Port overrides env.Port
	port, stop := startEchoServer(t)
	defer stop()

	w := newSSEWriter()
	d := &TCPDispatcher{}
	spec := models.TestSpec{
		Type:             "tcp",
		TimeoutMs:        5000,
		Port:             port, // set on spec, not env
		Send:             "ping",
		ExpectedResponse: "ping",
	}
	env := RunEnv{Port: 0} // env port is 0 — should use spec.Port

	passed, err := d.Dispatch(context.Background(), 3, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestTCPDispatcher_ConnectFailure(t *testing.T) {
	w := newSSEWriter()
	d := &TCPDispatcher{}
	spec := models.TestSpec{
		Type:      "tcp",
		TimeoutMs: 500, // short timeout
		Send:      "hello",
		Port:      1, // port 1 should be refused on all platforms
	}
	env := RunEnv{}

	passed, err := d.Dispatch(context.Background(), 4, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error returned: %v", err)
	}
	if passed {
		t.Error("expected passed=false on connection failure")
	}
}
