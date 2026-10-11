# ORDVELA Command Center — Product Requirements

**Status:** Target requirements; not a claim of current implementation  
**Date:** 2026-10-11

## 1. Product scope

ORDVELA is one command center with three connected capabilities:
- Intelligence Dashboard: observe evidence, demand, opportunities, execution, distribution, and outcomes.
- AI Workspace: ask questions, analyze authorized data, create drafts, and prepare plans.
- Agent Command: run approved, bounded tools and inspect results.

The existing ORDVELA production application and schema remain canonical. Requirements are implemented incrementally after an audit of existing routes, tables, permissions, and provider adapters.

## 2. Roles and permissions

Reuse the existing role model and workspace authorization. Do not create a parallel identity system.

- **OWNER:** manage workspace settings, providers, quotas/policies where supported, approvals, and sensitive mutations.
- **OPERATOR:** use permitted intelligence workflows, chat, and allowed tools within workspace policy.
- **VIEWER:** read only authorized records and permitted run results; cannot execute mutations or approve actions.

Every endpoint must enforce role and workspace scope server-side. Hiding a button is not authorization.

## 3. Functional requirements

### FR-01 — Unified navigation
Provide clear entry points to Overview, AI Workspace, Agents & Tasks, Discovery, Demand, Opportunities, Execution, Distribution, Outcomes, Providers/Integrations, and Settings. Navigation must reflect actual enabled capabilities; disabled modules should be labeled accordingly or omitted.

### FR-02 — Overview dashboard
Summarize existing trustworthy records and operational health. Show timestamps, scope, freshness, and source status where meaningful. Do not manufacture metrics when data is missing.

### FR-03 — Intelligence record detail
A signal, evidence item, or opportunity detail view should show its canonical ID, source/provenance, observation time, processing status, relevant score/rules, related records, and known uncertainty. Preserve deduplication identity.

### FR-04 — Persistent assistant conversations
Authenticated users can create, list, open, and delete/archive conversations according to policy. Messages persist with timestamps and role/type metadata. Access is limited to the owning workspace and authorized user scope. Do not store secrets in conversation content intentionally; redact detected credential patterns before logs.

### FR-05 — Provider/model choice
Only providers configured on the server and enabled for the workspace are selectable. The server owns provider routing and model allowlists. Missing credentials must produce an explicit unavailable state, not a silent switch to a mock response.

### FR-06 — Context-aware answers
Assistant context may include authorized ORDVELA records only through typed server-side retrieval tools. Include record references in the response where applicable. Separate:
- observed source content,
- existing structured ORDVELA records,
- model-generated interpretation,
- assumptions and unknowns.

### FR-07 — Proposed plans
A user may ask the assistant to create a plan. Plans must be persisted as proposals with bounded steps, expected tool names, validated arguments, risk tier, and estimated usage/cost when available. A plan is not executable until validated and approved.

### FR-08 — Typed tool registry
Each tool defines stable ID/version, description, input schema, permission, risk tier, timeout, output limit, quota/cost policy, and side-effect classification. The runtime must reject unknown tools and invalid arguments.

### FR-09 — Approval workflow
Approval is tied to a specific immutable plan/version, actor, workspace, and expiry policy. Any material change to tool, arguments, target, scope, or cost invalidates the prior approval. Approval never directly invokes the tool.

### FR-10 — Execution lifecycle
Runs have explicit states such as DRAFT, VALIDATING, AWAITING_APPROVAL, APPROVED, RUNNING, SUCCEEDED, FAILED, CANCEL_REQUESTED, CANCELLED, and EXPIRED. State transitions are server-enforced and persisted. Terminal outcomes must include sanitized result metadata.

### FR-11 — Quotas and cost controls
Reserve quota before provider/tool invocation, settle actual usage after the call, and release reservations on confirmed failure/cancellation where safe. Paid actions are disabled by default and cannot exceed the approved maximum. No retries may create unbounded duplicate cost.

### FR-12 — Audit and provenance
Record who requested, reviewed, approved, and executed an operation; which plan/tool version ran; the bounded input reference; timestamps; outcome; and sanitized error details. Never log raw credentials or full sensitive payloads.

### FR-13 — Cancellation and failure
Expose cancellation only where the underlying operation can support it. Distinguish cancellation requested from cancellation confirmed. Failure messages should be actionable but must not reveal secrets or internal stack traces to ordinary users.

### FR-14 — Feature flags and degraded mode
New assistant and agent capabilities can be disabled without breaking current intelligence workflows. Provider outages must not corrupt saved conversations, opportunity records, or execution history.

### FR-15 — Accessible responsive UI
Core workflows must be usable on desktop and mobile. Include loading, empty, unavailable, permission-denied, quota-exhausted, approval-pending, and error states.

## 4. Non-functional requirements

- Server-side authorization on every sensitive operation.
- Input validation at all external boundaries.
- Workspace isolation in database queries and tool execution.
- Bounded time, output size, and provider/tool usage.
- Safe structured logging and credential redaction.
- Additive, backward-compatible database migrations wherever practical.
- Idempotency for retryable mutations and execution submission.
- Observable status without exposing secret values.
- Existing tests and production flows remain green.
- Claims of real-provider readiness require observed live validation, not mocks alone.

## 5. Initial release slice

The first meaningful release should include:
1. Existing ORDVELA auth/workspace integration.
2. One real server-side AI provider adapter (free-first, chosen after credential and terms review).
3. Persistent chat history in ORDVELA's existing D1.
4. Read-only access to selected evidence/opportunity records.
5. Clear source references and uncertainty labels.
6. One or two safe typed tools.
7. Plan preview and approval separated from execution.
8. Usage limits, safe logs, tests, and a feature flag.

Do not include broad autonomous execution or all integrations in the first slice.

## 6. Out of scope until separately approved

- Automatic public posting or messaging.
- Unrestricted network access or shell execution.
- Automatic paid API/Actor runs.
- New production databases or paid services without approval.
- Cross-workspace data access.
- Destructive data migrations or resource deletion.
