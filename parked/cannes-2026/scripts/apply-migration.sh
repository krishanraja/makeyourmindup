#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="bkyuxvschuwngtcdhsyg"
MIGRATION_FILE="${1:-supabase/migrations/20260527000000_cannes_responses.sql}"

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "Set SUPABASE_ACCESS_TOKEN (personal access token from supabase.com/dashboard/account/tokens)." >&2
  exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Migration file not found: $MIGRATION_FILE" >&2
  exit 1
fi

SQL_JSON=$(jq -Rs . < "$MIGRATION_FILE")
PAYLOAD=$(jq -n --argjson q "$SQL_JSON" '{ query: $q }')

curl -sS -X POST \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  | jq .
