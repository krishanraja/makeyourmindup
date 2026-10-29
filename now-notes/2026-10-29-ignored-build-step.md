Status: `apps/cover/vercel.json` carries `ignoreCommand: git diff --quiet HEAD^ HEAD -- .`, so once merged, Vercel builds production only when a push changes `apps/cover`; replayed on past commits it skips the AGENTS.md-only canon sync (`7402394`) and builds the tiles change (`a1cd10b`).
Next: after merge, confirm in Vercel that the next docs-only push shows a canceled (ignored) build, not a production deployment.
North Star check (2026-10-29): holds.
