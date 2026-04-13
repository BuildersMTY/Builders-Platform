package build

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"buildmancer/runner/internal/sse"
)

func Run(ctx context.Context, buildCmd string, workDir string, env map[string]string, w *sse.Writer) error {
	if buildCmd == "" {
		w.Send("build_start", map[string]string{"phase": "build"})
		w.Send("build_done", map[string]any{"success": true})
		return nil
	}

	w.Send("build_start", map[string]string{"phase": "build"})

	cmd := exec.CommandContext(ctx, "bash", "-c", buildCmd)
	cmd.Dir = workDir
	cmd.Env = os.Environ()
	for k, v := range env {
		cmd.Env = append(cmd.Env, fmt.Sprintf("%s=%s", k, v))
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		w.Send("build_failed", map[string]string{"error": err.Error()})
		return err
	}
	cmd.Stderr = cmd.Stdout

	if err := cmd.Start(); err != nil {
		w.Send("build_failed", map[string]string{"error": err.Error()})
		return err
	}

	scanner := bufio.NewScanner(stdout)
	var output strings.Builder
	for scanner.Scan() {
		line := scanner.Text()
		output.WriteString(line + "\n")
		w.Send("build_output", map[string]string{"line": line})
	}

	if err := cmd.Wait(); err != nil {
		w.Send("build_failed", map[string]any{
			"error":  "build failed",
			"output": output.String(),
		})
		return fmt.Errorf("build failed: %w", err)
	}

	w.Send("build_done", map[string]any{"success": true})
	return nil
}
