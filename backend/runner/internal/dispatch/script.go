package dispatch

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

// ScriptDispatcher writes an inline script to a temp file and executes it via bash.
// Exit 0 = pass; non-zero = fail.
type ScriptDispatcher struct{}

func (d *ScriptDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{"index": index, "type": "script"})

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	// Write the script to a temp file inside the workspace (or os.TempDir if workspace is empty).
	scriptDir := env.WorkspaceDir
	if scriptDir == "" {
		scriptDir = os.TempDir()
	}

	tmpFile, err := os.CreateTemp(scriptDir, "bm_script_*.sh")
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("create temp script: %v", err)})
		return false, err
	}
	scriptPath := tmpFile.Name()
	// Ensure Unix line endings and write content.
	content := strings.ReplaceAll(spec.FileContent, "\r\n", "\n")
	if _, err := tmpFile.WriteString(content); err != nil {
		tmpFile.Close()
		os.Remove(scriptPath)
		w.Send("test_failed", map[string]any{"index": index, "error": fmt.Sprintf("write script: %v", err)})
		return false, err
	}
	tmpFile.Close()
	defer os.Remove(scriptPath)

	runCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	// Use forward-slash path for bash on Windows (Git Bash).
	bashPath := filepath.ToSlash(scriptPath)

	cmd := exec.CommandContext(runCtx, "bash", bashPath)
	cmd.Dir = env.WorkspaceDir
	cmd.Env = append(os.Environ(), env.EnvVars...)
	cmd.Env = append(cmd.Env,
		fmt.Sprintf("BUILDMANCER_WORKSPACE_DIR=%s", env.WorkspaceDir),
		fmt.Sprintf("BUILDMANCER_BINARY=%s", env.BinaryPath),
		fmt.Sprintf("BUILDMANCER_PROGRAM_PID=%d", env.ProcessPID),
	)
	// WaitDelay ensures that if the parent bash process is killed but orphan
	// children still hold the pipe open (common on Windows), Go forcibly closes
	// the I/O pipes after this grace period so cmd.Wait() returns promptly.
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
		w.Send("test_timeout", map[string]any{"index": index, "timeout": spec.TimeoutMs})
		return false, fmt.Errorf("script test timed out after %dms", spec.TimeoutMs)
	}

	if waitErr != nil {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"error":  "script exited with non-zero status",
			"output": output.String(),
		})
		return false, nil
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
