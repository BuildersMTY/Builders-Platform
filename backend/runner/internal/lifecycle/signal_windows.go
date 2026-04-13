//go:build windows

package lifecycle

import (
	"fmt"
	"os/exec"
)

// sendTermSignal is a no-op on Windows: SIGTERM is not supported.
// Returning an error causes Kill() to proceed directly to Process.Kill().
func sendTermSignal(cmd *exec.Cmd) error {
	return fmt.Errorf("SIGTERM not supported on Windows")
}
