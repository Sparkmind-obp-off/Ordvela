# ORDVELA INTELLIGENCE — Implementation Baseline
Status: V0 IMPLEMENTED / V1 PRODUCTION VERIFIED / V2 SELECTED PROVIDERS
Date: 2026-10-08
Current verification: `58_PROVIDER_PRODUCTION_VERIFICATION.md`

## Repository audit
Initial baseline `19c4341` was documentation only. Runtime `09702d8` delivered V0. Subsequent remote documents through `7f2c85f` were audited and preserved before provider-layer implementation. Working V0 auth, domain, scoring, prototypes, approval and outcomes were extended, not replaced.

## Current structure
- `src/index.ts`: Hono Pages worker, health, secure headers and isolated public artifact route.
- `src/auth.ts`: PBKDF2 auth, hashed sessions, workspace membership, production invitation gate.
- `src/api.ts`: workspace-scoped revenue-loop API, provider lifecycle/generator, consented assessments, password/session revocation and soft workspace archive.
- `src/core.ts`: explainable deterministic intelligence, versioned scoring, bounded templates, artifact validation and commercial transitions.
- `src/adapters.ts`: HN/GitHub, normalized evidence, documented Threads keyword API, Groq grounded assessment, OpenAI models validation, safe provider errors and AES-GCM credential boundary.
- `src/providers.ts`: central capability/credential/health registry and non-executing scaffold generator.
- `src/jobs.ts`: durable idempotent jobs, claims, retries, timeout/lease recovery and lifecycle observations.
- `public/static/`: six-screen responsive cockpit, evidence/AI review, provider checklist, health/lifecycle controls and generator inspection.
- Two D1 migrations: core domain plus provider lifecycle/scaffolds/assessments/token usage.
- Tests: unit/contracts/D1, extended API golden path, browser/generator/mobile states, isolated production golden path and authenticated read-only production browser.

## Verified
Build/typecheck PASS; 27 unit/contract/database tests PASS; recorded API run 245 assertions PASS; browser 30 checks PASS; production smoke 77 checks PASS; production operator browser 14 checks PASS. Audit 0 vulnerabilities. Real Groq model validation and grounded assessment PASS. Production rollback and restoration PASS, no schema downgrade or commercial-history deletion.

Historical real HN source is used for deterministic golden-path proof; actual buying availability is UNKNOWN. QA contact/reply/revenue are explicitly simulations. The production QA workspace was archived and its demo revoked. Five genuine public HN candidates were ingested into the operator workspace, none selected/contacted, no real revenue recorded.

## Production state
https://ordvela.pages.dev — dedicated `ordvela-production` D1, both migrations applied, fresh managed encryption/invitation secrets, public signup disabled. Original D1-quota blocker was resolved after the owner supplied a slot. No unrelated database was deleted or reused. A private onboarding access file is kept outside git; operator changes the temporary password in Settings.

## Partial / blocked
Groq production enablement requires a newly rotated key; exposed supplied credential was tested but not installed. Threads adapter is contract-tested but missing an authorized USER access token/permission proof. OpenAI live validation not proven. Jobs are request-driven; prototypes are bounded; full OAuth/refresh, account recovery/MFA, broader connectors, billing, monitoring/load testing and automatic retraining remain incomplete/deferred.

## Identity
ORDVELA only master brand; Ordvela Intelligence capability. Existing repository preserved. No extra custom domain, brand, parallel application architecture or customer repository created.
