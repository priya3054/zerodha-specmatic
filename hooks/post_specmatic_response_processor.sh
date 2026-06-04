#!/usr/bin/env bash
# POST-PROCESSOR: Runs after the mock generates the response.
# Converts camelCase response fields back to PascalCase for the client.
# Mock returns:   {"message":"Order saved!"}
# Client expects: {"Message":"Order saved!"}
set -euo pipefail

input="$(cat || true)"

if [ -z "${input}" ]; then
  exit 0
fi

# Only transform /newOrder responses
if ! printf '%s' "$input" | grep -Eq '"path"[[:space:]]*:[[:space:]]*"/newOrder"'; then
  echo "$input"
  exit 0
fi

# Only convert if the original request had PascalCase field names (e.g., "Name")
# If the request was already camelCase (existing tests), pass through unchanged
if ! printf '%s' "$input" | grep -Eq '"Name"[[:space:]]*:[[:space:]]*"'; then
  echo "$input"
  exit 0
fi

output="$(
  printf '%s' "$input" | sed -E \
    -e 's/"message"([[:space:]]*:)/"Message"\1/g' \
    || true
)"

if [ -z "${output}" ]; then
  echo "$input"
  exit 0
fi

echo "$output"
