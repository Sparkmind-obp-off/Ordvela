# ORDVELA

Ordvela Intelligence is ORDVELA's evidence-led demand-to-revenue operator cockpit.

**Brand: LOCKED. V0: implemented and tested in sandbox. Production: BLOCKED by Cloudflare D1 quota.** No replacement repository, brand, or custom domain was created. Existing brand research and architectural documents remain preserved; their requirements are not automatic implementation claims.

## Working capabilities
- Six responsive screens: Demand Feed, Opportunities, Execution, Distribution, Outcomes, Settings.
- Password authentication (PBKDF2), server-side hashed sessions, OWNER/OPERATOR/VIEWER, authorized workspace switching and membership management.
- Public Hacker News search/item ingestion and public GitHub issue ingestion adapters. Evidence preserved separately from normalization, namespaced identifiers, content deduplication and versioned explainable rule-based scoring.
- Selected opportunity → private blueprint → deterministic intake/calculator/workflow artifact → validation → OWNER-approved publication at an unguessable demo URL. Workflow supports local JSON import/export. Demos are sandboxed and contain only operator-written public copy, never automatic raw evidence inclusion.
- Evidence-linked message drafts, edits reset approval, OWNER approval, manual contact recording, follow-up date, append-only outcomes, revenue in currency minor units and learning views.
- D1 durable jobs, atomic claiming, stale-lease recovery, bounded exponential retries, queued-job cancellation, visible failures, request IDs, actor audit and provider-attributed operation usage.
- Server-side AES-GCM credential configuration/rotation/revocation and OpenAI credential-validation adapter. Real OpenAI execution not verified; AI generation deliberately disabled.

## Preview / deployment
- Sandbox preview: https://3000-i2yyi6nevlb43te4hofpy-5185f4aa.sandbox.novita.ai
- Repository: https://github.com/Sparkmind-obp-off/Ordvela
- Production: NOT DEPLOYED. Creating `ordvela-production` returned Cloudflare's maximum-D1-databases error. No other project's database was deleted or reused.
- `wrangler.jsonc` contains an explicitly local-only placeholder database UUID. **Do not remote migrate/deploy this placeholder.** Provide one D1 slot, create `ordvela-production`, replace the UUID, then migrate and deploy.
- BYOK path selected by owner. Pages project name metadata: `ordvela`. No Pages project created while database provisioning is blocked.

## Run locally
```sh
npm ci
npm run db:local
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
```
Optional local encryption secret: create ignored `.dev.vars` with `CREDENTIAL_MASTER_KEY` set to a random high-entropy value. Never commit this file. No provider key is needed for deterministic V0.

## Operator guide
1. Create a new account/workspace in sandbox (password minimum 12 characters).
2. Demand Feed → Temukan demand. Search Ask HN or paste a canonical HN item / GitHub public issue URL.
3. Inspect job result, source evidence, publication time and heuristic score. Historical evidence does not prove demand is still active.
4. Review and select an opportunity. Execution → choose a relevant constrained template and write safe public demo copy.
5. OWNER approves publication. Open the demo and inspect artifacts.
6. Prepare a message, review actual evidence and target, approve, then manually contact through an appropriate channel. ORDVELA never sends messages.
7. Record real contact reference, outcome, revenue only if WON, and feedback.

Tests create isolated `QA ONLY` workspaces. Any QA revenue/contact records are simulations, not actual sales. Do not use test accounts as an operator workspace.

## Functional entry points
UI: `/` with hashes `#feed`, `#opportunities`, `#execution`, `#distribution`, `#outcomes`, `#settings`.
Public: `GET /api/health`; `GET /demo/:token` (published safe artifact only).
Auth: `POST /api/auth/register`, `/login`, `/logout`.
Protected API: `/api/me`, `/workspaces`, `/members`, `/sources`, `/signals`, `/opportunities`, `/executions`, `/distributions`, `/outcomes`, `/metrics`, `/providers`, `/usage`, `/audit`, `/settings`, `/jobs`.
- Ingest: `POST /api/signals/ingest` with provider, query/reference, idempotency_key.
- Feed filters: `GET /api/opportunities?q=&status=&min_score=`.
- Detail: `GET /api/opportunities/:id`; decision: `POST .../:id/decision`.
- Build: `POST /api/executions`; inspect: `GET .../:id`; publish/unpublish: `POST .../:id/publish|unpublish` with confirm.
- Distribution: `POST /api/distributions`; `PATCH .../:id`; `POST .../:id/approve|contact`.
- Outcomes: `POST /api/outcomes` with distribution_id, state, feedback, currency and integer revenue_minor. Valid state transitions enforced.
- Providers: `POST /api/providers`; `POST .../:id/validate`; `DELETE .../:id` (OWNER, confirmation for credential mutations).
- Jobs: `GET /api/jobs` drives processing; `POST .../:id/retry|cancel`.
All workspace requests authorize `X-Workspace-ID` against membership, not browser trust. Stable success/error envelopes include request_id.

## Data / architecture
Client → Hono API → core / adapters / D1 durable jobs. Runtime uses only Web APIs.
D1 tables: users, sessions, auth_attempts, workspaces, workspace_members, sources, signals, opportunities, opportunity_scores, executions, execution_artifacts, distributions, outcomes, providers, usage_events, audit_events, jobs, settings.
Raw evidence and historical scoring/commercial records retained. No operational in-memory/file persistence. Demo form/task interaction is intentionally ephemeral until the visitor exports their own local file; it is not customer production storage.

## Validation
`npm run typecheck`, `npm run build`, `npm test` (18 passing tests), `npm run test:e2e` (167 assertions), `npm run test:browser` (26 checks, desktop 1440×1000 and mobile 390×844), `npm audit` (0 vulnerabilities).
Test artifacts in ignored `test-results/`; contains transient test sessions, never commit. See `docs/54_IMPLEMENTATION_VERIFICATION.md` for evidence and limitations.

## Remaining / next steps
Smallest unblock: provide one Cloudflare D1 slot. Then configure actual DB binding, production secrets, operator onboarding/signup policy, remote migration, preview/live smoke verification and production deploy. Production readiness is not claimed.
Deferred: autonomous source scheduling, queues/cron independent of visitors, LLM-generated solutions, broad social connectors, password reset/email verification/MFA, automated messaging, billing, automatic score retraining, dedicated customer-app deployments, deletion/retention administration, load/performance validation and external monitoring. Templates prove small interactions, not arbitrary bespoke production software.

## Release / rollback
After D1 provisioning use BYOK Wrangler Pages on `main`, with the recorded `ordvela` project name. Back up D1 before any schema change; apply append-only migrations. For application rollback redeploy the prior reviewed commit against compatible schema; do not undo commercial history. Revoke demo URLs via Unpublish and credentials via Settings. Production rollback and alerting remain unverified until a real deploy.
