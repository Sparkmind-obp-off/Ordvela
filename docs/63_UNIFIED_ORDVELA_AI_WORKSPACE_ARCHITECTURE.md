# ORDVELA Unified AI Platform — Architecture Decision

**Status:** Accepted direction; implementation not yet complete  
**Date:** 2026-10-11  
**Canonical product:** ORDVELA  
**Canonical repository:** https://github.com/Sparkmind-obp-off/Ordvela  
**Reference implementation:** https://github.com/Sparkmind-obp-off/AI-Workspace

## Decision

Evolve the existing ORDVELA product into a unified AI intelligence and agent platform. Do not create a second public ORDVELA product and do not replace the existing ORDVELA repository with AI-Workspace.

ORDVELA remains the canonical product, production deployment, data owner, and source of truth. AI-Workspace is a reference implementation for reusable assistant/agent capabilities only. Port or adapt selected code and concepts after inspecting dependencies, schemas, security assumptions, and compatibility. Do not blindly copy or merge repositories.

## Existing capabilities to preserve

ORDVELA already contains a demand-to-opportunity workflow, public evidence ingestion, scoring, execution/distribution/outcome tracking, owner/operator/viewer roles, workspace-scoped access, Cloudflare Pages/Workers and D1 persistence, provider registry patterns, usage controls, and approval gates. Existing production behavior and data must remain stable throughout incremental changes.

Current known production app: https://ordvela.pages.dev

## Target product architecture

1. **ORDVELA Intelligence** — demand feed, evidence, deduplication, opportunity scoring, execution, distribution, outcomes, and learning.
2. **AI Assistant Workspace** — conversational interface, persisted conversations, provider/model selection, workspace-aware context, and history.
3. **Agent Runtime** — objective intake, bounded planning, typed tool registry, execution state machine, explicit approvals, run logs, cancellation, and quotas.
4. **Provider Gateway** — server-side provider adapters for Groq and Gemini first; additional providers only through isolated adapters and explicit configuration.
5. **External Tools & Connectors** — Apify and future APIs such as file/document processing, search, or other approved providers. Every integration must be independently enabled, permissioned, metered, and tested.
6. **Shared platform services** — existing authentication and workspace authorization, D1 persistence, secret references, request validation, rate limits, audit records, and safe error handling.

## Product behavior

The assistant should be able to answer questions about existing ORDVELA records only through authorized, scoped data access. With explicit tool permissions, it may summarize evidence, explain an opportunity score, draft an execution plan, or propose updates. Mutating actions must require a preview and human approval; approval and execution must be separate actions. Every completed operation must record its actual result and provenance.

The agent must never invent demand evidence, claim that a provider is live when only mocked, or represent model synthesis as web search. Untrusted source content must be treated as data, not instructions. No arbitrary shell execution or unrestricted network access.

## Provider and credentials strategy

- Free-first; use one real provider for the first vertical slice.
- Groq and Gemini credentials are server-side secrets only.
- Apify remains optional and disabled until a specific Actor, input/output schema, pricing, limits, and authorization have been reviewed.
- Do not store raw API keys in D1, GitHub, frontend bundles, prompts, or logs.
- UI may store provider metadata/status, never reveal full secrets.
- Never launch paid jobs automatically. Explicit owner approval is required for billable actions.
- Additional file APIs and other integrations should be added only after requirements and provider terms are checked; do not invent a provider or claim a capability without implementation evidence.

## Repository and deployment rules

- Canonical repository stays `Sparkmind-obp-off/Ordvela`.
- Canonical production application remains the existing ORDVELA deployment until a reviewed release changes it.
- `Sparkmind-obp-off/AI-Workspace` is a reference repository, not a new canonical production app.
- Preserve existing routes, migrations, data, secrets, authentication, and production resources.
- Use additive migrations and backward-compatible feature flags where possible.
- Do not delete or reuse resources from other products.
- No GitHub Actions/CI or paid infrastructure without explicit approval.
- Continue Cloudflare deployment practices already used by ORDVELA.
- Do not redeploy production until local checks and a release checklist pass.

## Incremental implementation plan

### Phase 0 — Audit and compatibility
Inspect both repositories and current ORDVELA production state. Map existing auth, workspace model, routes, D1 schema/migrations, provider registry, quota model, and tool approvals. Identify which AI-Workspace components can be adapted safely. No production mutations during this phase.

### Phase 1 — Provider gateway and assistant vertical slice
Implement a dedicated server-side provider adapter within ORDVELA, initially using one configured provider. Add a responsive assistant UI, conversation persistence, workspace ownership checks, bounded context/output, timeout/error handling, quota reservation, and an explicit demo mode. Missing/invalid real keys must not silently fall back to demo.

### Phase 2 — ORDVELA-aware context
Allow authorized read-only retrieval of demand evidence, opportunities, execution records, and outcomes. Cite or link internal record IDs and distinguish source evidence from model-generated synthesis. Enforce workspace boundaries on every retrieval.

### Phase 3 — Bounded agent runtime
Add typed tools and an explicit task state machine. Start with safe read-only tools and deterministic transformations. Persist plans, exact inputs, approvals, outputs, duration, and sanitized errors. Each step requires owner approval before execution; approval alone must not execute it.

### Phase 4 — External connectors
Integrate Apify or other file/search/API providers only after reviewing authentication, allowed endpoints, schema, data retention, cost model, and permissions. Use an allowlist, input validation, quotas, timeouts, output limits, and disabled-by-default configuration. No paid validation runs without explicit authorization.

### Phase 5 — Controlled write actions
Allow agents to propose changes to opportunities or execution records, show a diff/preview, require approval, validate current record ownership and state, execute idempotently, and log before/after results. Never automate posting, messaging, or external side effects without a separate explicit approval path.

### Phase 6 — Release verification
Run existing tests plus provider, workspace isolation, prompt-injection, approval enforcement, quota, migration, and browser tests. Deploy to a preview first when supported. Perform authenticated production acceptance only after owner approval and confirm actual results before claiming release success.

## Acceptance criteria

- Existing ORDVELA workflows continue to work.
- A logged-in user can chat with a real configured provider and retrieve persisted conversation history.
- Provider credentials never reach the browser or logs.
- Assistant access to business data is scoped to the authenticated workspace.
- The assistant distinguishes verified records, external evidence, and generated synthesis.
- Agent plans and tool executions are persisted and inspectable.
- No tool executes before explicit approval; approval alone is not execution.
- External paid actions are disabled by default and bounded by explicit policy.
- Tests and deployment claims are backed by observed command or live results.
- No unrelated production resources are changed.

## Reporting requirements

For every implementation session, report: files changed, tests actually executed and results, live integrations actually verified, credentials needed by variable name only, migration/deployment status, blockers, and next action. Do not claim production readiness while critical security or deployment checks remain incomplete.
