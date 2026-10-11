# ORDVELA Command Center — Implementation Roadmap and Release Gates

**Status:** Ordered implementation plan; no release implied  
**Date:** 2026-10-11

## Delivery rule

Upgrade the existing ORDVELA repository and production application. AI-Workspace remains a reference repository. No replacement deployment, database, or public product is created as part of this plan.

Work should proceed in small vertical slices. Every phase must produce code, tests, and evidence; documentation completion alone is not implementation completion.

## Phase 0 — Baseline audit
- Map current app routes, UI shell, auth/session behavior, roles, workspace scope, D1 schema/migrations, provider registry, quotas, audit records, deployment bindings, and tests.
- Inspect AI-Workspace only to identify components worth adapting.
- Record reusable, incompatible, and missing pieces.
- Establish a production baseline and a no-regression test set.
- No production mutations.

**Gate:** audit report identifies exact existing components and migration constraints.

## Phase 1 — Shared provider gateway + chat
- Define provider-neutral request/response/error contract.
- Implement one real server-side model adapter after credential and plan review.
- Add conversation/message persistence using the existing D1 model with additive migrations.
- Add chat UI within the existing ORDVELA shell.
- Enforce role/workspace scope, bounded context, quotas, safe errors, and explicit unavailable states.

**Gate:** real provider response and persistence proven end-to-end; no silent mock fallback; secret-safety tests pass.

## Phase 2 — Intelligence context
- Add typed read-only retrieval for selected evidence, demand signals, opportunities, execution records, and outcomes that already exist.
- Show internal record references and separate evidence from synthesis.
- Add “Analyze in AI Workspace” from a supported record detail page.

**Gate:** cross-workspace access tests pass; answer references map to real records; existing scoring and dedup behavior unchanged.

## Phase 3 — Agent proposal and approval
- Persist plan drafts and versions.
- Add typed tool registry and strict schemas.
- Add preview and approval UI.
- Start with safe read-only tools and deterministic transformations.
- Keep approval and execution as separate transitions.

**Gate:** unauthorized, stale, modified, and unapproved plans cannot execute.

## Phase 4 — Bounded execution
- Implement executor, state machine, quotas, idempotency, cancellation semantics where supported, and audit trail.
- Add step-level results and safe retry rules.
- Keep writes and external side effects disabled unless individually reviewed.

**Gate:** state transitions, quotas, duplicate submissions, cancellation, failure, and partial-result tests pass.

## Phase 5 — Connector expansion
- Review and enable additional providers one by one (Gemini, Apify, RapidAPI, or other approved integrations as applicable).
- Require live validation and evidence per provider.
- Do not expand the connector count before the first adapter and shared contract are stable.

**Gate:** each provider independently meets the provider onboarding checklist.

## Phase 6 — Controlled mutations
- Add narrowly scoped internal record-write tools.
- Require exact diff preview, approval bound to plan version, revalidation at execution, idempotency, and before/after audit.
- External posting/messaging/purchases remain separately gated and disabled by default.

**Gate:** write-path abuse, stale approval, and duplicate execution tests pass.

## Phase 7 — Outcome feedback and operational hardening
- Link execution results to outcome records where appropriate.
- Report observed outcome and unknowns distinctly.
- Add operator diagnostics, failure handling, retention controls, and performance review.

**Gate:** outcome metrics have defined source/query/time-window and cannot count synthetic/test data as real outcomes.

## Phase 8 — Release
- Run unit/integration/browser tests and existing production golden paths.
- Review schema migration and backup/rollback.
- Verify secrets and bindings by status only; do not print secret values.
- Deploy to preview first where supported; production release requires explicit owner authorization.
- Perform authenticated smoke tests and capture exact deployment URL, commit SHA, migration status, and test counts.

**Gate:** release checklist passes and actual results are reported. Never infer deployment success from a successful Git commit.

## Deployment constraints

- Keep existing Cloudflare Pages/Workers and D1 resources unless a reviewed need requires a change.
- No unrelated project/resource modifications.
- No GitHub Actions/CI or paid infrastructure without explicit approval.
- Never deploy a feature whose migrations or required secrets are missing.
- Do not touch Commerce, Bozq, or other product resources.

## Per-phase report format

1. Goal and scope.
2. Files/routes/migrations changed.
3. Tests actually run and results.
4. Provider status and whether real live calls occurred.
5. Security, quota, and approval behavior verified.
6. Deployment status (not deployed / preview / production) with evidence.
7. Known blockers and exact next action.
