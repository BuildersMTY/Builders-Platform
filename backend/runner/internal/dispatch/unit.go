package dispatch

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

// UnitDispatcher runs the language's unit-test command for a specific test match.
// The command can be overridden via the BUILDMANCER_UNIT_CMD env var in env.EnvVars,
// otherwise it defaults to a standard Go test invocation.
type UnitDispatcher struct{}

func (d *UnitDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{"index": index, "type": "unit", "match": spec.Match})

	// Determine unit command — honour env override first.
	unitCmd := ""
	for _, kv := range env.EnvVars {
		if strings.HasPrefix(kv, "BUILDMANCER_UNIT_CMD=") {
			unitCmd = strings.TrimPrefix(kv, "BUILDMANCER_UNIT_CMD=")
			break
		}
	}
	// Fall back to os env, then hard-coded default.
	if unitCmd == "" {
		unitCmd = os.Getenv("BUILDMANCER_UNIT_CMD")
	}
	if unitCmd == "" {
		unitCmd = "go test -run {match} -v -count=1 ."
	}

	unitCmd = strings.ReplaceAll(unitCmd, "{match}", spec.Match)

	// Determine timeout.
	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	runCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(runCtx, "bash", "-c", unitCmd)
	cmd.Dir = env.WorkspaceDir
	cmd.Env = append(os.Environ(), env.EnvVars...)
	// Ensure orphan child processes don't keep the pipe open indefinitely on Windows.
	cmd.WaitDelay = 500 * time.Millisecond

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": err.Error()})
		return false, err
	}
	cmd.Stderr = cmd.Stdout

	if err := cmd.Start(); err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": err.Error()})
		return false, err
	}

	var output strings.Builder
	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		line := scanner.Text()
		output.WriteString(line + "\n")
		w.Send("test_output", map[string]any{"index": index, "line": line})
	}

	waitErr := cmd.Wait()

	if runCtx.Err() == context.DeadlineExceeded {
		w.Send("test_timeout", map[string]any{
			"index":   index,
			"timeout": spec.TimeoutMs,
		})
		return false, fmt.Errorf("test timed out after %dms", spec.TimeoutMs)
	}

	if waitErr != nil {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"error":  "unit test failed",
			"output": output.String(),
		})
		return false, nil
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
