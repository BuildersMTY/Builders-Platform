//go:build !windows

package lifecycle

import (
	"os/exec"
	"syscall"
)

// sendTermSignal sends SIGTERM on Unix systems.
func sendTermSignal(cmd *exec.Cmd) error {
	return cmd.Process.Signal(syscall.SIGTERM)
}
