# ORDVELA Agent Runtime — Execution Contract

**Status:** Required design contract before implementation  
**Date:** 2026-10-11

## Purpose

Define a safe, inspectable runtime for converting a user-approved goal into bounded tool calls. This contract complements the unified platform architecture; it does not claim that the complete runtime currently exists.

## Core rule

**Plan → Validate → Preview → Approve → Execute → Verify → Record.**

No model output can directly invoke a tool. Model-generated tool arguments are untrusted until parsed, schema-validated, permission-checked, policy-checked, and bound to a specific approved plan version.

## Runtime components

- **Planner:** produces a proposed sequence of typed steps; no side effects.
- **Tool registry:** server-owned, versioned definitions with schemas and policy metadata.
- **Policy evaluator:** checks role, workspace, feature flags, risk, quotas, allowlists, and cost ceilings.
- **Approval service:** records an explicit decision for an immutable plan hash/version.
- **Executor:** invokes only the approved tool/version/arguments.
- **Result verifier:** checks tool response shape and records actual result state.
- **Audit writer:** persists lifecycle events and sanitized metadata.

## Tool contract

Every registered tool must declare:
- stable tool ID and version;
- purpose and owner;
- strict input and output schema;
- read/write/external-side-effect classification;
- required role and scope;
- risk tier;
- timeout, output-size and item-count bounds;
- quota reservation and cost model;
- idempotency behavior;
- cancellation support;
- data retention/logging policy;
- failure codes and retry policy.

Tools absent from the registry are not callable. No arbitrary shell, arbitrary code, unrestricted URL fetch, or model-selected host access.

## Risk tiers

- **T0 — Read-only local:** scoped reads of authorized ORDVELA records; no external side effects.
- **T1 — Bounded transformation:** deterministic parsing, summarization, or document transformation within size/time limits.
- **T2 — External read:** approved API/provider call; network host and endpoint allowlisted, quota reserved, retention reviewed.
- **T3 — Internal mutation:** changes to ORDVELA records; requires explicit preview and OWNER approval for initial releases.
- **T4 — External side effect or billable action:** posting, messaging, purchase, paid Actor/API execution, or other external mutation. Disabled by default; requires a separate policy and explicit owner authorization for each supported action.

Risk tier is assigned by the tool definition and policy, never by the model.

## State machine

Suggested persisted states:
- DRAFT
- VALIDATING
- REJECTED
- AWAITING_APPROVAL
- APPROVED
- RUNNING
- SUCCEEDED
- PARTIAL
- FAILED
- CANCEL_REQUESTED
- CANCELLED
- EXPIRED

Allowed transitions must be enforced on the server. A client must not set status directly. APPROVED does not mean RUNNING. A change to plan content, tool version, input arguments, target records, workspace scope, risk tier, or maximum cost invalidates approval and requires re-review.

## Approval record

Approval binds to:
- workspace ID;
- plan/run ID and immutable plan hash/version;
- exact tool IDs/versions and validated argument hash;
- target record IDs;
- permission/risk summary;
- maximum cost/usage and quota policy;
- approving user and timestamp;
- expiry time and decision.

Approval must be denied if the user lacks permission, the plan is stale, policy changed, quota cannot be reserved, or a target record no longer belongs to the authorized workspace.

## Execution guarantees

- Check authorization again at execution time.
- Reserve quota before calling providers/tools.
- Use idempotency keys for operations that can be retried safely.
- Never retry non-idempotent side effects automatically.
- Bound concurrency, duration, response bytes, items, and total steps.
- Sanitize outputs before persistence and rendering.
- Record actual usage/cost only when supplied by reliable provider/tool metadata; otherwise mark unknown.
- Distinguish tool success from business outcome success.
- Cancellation is best-effort unless the underlying provider confirms it.
- Partial completion must list completed and uncompleted steps explicitly.

## Prompt-injection boundary

Retrieved web pages, social posts, uploaded documents, tool results, and user-provided content are untrusted data. They cannot grant permissions, change tool policies, request secret disclosure, or override system rules. Tool inputs are derived from explicit user intent and validated records, not instructions embedded in source content.

## Initial permitted tools

Begin with a small allowlist, for example:
1. Read a bounded set of authorized evidence records.
2. Read an authorized opportunity and its linked evidence.
3. Summarize or compare records already retrieved.
4. Draft an execution plan without writing business records.

Any write tool is added only after approval UX, idempotency, migration, and audit tests exist. These are candidates, not claims of current implementation.

## Error model

Expose stable user-safe codes such as INVALID_INPUT, PERMISSION_DENIED, APPROVAL_REQUIRED, APPROVAL_STALE, QUOTA_EXCEEDED, PROVIDER_UNAVAILABLE, TIMEOUT, OUTPUT_LIMIT, CANCEL_UNCONFIRMED, and TOOL_FAILED. Keep stack traces, credentials, and sensitive provider payloads out of user-facing errors and ordinary logs.

## Required tests

- Unknown tool and malformed arguments rejected.
- Cross-workspace IDs rejected.
- VIEWER cannot approve or execute restricted tools.
- Approval does not trigger execution.
- Changing an approved plan invalidates approval.
- Quota exhaustion prevents provider/tool invocation.
- Secrets never appear in logs or serialized output.
- Prompt injection in retrieved content cannot change tool permissions.
- Duplicate submissions do not duplicate non-idempotent effects.
- Failed/cancelled/partial runs preserve accurate audit history.
