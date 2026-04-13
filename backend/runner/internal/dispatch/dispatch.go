package dispatch

import (
	"context"
	"fmt"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

// RunEnv holds runtime context passed from the runner to each dispatcher.
type RunEnv struct {
	WorkspaceDir string
	BinaryPath   string
	Port         int
	ProcessPID   int
	EnvVars      []string
}

// Dispatcher executes one test and streams results via SSE.
type Dispatcher interface {
	Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (passed bool, err error)
}

var registry = map[string]Dispatcher{
	"unit":   &UnitDispatcher{},
	"stdout": &StdoutDispatcher{},
	"http":   &HTTPDispatcher{},
	"tcp":    &TCPDispatcher{},
	"script": &ScriptDispatcher{},
}

// Get returns the Dispatcher registered under testType, or an error if unknown.
func Get(testType string) (Dispatcher, error) {
	d, ok := registry[testType]
	if !ok {
		return nil, fmt.Errorf("unknown test type: %s", testType)
	}
	return d, nil
}
