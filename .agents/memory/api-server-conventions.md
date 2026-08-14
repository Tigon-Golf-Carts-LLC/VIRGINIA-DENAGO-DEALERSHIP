---
name: API server conventions
description: Gotchas for adding backend features in this pnpm monorepo's api-server + lib/db
---

- After adding/changing tables in `lib/db/src/schema/`, run `pnpm exec tsc -b` inside `lib/db` — the api-server resolves `@workspace/db` types via TypeScript project references (dist d.ts), so typecheck fails with "no exported member" until declarations rebuild. Then `pnpm run push` in lib/db to apply to the dev DB.
- **Why:** exports map points at src, but project references consume emitted declarations.
- For per-IP rate limiting behind Replit's proxy, use the RIGHTMOST X-Forwarded-For entry (appended by the trusted proxy); the leftmost entries are client-spoofable and let bots bypass limits.
- Review system design: submissions stored with approved=false; only approved rows are served publicly and only then is Review/AggregateRating JSON-LD emitted (Google penalizes fake ratings). Approving currently requires SQL — moderation UI proposed as a follow-up task.
