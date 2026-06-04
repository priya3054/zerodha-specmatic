#!/usr/bin/env bash
# PRE-PROCESSOR: Runs before the mock validates the request.
# Converts PascalCase order field names to camelCase so the mock accepts them.
# Client sends: {"Name":"INFY","Qty":5,"Price":1555.45,"Mode":"BUY"}
# Mock expects:  {"name":"INFY","qty":5,"price":1555.45,"mode":"BUY"}
set -euo pipefail

input="$(cat || true)"

if [ -z "${input}" ]; then
  exit 0
fi

# Only transform /newOrder requests
if ! printf '%s' "$input" | grep -Eq '"path"[[:space:]]*:[[:space:]]*"/newOrder"'; then
  echo "$input"
  exit 0
fi

output="$(
  printf '%s' "$input" | sed -E \
    -e 's/"Name"([[:space:]]*:)/"name"\1/g' \
    -e 's/"Qty"([[:space:]]*:)/"qty"\1/g' \
    -e 's/"Price"([[:space:]]*:)/"price"\1/g' \
    -e 's/"Mode"([[:space:]]*:)/"mode"\1/g' \
    || true
)"

if [ -z "${output}" ]; then
  echo "$input"
  exit 0
fi

echo "$output"
