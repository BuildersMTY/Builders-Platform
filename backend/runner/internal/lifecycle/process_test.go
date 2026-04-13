package lifecycle

import (
	"context"
	"testing"
	"time"
)

func TestSpawnAndKill(t *testing.T) {
	ctx := context.Background()
	proc, err := Spawn(ctx, "sleep 30", "/tmp", nil)
	if err != nil {
		t.Fatalf("failed to spawn: %v", err)
	}
	if proc.PID() <= 0 {
		t.Fatal("expected positive PID")
	}
	err = proc.Kill()
	if err != nil {
		t.Fatalf("failed to kill: %v", err)
	}
}

func TestWaitForPortTimeout(t *testing.T) {
	ctx := context.Background()
	err := WaitForPort(ctx, 19999, 500*time.Millisecond)
	if err == nil {
		t.Fatal("expected timeout error for unreachable port")
	}
}
