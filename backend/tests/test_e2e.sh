#!/bin/bash
# backend/tests/test_e2e.sh
# End-to-end smoke test for Buildmancer Phase 1
# Requires: Postgres running, Go runner compiled and running, Python API running
set -e

API="http://localhost:8000"

echo "=== Buildmancer E2E Smoke Test ==="

# 1. Check API is up
echo "[1/7] Checking API health..."
curl -sf "$API/api/courses" > /dev/null
echo "  OK"

# 2. List courses
echo "[2/7] Listing courses..."
COURSES=$(curl -sf "$API/api/courses")
echo "  Courses: $COURSES"

# 3. Enroll
echo "[3/7] Enrolling in hello-world/go..."
ENROLL=$(curl -sf -X POST "$API/api/enroll/hello-world/go" \
  -H "Content-Type: application/json" \
  -d '{"difficulty":"junior","locale":"es"}')
echo "  Enrollment: $ENROLL"

# 4. Get files
echo "[4/7] Getting working files..."
FILES=$(curl -sf "$API/api/files/hello-world/go")
echo "  Files: $(echo $FILES | python3 -c 'import sys,json; print([f["filepath"] for f in json.load(sys.stdin)])')"

# 5. Patch a file (implement Hello)
echo "[5/7] Patching main.go with solution..."
curl -sf -X PATCH "$API/api/files/hello-world/go/main.go" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"package main\\n\\nimport (\\n\\t\\\"bufio\\\"\\n\\t\\\"fmt\\\"\\n\\t\\\"os\\\"\\n)\\n\\nfunc Hello() string {\\n\\treturn \\\"Hello, World!\\\"\\n}\\n\\nfunc main() {\\n\\treader := bufio.NewReader(os.Stdin)\\n\\tline, _ := reader.ReadString('\\\\n')\\n\\tfmt.Print(line)\\n}\"}" > /dev/null
echo "  OK"

# 6. Trigger a run
echo "[6/7] Running tests for basics/hello..."
RUN_RESP=$(curl -sf -X POST "$API/api/run/hello-world/go/basics/hello")
RUN_ID=$(echo $RUN_RESP | python3 -c 'import sys,json; print(json.load(sys.stdin)["run_id"])')
echo "  Run ID: $RUN_ID"

# 7. Stream results
echo "[7/7] Streaming results..."
curl -sf -N "$API/api/stream/$RUN_ID" 2>&1 | head -30
echo ""

# 8. Check progress
echo "[BONUS] Checking progress..."
PROGRESS=$(curl -sf "$API/api/progress/hello-world/go")
echo "  Progress: $PROGRESS"

echo ""
echo "=== Smoke test complete ==="
