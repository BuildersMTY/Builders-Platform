package lifecycle

import (
	"context"
	"fmt"
	"net"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

type Process struct {
	cmd *exec.Cmd
}

func Spawn(ctx context.Context, command string, workDir string, env []string) (*Process, error) {
	// On Windows, bash doesn't understand backslash paths — convert to forward slashes
	if runtime.GOOS == "windows" {
		command = strings.ReplaceAll(command, "\\", "/")
		workDir = strings.ReplaceAll(workDir, "\\", "/")
	}
	cmd := exec.CommandContext(ctx, "bash", "-c", command)
	cmd.Dir = workDir
	if env != nil {
		cmd.Env = env
	}
	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("spawn failed: %w", err)
	}
	return &Process{cmd: cmd}, nil
}

func (p *Process) PID() int {
	if p.cmd.Process == nil {
		return 0
	}
	return p.cmd.Process.Pid
}

func (p *Process) Kill() error {
	if p.cmd.Process == nil {
		return nil
	}

	// Attempt a graceful shutdown first. On Windows, SIGTERM is not supported
	// and Signal() will return an error — we fall through to Kill() immediately
	// in that case. On Unix, we give the process 2 seconds to exit cleanly.
	done := make(chan error, 1)
	go func() { done <- p.cmd.Wait() }()

	if err := sendTermSignal(p.cmd); err == nil {
		// SIGTERM sent successfully (Unix): wait up to 2 s for clean exit.
		select {
		case <-done:
			return nil
		case <-time.After(2 * time.Second):
			// Timed out — fall through to hard kill.
		}
	}
	// Either SIGTERM is unsupported (Windows) or the process didn't exit in time.
	_ = p.cmd.Process.Kill()
	<-done
	return nil
}

func (p *Process) Wait() error {
	return p.cmd.Wait()
}

func WaitForPort(ctx context.Context, port int, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	addr := fmt.Sprintf("localhost:%d", port)
	for time.Now().Before(deadline) {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}
		conn, err := net.DialTimeout("tcp", addr, 200*time.Millisecond)
		if err == nil {
			conn.Close()
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	return fmt.Errorf("port %d not ready after %v", port, timeout)
}
