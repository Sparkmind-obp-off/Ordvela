# ORDVELA

**ORDVELA → Ordvela Intelligence** is an evidence-led demand-to-revenue operator cockpit.

**V0 implemented. V1 live on Cloudflare BYOK. V2 provider operating layer implemented, selected live access still requires credentials/approval.** No replacement repository, master brand or custom domain.

## URLs / release
- Production: https://ordvela.pages.dev
- Health: https://ordvela.pages.dev/api/health
- Repository: https://github.com/Sparkmind-obp-off/Ordvela — branch `main`.
- Runtime: Hono + TypeScript + Cloudflare Pages + dedicated `ordvela-production` D1.
- Migrations `0001_initial.sql` and `0002_provider_registry.sql` applied locally and remotely. Placeholder database UUID removed.
- Production `CREDENTIAL_MASTER_KEY` and `REGISTRATION_TOKEN` are managed server secrets, never repository variables. Public signup disabled; registration requires operator invitation. Sandbox can allow self-registration through ignored `.dev.vars`.
- Health/auth/demo/golden-path production smoke passed. Compatible deployment rollback and restoration exercised successfully. This is a verified V1 release, not a claim of complete enterprise hardening or proven customer revenue.

## Implemented capabilities
- Six responsive screens: Demand Feed, Opportunities, Execution, Distribution, Outcomes, Settings.
- PBKDF2 password authentication; hashed HttpOnly/Secure/SameSite sessions; workspace membership; OWNER/OPERATOR/VIEWER; password changes revoke sessions.
- Public HN search/item and GitHub issue evidence ingestion. Bounded raw public evidence retained separately from normalized records; namespaced IDs, content hashes, deduplication and explainable historical rule scores.
- Private blueprint → three constrained functional prototypes (intake, calculator, workflow with JSON files) → validation/checksum → OWNER-approved safe demo publication/revocation.
- Evidence-based message drafts; edits reset approval; OWNER approval; manual contact/follow-up recording; append-only outcomes, integer minor-unit revenue, feedback and learning attribution. No automatic external send.
- Durable D1 jobs, atomic claims, leases, retries, idempotency, queued cancellation, safe errors, request IDs and audit.
- Central provider registry with versions/capabilities/auth requirements/checklists, configuration, health/errors/timestamps, enable/disable, rotation/revocation and attributed usage.
- Encrypted workspace credential configuration; validation required before credentialed providers can be enabled. Disabling sources blocks new ingestion without deleting prior evidence.
- Provider Generator creates six persisted inspectable files: manifest, credential schema, safe adapter scaffold, fixture placeholder, contract-test scaffold, setup documentation. Generated code is NEVER executed or automatically registered. Undocumented endpoints remain `DOCUMENTATION_REQUIRED`.
- Optional Groq evidence assessment: explicit consent to send public evidence, exact source-span references, constrained recommendation, token usage, stored hypotheses, no historical score rewriting.
- Official Threads keyword adapter with verified docs/scopes and normalized contracts. Live access requires a user access token and appropriate Meta permission approval; App ID/App Secret alone cannot activate it.
- Soft workspace archive keeps history, prevents access/public demos and cancels queued jobs. Requires OWNER, explicit confirmation and exact workspace name.

## Provider truth
| Provider | Actual state |
|---|---|
| Hacker News | Operational; live source health and production ingestion proven |
| GitHub Issues | Existing public adapter preserved, contract-tested; production health depends on shared unauthenticated API quota |
| Groq | Adapter/model validation and grounded assessment tested live; model `openai/gpt-oss-20b`; exposed supplied key NOT imported to production, rotate first |
| Threads | Official adapter/fixtures tested; NOT_CONFIGURED without authorized user access token; public search approval not verified |
| OpenAI | Credential/models validation adapter; no supplied key or live generation proof |
| Templates / scoring / Pages artifacts / manual handoff | Operational built-ins |
| Reddit, X, Facebook, Instagram, Web/Search, Jobs, Email, WhatsApp, independent Workers jobs | Registry entries only, `DOCUMENTATION_REQUIRED`; no fake live connectors |

## Operator guide
1. Sign in with private operator onboarding access; immediately change the temporary password in Settings. Do not publish that file or credentials.
2. Review the five real public HN starter candidates in ORDVELA's workspace, or collect more using Demand Feed. Candidates are not confirmed buyers; inspect original evidence and dates.
3. Select a relevant opportunity. Build a constrained template with safe public title/summary. OWNER reviews and approves publication; inspect/open the artifact.
4. Prepare an evidence-linked message, review target/claims and explicitly approve. Contact manually through an appropriate channel. Record only actions/results that actually happened.
5. Record outcome, currency/revenue only if WON, and feedback. Historical scores are not silently rewritten.
6. Providers: configure fresh/rotated credentials in the password-type secure form → Validate → Enable. Check health/errors/usage. Threads requires `threads_basic` + `threads_keyword_search`; unapproved apps may return only authenticated-user posts.
7. Groq assessment is optional. It shares public source evidence with Groq only after confirmation and labels recommendations as hypotheses for human review.

Production QA uses separate **QA ONLY** workspaces, simulated contact/revenue, then soft archives the workspace and revokes demo visibility. No external messages or genuine revenue events were fabricated. Operator workspace has real source candidates but no selected executions, sent contacts or recorded revenue at onboarding.

## Local development
```sh
npm ci
npm run db:local
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
```
Ignored `.dev.vars` can define `ENVIRONMENT=development`, `SIGNUP_ENABLED=true`, a random `CREDENTIAL_MASTER_KEY`, and optional `REGISTRATION_TOKEN`. Never commit local secrets. Keys are not necessary for deterministic V0.

## Functional routes
UI `/` hashes: `#feed`, `#opportunities`, `#execution`, `#distribution`, `#outcomes`, `#settings`.
Public: `GET /api/health`, `GET /demo/:token` (safe published artifact only).
Auth: `POST /api/auth/register|login|logout`; production register requires `registration_token`.
Protected API domains: `/api/me`, `/workspaces`, `/members`, `/sources`, `/signals`, `/opportunities`, `/executions`, `/distributions`, `/outcomes`, `/metrics`, `/providers`, `/provider-generator`, `/usage`, `/audit`, `/settings`, `/jobs`.
- `POST /api/signals/ingest`: provider, query/reference, idempotency_key. HN/GitHub/Threads only.
- `GET /api/opportunities?q=&status=&min_score=`; `GET .../:id`; `POST .../:id/decision`.
- `POST .../:id/assess`: Groq, explicit confirm; `GET .../:id/assessments`.
- `POST /api/executions`; `GET .../:id`; `POST .../:id/publish|unpublish` with confirmation.
- `POST /api/distributions`; `PATCH .../:id`; `POST .../:id/approve|contact`.
- `POST /api/outcomes`: permitted next state, feedback, currency, integer revenue_minor.
- `POST /api/providers`: kind, credential fields, optional Groq model, confirm; `POST .../:id/validate|health|enable|disable`; `DELETE .../:id` revokes.
- `POST /api/provider-generator`: non-secret definition; `GET /api/provider-generator[/:id]` persisted artifacts.
- `POST /api/account/password`; `POST /api/workspaces/current/archive` with exact workspace name and confirm.
- `GET /api/jobs` processes due work; `POST .../:id/retry|cancel`.
All workspace IDs are authorized against server membership. Stable envelopes include safe error category, retryability and request_id. Provider IDs may be slugs or workspace-qualified IDs, never arbitrary hosts.

## Architecture / storage
Client → Hono API → core services → adapters / D1 jobs. Runtime uses Web APIs, no local filesystem/Node servers.
D1: users, sessions, auth_attempts, workspaces, workspace_members, providers (encrypted credentials), sources, signals, opportunities, opportunity_scores, executions, execution_artifacts, distributions, outcomes, usage_events, audit_events, jobs, settings, provider_scaffolds, intelligence_assessments.
Demos serve stored artifacts, not independent customer deployments. Visitor task/form data is session-local unless visitors export their own JSON file; ORDVELA's operational state is durable D1.

## Verification
- Build and TypeScript: PASS; worker approximately 107 kB uncompressed.
- `npm test`: 27/27 PASS, including provider/generator/normalization/credential/AI-grounding contracts and durable lifecycle.
- `npm run test:e2e`: 245 assertions PASS in recorded run (poll timing can increase assertion count).
- `npm run test:browser`: 30 checks PASS; desktop 1440×1000 / mobile 390×844.
- `npm run test:production`: 77 checks PASS using isolated archived QA workspace and secure `TEST_REGISTRATION_TOKEN` environment.
- `node tests/production-browser.mjs`: 14 authenticated read-only production checks PASS; secure operator credentials supplied only through environment.
- Live Groq assessment: PASS, one exact grounded quote, 264 input / 159 output tokens in recorded successful call. Supplied key was not installed into production.
- `npm audit`: zero vulnerabilities. Production rollback + restore: PASS, no schema downgrade or history deletion.
See `docs/58_PROVIDER_PRODUCTION_VERIFICATION.md`. Reports 54 and earlier phase statuses are historical snapshots, not current deployment truth.

## Limitations / next action
Rotate exposed Groq/Meta credentials. Configure the new Groq key in Settings; obtain a Threads USER access token through the official Meta tester/OAuth flow with the required permissions. Never paste production secrets into chat.
Deferred: independent scheduled queue consumers, full OAuth callback/token refresh, broader providers, billing, full bespoke customer-app deployment, automatic retraining, email verification/recovery/MFA, automated retention and external monitoring/load testing. Jobs are request-driven, not a permanent queue service. Recorded AI daily token limit is not a strict billing-reservation system.

## Deploy / rollback
BYOK project `ordvela`, branch `main`, dedicated D1 binding in `wrangler.jsonc`. `npm run db:remote`, build, deploy reviewed commit with `wrangler pages deploy dist --project-name ordvela --branch main`. Apply append-only migrations; back up D1 before future changes. Cloudflare Pages rollback to a previously successful compatible deployment was exercised, then the current revision restored. Never downgrade schema or delete commercial history for app rollback. Use Unpublish/credential Revoke/soft archive for explicit controlled revocation.
