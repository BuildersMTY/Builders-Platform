package dispatch

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

// StdoutDispatcher runs the binary with optional stdin and compares its stdout
// against the expected value or substring.
type StdoutDispatcher struct{}

func (d *StdoutDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{"index": index, "type": "stdout"})

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	runCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(runCtx, "bash", "-c", env.BinaryPath)
	cmd.Dir = env.WorkspaceDir
	cmd.Env = append(os.Environ(), env.EnvVars...)
	// Ensure orphan child processes don't keep the pipe open indefinitely on Windows.
	cmd.WaitDelay = 500 * time.Millisecond

	if spec.Stdin != "" {
		cmd.Stdin = strings.NewReader(spec.Stdin)
	}

	var stdoutBuf bytes.Buffer
	var stderrBuf bytes.Buffer

	// Stream stdout lines while also capturing the full output.
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": err.Error()})
		return false, err
	}
	cmd.Stderr = &stderrBuf

	if err := cmd.Start(); err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": err.Error()})
		return false, err
	}

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		line := scanner.Text()
		stdoutBuf.WriteString(line + "\n")
		w.Send("test_output", map[string]any{"index": index, "line": line})
	}

	waitErr := cmd.Wait()

	if runCtx.Err() == context.DeadlineExceeded {
		w.Send("test_timeout", map[string]any{"index": index, "timeout": spec.TimeoutMs})
		return false, fmt.Errorf("stdout test timed out after %dms", spec.TimeoutMs)
	}

	if waitErr != nil {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"error":  fmt.Sprintf("process exited with error: %v", waitErr),
			"stderr": stderrBuf.String(),
		})
		return false, nil
	}

	actual := stdoutBuf.String()

	// Check exact match (trim trailing newlines on both sides for convenience).
	if spec.ExpectedStdout != "" {
		want := strings.TrimRight(spec.ExpectedStdout, "\r\n")
		got := strings.TrimRight(actual, "\r\n")
		if got != want {
			w.Send("test_failed", map[string]any{
				"index":    index,
				"error":    "stdout mismatch",
				"expected": want,
				"actual":   got,
			})
			return false, nil
		}
	}

	// Check substring match.
	if spec.ExpectedStdoutContains != "" {
		if !strings.Contains(actual, spec.ExpectedStdoutContains) {
			w.Send("test_failed", map[string]any{
				"index":    index,
				"error":    "stdout does not contain expected string",
				"expected": spec.ExpectedStdoutContains,
				"actual":   actual,
			})
			return false, nil
		}
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
