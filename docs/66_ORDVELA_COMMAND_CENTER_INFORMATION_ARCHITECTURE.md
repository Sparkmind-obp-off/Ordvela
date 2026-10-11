# ORDVELA Command Center — Information Architecture and UX

**Status:** Target navigation and interaction model  
**Date:** 2026-10-11

## UX model

ORDVELA is one application with a persistent global shell. The dashboard and AI Workspace are separate work surfaces inside the same authenticated workspace. They share record identity and context rather than duplicating data.

## Global navigation

### Workspace
- **Overview** — health, priority signals, opportunities, active tasks/runs, recent outcomes.
- **AI Workspace** — conversations, model/provider selector, context references, draft artifacts.
- **Agents & Tasks** — proposed plans, approvals, active runs, run history, results.

### Intelligence
- **Discovery Intelligence** — source registry/coverage, topics, new signals, discovery runs.
- **Demand Intelligence** — evidence feed, classifications, demand validation, duplicates.
- **Opportunities** — opportunity pipeline, scoring, confidence, evidence, next actions.
- **Execution** — plans, tasks, status, owners, blockers.
- **Distribution** — approved channel activities and channel-specific outcomes.
- **Outcomes** — observed results, evaluation, learning notes.

### System
- **Providers & Integrations** — configured providers, connection/validation state, capabilities, usage.
- **Approvals & Audit** — pending approvals, decisions, execution/audit history.
- **Settings** — workspace, roles, quotas, preferences, feature flags where authorized.

This is the target IA, not a statement that every screen exists. Keep current production screens and routes stable while mapping them to this structure. Do not expose links to unimplemented routes.

## Overview dashboard hierarchy

1. **Operational status:** app/database health and enabled/blocked provider states.
2. **Priority queue:** items requiring human review, with reason and age.
3. **Intelligence snapshot:** new evidence, validated demand signals, opportunity pipeline.
4. **Execution snapshot:** proposed, approved, running, blocked, failed, and completed work.
5. **Outcome snapshot:** observed results and time range.
6. **Recent activity:** key events with actor, timestamp, and target record.
7. **Quick actions:** start analysis, inspect a signal, create a plan, review approvals. Quick actions must not bypass permissions or approval gates.

Every KPI should define its source query, time window, unit, inclusion/exclusion rules, and freshness. Unknown values should display as unknown/not configured rather than zero if zero has not been measured.

## AI Workspace layout

Recommended desktop layout:
- Left rail: conversations, search/filter, new conversation.
- Main panel: message thread, evidence/context citations, composer.
- Optional right panel: selected ORDVELA records, active plan, tool results, usage/status.
- Header: workspace context and provider/model selection based on server-enabled choices.

Mobile layout collapses side panels into accessible drawers. The message composer must disclose when a provider is unavailable and whether an answer is based on live model output, cached data, or a clearly labeled demo fixture.

### Context controls
- Show which records are attached or referenced.
- Allow removal of optional context before sending.
- Do not silently attach records from another workspace.
- Context retrieval should be auditable and bounded.
- Source text is untrusted data; it must not override system or tool policy.

### Answer presentation
When using business data, responses should separate:
- **Records/evidence:** source-backed facts and record links.
- **Analysis:** model interpretation.
- **Unknowns:** gaps or unsupported claims.
- **Next action:** draft suggestion, never implicit execution.

## Opportunity-to-work interaction

From an opportunity detail page, an operator can choose “Analyze in AI Workspace.” This opens a conversation with a reference to that opportunity and its permitted evidence IDs; it should not copy sensitive content into a URL or client-side state. AI may prepare a plan. The plan appears in Agents & Tasks for review.

From AI Workspace, “Create proposed task” or “Prepare agent plan” creates a draft object and navigates to its review view. It must not start execution immediately.

## Agent run detail

Show:
- Objective and plan version.
- Tool names and versions.
- Validated inputs or a redacted preview.
- Required permission and risk tier.
- Estimated and maximum cost/usage, if known.
- Approver, decision time, and approval expiry.
- Run status and step-level outcomes.
- Source/result references and sanitized errors.
- Cancel control only when supported.

## UI states

All screens must have deliberate states for loading, empty, stale, unavailable, access denied, validation errors, quota exhaustion, pending approval, execution, partial completion, cancellation, and failure. A disabled integration must not appear healthy simply because configuration metadata exists.

## Visual direction

Use a professional operator-console aesthetic: clear hierarchy, dense but readable data, consistent status labels, neutral defaults, and restrained emphasis for high-risk or blocked states. Avoid decorative metrics that do not map to real records. Responsive layout and keyboard-accessible controls are required.

## UX acceptance checks

- User can reach dashboard and AI Workspace without changing accounts or workspaces.
- Opportunity context transfers by authorized record reference.
- Every action clearly distinguishes “draft”, “approve”, and “execute”.
- Disabled providers and unimplemented screens are not presented as live.
- Mobile users can inspect evidence, review plans, and see execution status.
