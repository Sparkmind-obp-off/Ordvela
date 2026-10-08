# ORDVELA INTELLIGENCE — Implementation Baseline
Status: V0 IMPLEMENTED / V1 PRODUCTION VERIFIED / V2 PROVIDERS + FIN META
Date: 2026-10-08
Runtime increment: 0.4.0. Apify runtime proof/status: `61_APIFY_ACQUISITION_ARCHITECTURE.md`. v0.3 observations below retained as historical Meta proof. Current FIN proof: `59_FIN_META_IMPLEMENTATION.md`; deployment results: `58_PROVIDER_PRODUCTION_VERIFICATION.md`.

## Repository audit
Initial baseline `19c4341` was documentation only. Runtime `09702d8` delivered V0; `211a945` recorded the verified v0.2 provider release. Upstream Meta additions through `d0aa82e` were audited and preserved. The HN/GitHub unconditional-credential regression and incomplete Meta bounds/UI/qualification were fixed, not deployed unchanged. No repository/brand/domain/architecture replacement.

## Current structure
- `src/index.ts`: Hono Pages worker, health v0.3.0, secure headers, isolated approved public artifacts.
- `src/auth.ts`: PBKDF2, hashed sessions, roles/workspace membership and invitation-gated production registration.
- `src/api.ts`: scoped revenue-loop, provider/generator/assessment APIs; strict Meta modes/limits/credential schema; password/session revocation and archive.
- `src/core.ts`: unchanged `rules-v1.0` scoring/templates; separate `meta-demand-gate-v1` request/context qualification with evidence quotes.
- `src/adapters.ts`: HN/GitHub; Threads v1.0; Facebook published Page feed and Instagram Facebook Login Professional media v26.0; exact official permalink checks; header-only tokens; rejected redirects; safe typed errors; Groq/OpenAI and AES-GCM.
- `src/providers.ts`: 18 registry entries, eleven adapters/built-ins, seven honest planned entries; lifecycle/scaffold generator; decrypt only credentialed sources.
- `src/jobs.ts`: durable claims/retries/idempotency and extraction results; all accepted Meta signals retained, only qualified Meta demand creates an opportunity.
- `public/static/`: six screens; provider-specific FIN controls, unavailable-provider options, latest evidence review/reasons, safe empty-password configuration + numeric asset fields, job counts.
- Existing two D1 migrations unchanged; no score/history rewrite or schema downgrade.
- Tests: core/contracts/D1/Meta API fixtures, real-source API loop, desktop/mobile UI and isolated production regression scripts.

## Observed local verification
Build/typecheck PASS. 37 unit/contracts/D1/API tests PASS. Recorded extended API run: 320 assertions PASS. Desktop/mobile: 42 checks PASS, zero unexpected page errors. v0.3 production smoke: 77 checks PASS; authenticated read-only operator browser: 14 PASS; health HTTP 200, database ready, runtime v0.3.0. Deployed code `5ec9203` on existing BYOK Pages project. Historical v0.2 rollback remains separately labelled in report 58; no new rollback is claimed.

## Actual Meta credential proof
Latest supplied token candidates were inspected privately and tested read-only: three Facebook identity successes; all three rejected by Threads with 190; four authorized Pages found, all Page-feed reads rejected with error 10; zero linked Professional IG assets returned. ORDVELA encrypted local and isolated production QA validation reproduced AUTH_ERROR / BLOCKED_PERMISSION, enabled false; QA credentials revoked and production QA workspace archived. Real Meta evidence/opportunities/scores: 0/0/0. No operator production provider credentials installed/enabled; production Meta checks were isolated QA only.

## Production and data boundary
Existing https://ordvela.pages.dev, dedicated D1, two migrations, managed encryption/invitation secrets, public signup disabled. HN historic evidence proves mechanics, not current buyer intent. QA contact/revenue are explicit simulations; no external send. Production smoke workspaces are archived and demos revoked. FIN qualification is a conservative hypothesis gate, not AI-confirmed demand, and leaves legacy HN/GitHub behavior and historical scores unchanged.

## Partial / blocked
Meta live discovery blocked by the observed token/permission/asset conditions. Groq production requires a rotated securely configured key; OpenAI generation remains unimplemented. Request-driven queue only. Full OAuth/refresh, automatic asset selection, clustering, manual rejected-signal promotion, unrestricted customer coding, account recovery/MFA, billing, broad connectors, load testing and automatic retraining remain deferred. No new D1 slot required.

## Identity and non-negotiables
ORDVELA only master brand; Ordvela Intelligence capability. LOCK THE FUNCTION. FLEX THE NAME.
External contact = NO. Posting/reply/DM = NO. Secret committed = NO (tracked files/dist scan PASS).


## Community & Demand Discovery expansion baseline

Community discovery is now a first-class Intelligence capability while providers remain replaceable. Current Meta adapters remain implemented but live access is blocked by observed authorization conditions. This is an access-state, not an architecture failure.

Next provider work is deliberately outside the Meta critical path:
**Reddit → YouTube → Discord → RSS/forums → additional official sources → X/paid sources by ROI → external aggregators by ROI.**

External aggregators may supply evidence only through normalized adapters and must preserve provenance, cost, freshness and licensing/terms metadata. No adapter may bypass platform restrictions.

## Meta status

**SOFT-HOLD / ACCESS-RECOVERY OPTIONAL.** Keep existing adapters; attempt controlled recovery when valid credentials and permissions are available; do not repeatedly guess or force access. Production activation requires real validation and real evidence.

## Apify implementation baseline — 0.4.0
Upstream `e7294cb` audited; PLANNED Apify manifest promoted to ADAPTER backed by managed runtime secret. Added src/apify.ts, src/acquisition.ts, public/static/acquisition.js and migration 0003; reused existing provider/OWNER/workspace/jobs/signals/scoring/outcomes. No source/root secret copied into D1 or browser. Eight logical registry slots; one isolated executable YouTube-comments input/output profile. Other candidates metadata-only; Actor discovery is not production readiness.

Bounds, reviewed schema/build/pricing hashes, explicit per-run spending authorization, atomic USD reservation gates, durable start-intent/UNKNOWN handling, async status/dataset retrieval, deterministic dedup and acquisition-to-signal receipts are implemented. Actor output validation/enabling needs actual bounded run output; no paid run authorized/performed by agent. Qualified acquisition evidence uses a separate transparent hypothesis gate, not a replacement score. Existing rules-v1.0 and Meta soft-hold preserved.

Local v0.4 proof: build/typecheck PASS; 51 tests PASS; API regression 312 assertions PASS; browser 48 checks PASS. D1 backup and additive remote migration successful; Apify secret configured through stdin without echo. Production v0.4.0 verified at ordvela.pages.dev: DB ready; 77 golden-path checks, 14 authenticated browser checks and 107 Apify-specific setup checks PASS. Eight Actor candidates configured disabled/unreviewed. YouTube selected build requires 1024 MB and is blocked by the fixed 256 MB resource gate; Reddit candidate BLOCKED_COMPLIANCE. No paid runs, no live Apify evidence/opportunities. Managed secret read-only validation succeeded; provider HEALTHY/ENABLED is not paid authorization. Exact Actor/version/pricing/blocker matrix in doc 61. GitHub push rejected authentication; local release commits preserved, authorization recovery needed. No external contact/post/reply/DM.
