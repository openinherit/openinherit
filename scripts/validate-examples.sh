#!/usr/bin/env bash
set -euo pipefail

RESOLVE_FLAGS="--resolve v1/dialect.json --resolve v1/ --resolve v1/common/"
SCHEMA="v1/schema.json"
SKIP="broken-references.json catalogue-only.json sample-will-text.txt"
PASSED=0
FAILED=0

for fixture in examples/fixtures/*; do
  filename=$(basename "$fixture")

  # Skip non-JSON and known-invalid files
  if echo "$SKIP" | grep -qw "$filename"; then
    echo "SKIP: $filename"
    continue
  fi

  if npx jsonschema validate "$SCHEMA" "$fixture" $RESOLVE_FLAGS 2>/dev/null; then
    echo "PASS: $filename"
    PASSED=$((PASSED + 1))
  else
    echo "FAIL: $filename"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "Results: $PASSED passed, $FAILED failed"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
