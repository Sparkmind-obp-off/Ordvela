# ORDVELA

**ORDVELA → Ordvela Intelligence** is an evidence-led demand-to-revenue operator cockpit.

**V0 implemented. V1 live on Cloudflare BYOK. V2 provider operating layer implemented, selected live access still requires credentials/approval.** No replacement repository, master brand or custom domain.

## RapidAPI Acquisition Bridge v0.1 · application v0.5
Server-side adapter, provider-neutral configuration/quota/run/receipt tables, FREE-FIRST recommendation router, derived provider evaluations and existing intelligence integration implemented. Apify retained. Runtime `RAPIDAPI_KEY` is a managed server secret, never a frontend field/value or raw D1 credential. Global secret-reflection input guard and safe logging added.

One candidate staged: ytjar/yt-api, allowlisted host `yt-api.p.rapidapi.com`, GET `/comments?id=VIDEO_ID`, one public video. Pricing/subscription/free quota remain UNKNOWN; response mapping is synthetic-contract tested, not live-verified. No RapidAPI provider request sent; no real RapidAPI evidence or opportunity claimed. Application ID does not prove subscription. All seven other source categories have no reviewed candidate. Details: [RapidAPI implementation / gates](docs/62_RAPIDAPI_ACQUISITION_ARCHITECTURE.md).

Settings → RapidAPI: register metadata → OWNER review terms/schema → verify subscribed plan and hard-limit/no-overage across all billing dimensions → record free quota/period → authorize one bounded Rp0 validation → inspect usable real output → quality approve → enable config + workspace provider. Until then: MOCK / DISCOVERED, disabled. Limits: 1 request, 10 items, 10s/300kB, 30-day UTC scope; shared quota reservations, no external retry/paid fallback. `maxSpend=0` enforced. No guessed health/identity endpoint. A generic Validate button cannot manufacture live authentication.

Local verification: 69 tests (18 RapidAPI), 312–324 API assertions and 56 desktop/mobile browser checks PASS; typecheck/build PASS, npm audit zero vulnerabilities. Full mock produces two evidence records, one demand opportunity and one non-demand signal; cross-provider dedup preserves canonical identity and additional acquisition receipts. Live free validation / Apify comparison remain blocked by missing account-plan proof. Production results recorded in doc 62 after deployment. GitHub push still requires restored write authorization; commits retained locally.

### RapidAPI functional API entry points
Authenticated and workspace-scoped: `GET /api/rapidapi`, `POST /api/rapidapi/configs`, `POST /api/rapidapi/configs/:id/review|policy|approve|enable|disable`, `POST /api/rapidapi/dry-run`, `GET|POST /api/rapidapi/acquisitions`, `POST .../:id/cancel`, `GET .../:id/evidence`; mutations OWNER only. `GET /api/acquisition-router?capability=youtube-comments&max_spend=0` is recommendation only; `GET /api/provider-evaluations?days=30` derives durable metrics (1–90 days). No secret endpoint. Paid eligibility false; assisted revenue non-additive; currencies never mixed; zero-cost ROI undefined/null.

## Historical Apify Acquisition Bridge v0.4
Generic async Actor/run/dataset bridge, replaceable workspace Actor Registry, bounded paid confirmation, durable acquisition receipts, cost/usage history and existing demand-to-opportunity integration implemented. `APIFY_API_TOKEN` is a managed server secret, never an input/value in frontend or stored in D1. Latest supplied token identity validated read-only. No paid Actor run performed; no live Actor acquisition/opportunity proof claimed. Actor readiness is separate from application deployment. Details and gates: [Apify architecture / implementation](docs/61_APIFY_ACQUISITION_ARCHITECTURE.md).

Open Settings → Provider Registry → Apify Validate / Enable (workspace access), then Apify Acquisition Bridge → select/inspect Actor → review terms/schema/pricing → explicitly authorize one bounded validation run. Only the YouTube Comments input/output profile has an implementation; the current candidate is resource-incompatible and cannot execute under the fixed bounds. Other slots are metadata-only until reviewed source mappings and tests exist. Never treat Apify as official Meta access or a bypass.

Local checks: 51 tests, 312 API assertions, 48 browser checks, build/typecheck PASS. v0.4.0 is deployed on existing Cloudflare BYOK; production golden path 79 checks in final repeat (earlier 77 also passed), authenticated browser 14 checks and Apify read-only setup 107 checks plus 67 final resource checks PASS. Final diagnostics deployment: https://9ee897d9.ordvela.pages.dev. Eight candidate bindings saved disabled/unreviewed. The selected YouTube build requires 1024 MB, exceeding the fixed 256 MB bound: DOCUMENTATION_REQUIRED, not ready to run. Reddit candidate: BLOCKED_COMPLIANCE. Zero paid runs, live Apify evidence or opportunities. GitHub push is blocked by rejected authentication; commits are saved locally. Detailed Actor matrix: doc 61.

## Historical FIN Meta v0.3 — actual state
Bounded official read adapters, encrypted Facebook/Instagram/Threads configuration, provider-specific FIN modes and evidence review are implemented. New Meta posts must pass `meta-demand-gate-v1` before opportunity creation; non-demand signals remain inspectable. `rules-v1.0` and historical scores are unchanged. HN/GitHub public-source regression repaired.

Latest supplied tokens were actually tested: three Facebook identity successes, all Threads token checks rejected with 190, four authorized Page feeds rejected with permission error 10, no linked Professional IG asset returned. Temporary encrypted local/isolated production QA credentials revoked; production QA archived. Real Meta evidence/opportunities/scores: **0/0/0**. Production Meta remains unconfigured/not enabled pending passing validation and explicit Page/workspace selection. Do not mistake fixture tests or app deployment for live Meta coverage. Full proof and operator steps: [report 59](docs/59_FIN_META_IMPLEMENTATION.md).

Local verification: build/typecheck PASS; 37 tests PASS; API 320 recorded assertions; browser 42 checks. v0.3 is LIVE on existing Cloudflare BYOK: production health DB ready; smoke 77 checks and authenticated operator browser 14 checks PASS. Supplied-token production QA confirmed the same blocked Meta states; see report 58.

## URLs / release
- Production: https://ordvela.pages.dev
- Health: https://ordvela.pages.dev/api/health
- Repository: https://github.com/Sparkmind-obp-off/Ordvela — branch `main`.
- Runtime: Hono + TypeScript + Cloudflare Pages + dedicated `ordvela-production` D1.
- Migrations `0001_initial.sql`, `0002_provider_registry.sql`, `0003_apify_acquisition.sql`, `0004_acquisition_provider_configs.sql` applied locally and remotely (additive Actor metadata/jobs/provenance). Placeholder database UUID removed.
- Production `CREDENTIAL_MASTER_KEY`, `REGISTRATION_TOKEN` `APIFY_API_TOKEN` and `RAPIDAPI_KEY` are managed server secrets, never repository variables. Public signup disabled; registration requires operator invitation. Sandbox can allow self-registration through ignored `.dev.vars`.
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
| Threads | Bounded keyword adapter tested; supplied candidates rejected by Threads (190), local AUTH_ERROR; not production enabled |
| Facebook Pages | Published authorized feed adapter tested; four actual Page feeds permission-blocked (10), local BLOCKED_PERMISSION; no live ingestion |
| Instagram Professional | Facebook Login media/caption adapter tested; no linked IG User ID returned through authorized Pages, live ingestion BLOCKED |
| Apify | Runtime identity validated; bridge/Actor registry/async acquisition implemented and mock-tested; paid live Actor/output validation awaits OWNER approval |
| OpenAI | Credential/models validation adapter; no supplied key or live generation proof |
| Templates / scoring / Pages artifacts / manual handoff | Operational built-ins |
| Reddit, X, Web/Search, Jobs, Email, WhatsApp, independent Workers jobs | Registry entries only, `DOCUMENTATION_REQUIRED`; no fake live connectors |

## FIN operating guide
Settings → Providers: Threads token; Facebook Page token + Page ID; Instagram Facebook Login token + linked Professional IG User ID. Empty password inputs never show stored values. Configure/rotate → Validate → Enable only if healthy. Rotate exposed external credentials first. Demand Feed → Temukan demand selects only available discovery providers; Meta limit is 1–25, one API page, no automatic paging. Review job counts and raw signals/gate reasons, then review qualified opportunities. No scraping/private-account search/automatic contact.

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

## Apify acquisition routes (authenticated, workspace scoped)
- `GET /api/acquisitions/actors`: eight slots, configured boolean, metadata and reservation gates; no token.
- `GET /api/acquisitions/discover?q=`: OWNER read-only Store discovery, max 5 candidates.
- `POST /api/acquisitions/actors`: OWNER capability + Actor ID + profile + confirm; inspect only.
- `POST /api/acquisitions/actors/:id/review|enable|disable`: separate human terms/review and live-run gating.
- `POST /api/acquisitions`: OWNER reviewed registry_id/actor_revision, query (one public video), UTC dates, max_items (1–25), max_pages=1, timeout_seconds (30–180), max_charge_usd (explicit up to 1), validation_run boolean, confirm, authorize_spend and idempotency_key.
- `GET /api/acquisitions`: job/Actor/run/dataset/query fingerprint/bounds/results/usage/cost history and yield.
- `GET /api/acquisitions/:id/evidence`: provenance receipts, including deterministic deduplicates.
- `POST /api/acquisitions/:id/cancel`: confirmation; abort requested, not automatically confirmed/refunded.
Request-driven polling only; no independent cron. PPE ceiling limits Actor charge, platform fees may be additional. UNKNOWN start outcomes are not retried; inspect Apify console before any new execution.

## Functional routes
UI `/` hashes: `#feed`, `#opportunities`, `#execution`, `#distribution`, `#outcomes`, `#settings`.
Public: `GET /api/health`, `GET /demo/:token` (safe published artifact only).
Auth: `POST /api/auth/register|login|logout`; production register requires `registration_token`.
Protected API domains: `/api/me`, `/workspaces`, `/members`, `/sources`, `/signals`, `/opportunities`, `/executions`, `/distributions`, `/outcomes`, `/metrics`, `/providers`, `/provider-generator`, `/usage`, `/audit`, `/settings`, `/jobs`.
- `POST /api/signals/ingest`: provider + idempotency_key; HN query/reference, GitHub canonical reference, Threads query + optional integer limit 1–25, Facebook/Instagram feed/media with optional limit only (no query/reference). Token/asset IDs come only from encrypted provider configuration.
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
D1: users, sessions, auth_attempts, workspaces, workspace_members, providers (encrypted credentials), sources, signals, opportunities, opportunity_scores, executions, execution_artifacts, distributions, outcomes, usage_events, audit_events, jobs, settings, provider_scaffolds, intelligence_assessments, actor_registry, acquisition_jobs, acquisition_signals, provider_configs, provider_quota_budgets, acquisition_runs, evidence_receipts. Apify/RapidAPI tokens stay in managed runtime secrets, not database.
Demos serve stored artifacts, not independent customer deployments. Visitor task/form data is session-local unless visitors export their own JSON file; ORDVELA's operational state is durable D1.

## Verification
- Build and TypeScript: PASS; worker approximately 151 kB uncompressed.
- `npm test`: 51/51 PASS, including provider/generator/normalization/credential/AI-grounding contracts and durable lifecycle.
- `npm run test:e2e`: 320 assertions PASS (final repeat 312, both successful; polling-dependent count) in recorded run (poll timing can increase assertion count).
- `npm run test:browser`: 48 checks PASS; desktop 1440×1000 / mobile 390×844.
- `npm run test:production`: 77 checks PASS using isolated archived QA workspace and secure `TEST_REGISTRATION_TOKEN` environment.
- `node tests/production-browser.mjs`: 14 authenticated read-only production checks PASS; secure operator credentials supplied only through environment.
- Live Groq assessment: PASS, one exact grounded quote, 264 input / 159 output tokens in recorded successful call. Supplied key was not installed into production.
- `npm audit`: zero vulnerabilities. Historical v0.2 production rollback + restore: PASS, no schema downgrade or history deletion.
See `docs/58_PROVIDER_PRODUCTION_VERIFICATION.md`. Reports 54 and earlier phase statuses are historical snapshots, not current deployment truth.

## Limitations / next action
Rotate exposed RapidAPI/Apify/Groq/Meta credentials. Verify a subscribed hard-limited zero-cost RapidAPI plan before live validation; do not assume the shared key or Application ID proves free eligibility. Configure the new Groq key in Settings; obtain a Threads USER access token through the official Meta tester/OAuth flow with the required permissions. Never paste production secrets into chat.
Deferred: independent scheduled queue consumers, full OAuth callback/token refresh, broader providers, billing, full bespoke customer-app deployment, automatic retraining, email verification/recovery/MFA, automated retention and external monitoring/load testing. Jobs are request-driven, not a permanent queue service. Recorded AI daily token limit is not a strict billing-reservation system.

## Deploy / rollback
BYOK project `ordvela`, branch `main`, dedicated D1 binding in `wrangler.jsonc`. `npm run db:remote`, build, deploy reviewed commit with `wrangler pages deploy dist --project-name ordvela --branch main`. Apply append-only migrations; back up D1 before future changes. Cloudflare Pages rollback to a previously successful compatible deployment was exercised, then the current revision restored. Never downgrade schema or delete commercial history for app rollback. Use Unpublish/credential Revoke/soft archive for explicit controlled revocation.
