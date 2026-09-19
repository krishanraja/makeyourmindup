#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="bkyuxvschuwngtcdhsyg"

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Install: https://supabase.com/docs/guides/cli" >&2
  exit 1
fi

for fn in enrich-profile generate-result send-result-email track-fork; do
  echo "Deploying $fn..."
  supabase functions deploy "$fn" \
    --project-ref "$PROJECT_REF" \
    --no-verify-jwt
done
