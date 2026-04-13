package dispatch

import (
	"context"
	"testing"

	"buildmancer/runner/internal/models"
)

func TestStdoutDispatcher_ExactMatch(t *testing.T) {
	w := newSSEWriter()
	d := &StdoutDispatcher{}
	spec := models.TestSpec{
		Type:           "stdout",
		ExpectedStdout: "hello world",
		TimeoutMs:      10000,
	}
	env := RunEnv{
		BinaryPath: "echo hello world",
	}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestStdoutDispatcher_ExactMismatch(t *testing.T) {
	w := newSSEWriter()
	d := &StdoutDispatcher{}
	spec := models.TestSpec{
		Type:           "stdout",
		ExpectedStdout: "goodbye world",
		TimeoutMs:      10000,
	}
	env := RunEnv{
		BinaryPath: "echo hello world",
	}

	passed, err := d.Dispatch(context.Background(), 1, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false on mismatch")
	}
}

func TestStdoutDispatcher_Contains(t *testing.T) {
	w := newSSEWriter()
	d := &StdoutDispatcher{}
	spec := models.TestSpec{
		Type:                   "stdout",
		ExpectedStdoutContains: "world",
		TimeoutMs:              10000,
	}
	env := RunEnv{
		BinaryPath: "echo hello world",
	}

	passed, err := d.Dispatch(context.Background(), 2, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestStdoutDispatcher_ContainsMiss(t *testing.T) {
	w := newSSEWriter()
	d := &StdoutDispatcher{}
	spec := models.TestSpec{
		Type:                   "stdout",
		ExpectedStdoutContains: "foobar",
		TimeoutMs:              10000,
	}
	env := RunEnv{
		BinaryPath: "echo hello world",
	}

	passed, err := d.Dispatch(context.Background(), 3, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false")
	}
}

func TestStdoutDispatcher_StdinPiped(t *testing.T) {
	w := newSSEWriter()
	d := &StdoutDispatcher{}
	spec := models.TestSpec{
		Type:           "stdout",
		Stdin:          "greetings",
		ExpectedStdout: "greetings",
		TimeoutMs:      10000,
	}
	// cat reads from stdin and echoes to stdout.
	env := RunEnv{
		BinaryPath: "cat",
	}

	passed, err := d.Dispatch(context.Background(), 4, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected passed=true")
	}
}

func TestStdoutDispatcher_NonZeroExit(t *testing.T) {
	w := newSSEWriter()
	d := &StdoutDispatcher{}
	spec := models.TestSpec{
		Type:      "stdout",
		TimeoutMs: 10000,
	}
	env := RunEnv{
		BinaryPath: "exit 1",
	}

	passed, err := d.Dispatch(context.Background(), 5, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if passed {
		t.Error("expected passed=false on non-zero exit")
	}
}
