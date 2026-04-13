#!/bin/bash
set -e
RESULT=$(echo "hello from script" | $BUILDMANCER_BINARY)
[ "$RESULT" = "hello from script" ] || { echo "FAIL: expected 'hello from script', got '$RESULT'"; exit 1; }
echo "PASS: echo works from script"
