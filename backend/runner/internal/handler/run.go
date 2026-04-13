package handler

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"buildmancer/runner/internal/build"
	"buildmancer/runner/internal/dispatch"
	"buildmancer/runner/internal/lifecycle"
	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

func HandleRun(w http.ResponseWriter, r *http.Request) {
	var req models.RunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	sseWriter := sse.NewWriter(w)
	sseWriter.SetHeaders()
	ctx := r.Context()

	// Create tmpdir and materialize files
	tmpDir, err := os.MkdirTemp("", "buildmancer-run-*")
	if err != nil {
		sseWriter.Send("system_error", map[string]string{"error": "failed to create tmpdir"})
		return
	}
	defer os.RemoveAll(tmpDir)

	for path, content := range req.Files {
		fullPath := filepath.Join(tmpDir, path)
		os.MkdirAll(filepath.Dir(fullPath), 0755)
		if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
			sseWriter.Send("system_error", map[string]string{"error": fmt.Sprintf("failed to write %s", path)})
			return
		}
	}

	// Assign a dynamic port
	port := findFreePort()
	binaryPath := filepath.Join(tmpDir, "program")
	env := map[string]string{
		"BUILDMANCER_BINARY":        binaryPath,
		"BUILDMANCER_WORKSPACE_DIR": tmpDir,
		"BUILDMANCER_PORT":          fmt.Sprintf("%d", port),
	}

	// Build
	if err := build.Run(ctx, req.BuildCmd, tmpDir, env, sseWriter); err != nil {
		sseWriter.Send("run_complete", map[string]any{"all_passed": false, "error": "build failed"})
		return
	}

	// Determine if any tests need a running binary
	needsBinary := false
	for _, t := range req.Tests {
		if t.Type == "http" || t.Type == "tcp" || (t.Type == "script" && !t.ManagesLifecycle) {
			needsBinary = true
			break
		}
	}

	// Spawn binary if needed
	var proc *lifecycle.Process
	if needsBinary && req.RunCmd != "" {
		envList := buildEnvList(env)
		runCmd := os.Expand(req.RunCmd, func(key string) string { return env[key] })
		proc, err = lifecycle.Spawn(ctx, runCmd, tmpDir, envList)
		if err != nil {
			sseWriter.Send("process_crashed", map[string]any{"error": fmt.Sprintf("failed to start binary: %v", err)})
			sseWriter.Send("run_complete", map[string]any{"all_passed": false})
			return
		}
		defer proc.Kill()
		if err := lifecycle.WaitForPort(ctx, port, 5_000_000_000); err != nil {
			sseWriter.Send("process_crashed", map[string]any{"error": fmt.Sprintf("binary not ready: %v", err)})
			sseWriter.Send("run_complete", map[string]any{"all_passed": false})
			return
		}
	}

	// Dispatch tests
	passed := 0
	failed := 0
	for i, testSpec := range req.Tests {
		dispatcher, err := dispatch.Get(testSpec.Type)
		if err != nil {
			sseWriter.Send("system_error", map[string]string{"error": err.Error()})
			failed++
			continue
		}
		runEnv := dispatch.RunEnv{
			WorkspaceDir: tmpDir,
			BinaryPath:   binaryPath,
			Port:         port,
			EnvVars:      buildEnvList(env),
		}
		if proc != nil {
			runEnv.ProcessPID = proc.PID()
		}
		ok, err := dispatcher.Dispatch(ctx, i, testSpec, runEnv, sseWriter)
		if err != nil {
			sseWriter.Send("system_error", map[string]string{"error": err.Error()})
			failed++
		} else if ok {
			passed++
		} else {
			failed++
		}
	}

	allPassed := failed == 0 && (passed > 0 || len(req.Tests) == 0)
	sseWriter.Send("run_complete", map[string]any{
		"all_passed": allPassed, "passed": passed, "failed": failed,
	})
}

func findFreePort() int {
	ln, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		return 18080
	}
	port := ln.Addr().(*net.TCPAddr).Port
	ln.Close()
	return port
}

func buildEnvList(env map[string]string) []string {
	var list []string
	list = append(list, "PATH="+os.Getenv("PATH"))
	for k, v := range env {
		list = append(list, fmt.Sprintf("%s=%s", k, v))
	}
	return list
}

