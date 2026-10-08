# ORDVela — Apify Acquisition Architecture

Status: CANONICAL / DESIGN LOCK
Date: 2026-10-08

## Decision

ORDVELA will use **Apify as an external acquisition bridge** for community/social/search data where a direct official API is unavailable, insufficient or economically inferior.

This does not replace provider independence and does not turn Ordvela into an Apify-dependent product.

## Responsibility split

**Apify:** Actor execution, external acquisition, source-specific extraction, run lifecycle, dataset/result transport.

**Ordvela:** provider selection policy, source configuration, evidence normalization, deduplication, demand detection, intent/commercial qualification, scoring, opportunity creation, human review, outcomes and revenue learning.

**LLM:** structured extraction/assessment where enabled; never the raw evidence source of truth.

**D1:** provider configuration, jobs, evidence references, normalized signals, opportunities, usage events and audit state.

## Runtime topology

**Browser → Ordvela API/Worker → Apify Adapter → Apify API → Actor → Dataset/Run Output → Ordvela Worker → Evidence → Demand Intelligence → Opportunity**

The browser never calls Apify directly with the runtime secret.

## Credential model

Primary runtime secret: **APIFY_API_TOKEN**.

Store it in the server-side secret store. Never put it in frontend environment variables, return it through settings APIs, write it to logs, commit it to Git, or ask an operator to paste it into a public field.

Where supported, use a scoped token with only the resources required by Ordvela.

## MCP distinction

Apify MCP is an operator/tooling connection. It is useful for discovering Actors, inspecting Actor details/schema and comparing acquisition options. It is not a substitute for the production application's runtime credential.

Production acquisition uses the Ordvela Apify adapter, persisted jobs, provenance and usage/cost accounting.

## Actor registry model

Logical capability → source → Actor ID → schema → pricing → permission/security → status.

Examples: reddit-search, threads-search, youtube-comments, google-search, tiktok-comments, instagram-posts, facebook-posts and x-search.

Actor selection remains replaceable.

## Acquisition lifecycle

**DISCOVER → REVIEW → AUTHORIZE → CONFIGURE → VALIDATE → BOUNDED RUN → RETRIEVE → NORMALIZE → DEDUP → INTELLIGENCE**

No Actor is production-enabled solely because it is discoverable.

## Bounded execution

Every run should have explicit bounds where supported: query scope, time range, result/item limit, run timeout, maximum spend/charge and workspace/job budget.

Start small, inspect signal quality, then scale.

## Provenance

For every Apify acquisition, retain provider=apify, Actor ID, run ID, dataset ID when available, source/platform, query/input fingerprint, retrieval timestamp, result count, cost/usage metadata, freshness, terms/licensing reference and acquisition status.

## Data boundary

Apify output is **evidence**, not truth. The normalized Ordvela model is the only input expected by the intelligence core.

No Actor-specific field should be required by scoring, opportunity, execution, distribution or outcomes.

## Security / policy boundary

Ordvela must not use Apify to bypass platform controls, access private accounts without authorization, use stolen cookies/session tokens, defeat CAPTCHA, automate user accounts through prohibited methods or claim an unofficial acquisition route is an official API.

Only permitted/public/licensed acquisition paths are eligible for production.

## Economic gate

Actor cost is evaluated against **qualified demand → opportunity → conversion → revenue**. The objective is maximum commercial signal per unit cost, not maximum scraping volume.

## Initial implementation order

1. Finalize Apify runtime credential configuration.
2. Discover and review candidate Actors.
3. Select a minimal first source set.
4. Add Actor Registry.
5. Implement bounded run adapter.
6. Retrieve and preserve results.
7. Normalize into existing evidence contract.
8. Run demand qualification/scoring.
9. Measure opportunity yield.
10. Expand sources only when economics justify it.

## Production gate

Apify is production-enabled only after runtime token validation succeeds; selected Actor permissions/security are reviewed; input schema is validated; a bounded test run succeeds; output mapping is tested; provenance is persisted; cost metadata is observable; downstream demand/opportunity passes; and no secret leakage is observed.


## Implemented runtime increment — v0.4.0 (2026-10-08)

Upstream through `e7294cb` audited: Apify previously existed only as a PLANNED manifest and architecture documents. The existing Hono/API/auth/provider/job/D1/intelligence loop is extended, not replaced.

### Modules and persistence
- `src/apify.ts`: typed adapter, header-only authentication, fixed api.apify.com host, manual redirects rejected, bounded streaming JSON, safe typed failures, Store discovery, public Actor inspection, full-schema/review hashes, pinned successful build, current active pricing metadata, limited-permission and compliance gates, async start/status/abort/dataset retrieval and isolated `youtube-comments-v1` input/output profile. No Actor SDK or local runtime server.
- `src/acquisition.ts`: workspace Actor Registry, review/enable/disable lifecycle, existing-job extension, deterministic input fingerprint, explicit spending approval, atomic reservation/concurrent admission, durable start intent, asynchronous polling, dataset ingestion, provenance links, cancellation/abort and safe UNKNOWN outcomes.
- `src/providers.ts` / `src/api.ts` / `src/jobs.ts`: existing registry/OWNER permissions/workspace authorization and durable request-driven queue reused. Apify token stored only as a Cloudflare secret. Workspace provider validation/enabling is separate from Actor enabling and per-run paid approval.
- `src/core.ts`: `acquisition-demand-gate-v1` reuses the FIN qualification gate and adds explicit vendor/recommendation questions and qualitative discussion/interest/weak/problem/commercial-demand categories. `rules-v1.0` scoring and all historical scores remain unchanged.
- `public/static/acquisition.js`, existing shell/app: Settings → Apify controls, eight logical slots, read-only candidate discovery, schema/pricing/terms review, bounded paid-run confirmation and acquisition history/quality/cost/evidence review. No token input, masked token or suffix appears in this UI.
- `migrations/0003_apify_acquisition.sql`: additive `actor_registry`, `acquisition_jobs` (FK extension of existing jobs), and many-to-many `acquisition_signals` provenance receipts. Existing tables/history preserved. No tokens stored in these tables. D1 backup taken privately before remote migration; backup is ignored and not a public asset.

### Gates and limitations
1. Runtime secret configured → read-only `/users/me` validated → OWNER enables workspace access.
2. Candidate Actor is inspected (no execution); default registry state remains disabled/unreviewed.
3. OWNER reviews terms/source permission, schema, pricing and exact review hash. This does not authorize spending.
4. A single bounded validation run requires OWNER `confirm=true`, `authorize_spend=true`, an explicit USD ceiling, current Actor revision and a distinct idempotency key. No paid Actor was run by the implementation agent.
5. At dispatch, schema/build/pricing/security are re-inspected. Changes invalidate approval before paid POST.
6. Start intent is durably recorded before paid POST. Ambiguous start stays UNKNOWN; there is no automatic resubmission. Manual console reconciliation remains an operator task, not a fabricated successful run.
7. Actual run ID/build/Actor and dataset references are verified. Successful output needs valid mapped records to validate the Actor. Empty output may finish collection but does not validate mapping. Partial rejected records are reported; all-invalid records fail.
8. OWNER may enable an Actor only after an actual successful bounded run with usable output. Every subsequent acquisition still requires explicit paid approval.

Only the YouTube comments profile is executable in this increment. Other logical slots support replaceable metadata bindings but are not deeply integrated/live-validated source adapters. No arbitrary Actor input, URLs, cookie/session credentials, webhooks, broad searches, autonomous posting/DM or private-account acquisition accepted. A discovered Actor advertising restriction bypass is BLOCKED_COMPLIANCE, not silently approved.

Worker-safe asynchronous processing uses short request-driven steps and persisted job state. There is no independent cron/queue daemon. Poll `/api/jobs` or `/api/acquisitions` to advance steps. Actor timeout is server-side; after a monitoring deadline the system requests abort and retains external state for review. Unknown outcomes continue occupying the conservative concurrency gate. Archive is blocked until active/unknown external acquisition is resolved. Cancellation is not a refund.

### Cost controls
- One explicit public YouTube video; no channel/platform-wide crawl.
- 1–25 output items locally, maxPages=1, Actor maxComments, timeout 30–180 seconds, 256 MB, limited permissions, no restart-on-error.
- UTC window up to 30 days; oldestCommentDate supplied to Actor. Upper date checked locally only where an explicit ISO publication timestamp exists. The documented Actor sample lacks publication timestamps: unknown dates remain UNKNOWN, not inferred from retrieval or relative text.
- Explicit ceiling USD 0.01–1.00; Actor minimum ceiling and PPE pricing compatibility checked.
- Atomic admission reservations: USD 1/workspace/rolling day, USD 2/shared runtime/rolling day, max 2 active/unknown acquisitions. Reservations are conservative, including cancellations, and not credits/billing.
- Apify documents maxTotalChargeUsd specifically for PPE Actor charges, not every platform fee. Observed usageTotalUsd is recorded separately and over-budget total observations disable workspace Apify access. Metadata estimates are not fixed quotes; platform fees may be additional. No guaranteed all-in spend cap is claimed.

### Provenance and intelligence
Dataset reads limited to one page/25 items/300 kB and selected text/ID/time fields. Raw text bounded to 20,000 characters; no unlimited raw dataset copied into D1. Persist source=YouTube, provider=Apify, original public comment URL/ID, author, explicit/unknown publication time, retrieval time, Actor/build/version, run/dataset, row reference, input fingerprint, pricing estimate, actual usage and terms reference. Actor AI verdicts never become raw evidence or overwrite scores. `verified=false` reflects third-party observed content, not official-source verification.

Signals deduplicate deterministically by namespaced source ID and normalized content hash. Every repeated acquisition links to the existing signal via acquisition_signals; it does not create uncontrolled opportunities. Non-demand text is retained without an opportunity; qualified outcomes remain human-review hypotheses, never proven buyers. Existing outcome/revenue learning can join these same evidence/opportunity identities.

### Observed local verification
Build/typecheck PASS; 51 unit/contract/D1/security/API tests PASS, including 14 Apify tests. Mock acquisition produced two signals, one qualified opportunity, repeat acquisition zero additional signals/opportunities and four run-to-evidence receipts. API regression 312 assertions PASS; browser 48 checks PASS, zero unexpected errors at desktop/mobile. npm audit zero vulnerabilities. Entire Git history scan: 181 blobs, zero supplied/runtime secret matches. Production validation is recorded below after release; no mock result is labelled live acquisition success.

Official API references reviewed: https://docs.apify.com/api/v2/actors-runs-post, https://docs.apify.com/api/v2/actor-get, https://docs.apify.com/api/v2/actor-build-get, https://docs.apify.com/api/v2/store-get, https://docs.apify.com/api/client/js/reference/interface/ActorStartOptions.
