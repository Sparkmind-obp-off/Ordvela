# ORDVELA Command Center — Product Vision

**Status:** Proposed product specification aligned to the accepted architecture decision  
**Date:** 2026-10-11  
**Canonical product/repository:** ORDVELA / `Sparkmind-obp-off/Ordvela`  
**Reference implementation:** `Sparkmind-obp-off/AI-Workspace`

## Executive decision

ORDVELA evolves into a **unified AI Intelligence & Agent Command Center**. It combines the existing intelligence dashboard with an AI Workspace and a controlled execution layer inside one product. It is not two apps glued together, and it is not a chatbot replacing the dashboard.

The dashboard gives the operator situational awareness: what is happening, what evidence exists, which opportunities matter, what is running, and what outcomes have been observed. The AI Workspace lets the operator investigate, reason over authorized ORDVELA records, create plans, and request work. The agent runtime executes only bounded, authorized, auditable actions.

## Product promise

**See the signal. Understand the opportunity. Decide what to do. Execute with control. Learn from the outcome.**

ORDVELA should reduce the gap between market intelligence and actual work without pretending that model output is verified evidence or allowing agents to act without oversight.

## The three connected surfaces

### 1. Intelligence Dashboard — observe and decide
- Overview of source health, recent evidence, demand signals, opportunity pipeline, execution status, distribution status, and outcomes.
- Discovery Intelligence: source and topic exploration, newly detected signals, coverage gaps.
- Demand Intelligence: evidence review, deduplication, classification, and demand validation.
- Opportunity Intelligence: scoring, prioritization, confidence, and next-step recommendations.
- Execution Intelligence: tasks, plans, owners, statuses, and blockers.
- Distribution Intelligence: approved channel activity and distribution outcomes.
- Outcome Intelligence: observed results, feedback, and learning.

These names describe target product capabilities. Existing production modules and data remain the source of truth; a named capability must not be presented as implemented until verified.

### 2. AI Workspace — investigate and prepare
- Persistent conversations and history.
- Provider/model selection limited to configured and available providers.
- Context from the current workspace and authorized ORDVELA records.
- Evidence-aware analysis, summaries, comparisons, draft plans, and documents.
- Explicit visibility into what is verified, what is inferred, and what remains unknown.
- Ability to turn an answer into a proposed task or agent run without automatically executing it.

### 3. Agent Command — execute with control
- Task/goal intake and bounded plans.
- Typed tools from a registry; no arbitrary shell or unrestricted network execution.
- Preflight validation, cost/usage estimation where applicable, approval, execution, cancellation, and results.
- Run history, provenance, sanitized errors, and audit records.
- Approval and execution are separate events. Approving a plan does not itself execute it.

## Shared operating model

All surfaces share ORDVELA identity, workspace authorization, existing D1 data, provider registry, quota and usage controls, secret handling, and audit conventions. They must not maintain duplicate business records or competing user/workspace models.

## Primary user journey

1. A source or operator action creates a signal/evidence record.
2. ORDVELA normalizes and deduplicates it, preserving provenance.
3. Demand and opportunity logic evaluates it under documented rules.
4. The operator opens the opportunity in the dashboard or asks AI to analyze that specific record.
5. AI retrieves only authorized records and returns a sourced analysis with uncertainty stated.
6. The operator asks for a plan; the agent runtime creates a bounded proposal.
7. The operator reviews exact actions, inputs, permissions, and expected cost.
8. The operator approves the specific run or step.
9. The runtime executes within policy and records actual results.
10. Outcomes feed the dashboard and can inform future prioritization.

## Product principles

1. **One product, one source of truth.** ORDVELA remains canonical; AI-Workspace is a reference, not a second product.
2. **Evidence before confidence.** Every market claim should be traceable to a source or labeled as a hypothesis.
3. **Observe, propose, approve, execute.** No hidden side effects.
4. **Free-first and cost-aware.** Do not incur paid provider/Actor usage without explicit policy and approval.
5. **Secure by default.** Secrets are server-side; access is workspace-scoped.
6. **Incremental compatibility.** Preserve current production routes, data, migrations, and workflows.
7. **Truthful status.** Mocked, discovered, configured, validated, enabled, and live are distinct states.
8. **Human control.** Users can inspect plans, reject actions, and cancel supported runs.
9. **No invented capability.** Roadmap items and design mockups are not implementation evidence.
10. **Measure outcomes.** Record results, not just generated content or activity counts.

## Non-goals for the initial integration

- Replacing ORDVELA with AI-Workspace wholesale.
- Creating a second public ORDVELA deployment or separate business-data store.
- Unrestricted autonomous browsing, shell execution, or arbitrary code execution.
- Automatically publishing, messaging, purchasing, or starting billable runs.
- Claiming all listed intelligence areas or connectors are already live.
- Adding paid infrastructure or GitHub Actions/CI without explicit approval.

## Success measures

- Existing production workflows remain healthy after changes.
- A user can chat with a real configured provider and recover persisted history.
- AI answers that use ORDVELA data identify relevant internal records and distinguish evidence from synthesis.
- Workspace isolation, secrets safety, quota enforcement, and approval enforcement pass tests.
- Approved agent runs have inspectable inputs, outputs, status, and audit history.
- The operator can move from a signal to a reviewed action without manually copying context between screens.
- Outcomes are captured with provenance and are not inflated by duplicate or synthetic records.

## Source-of-truth documents

- [Unified AI Platform Architecture](63_UNIFIED_ORDVELA_AI_WORKSPACE_ARCHITECTURE.md)
- [Product Requirements](65_ORDVELA_COMMAND_CENTER_PRD.md)
- [Information Architecture and UX](66_ORDVELA_COMMAND_CENTER_INFORMATION_ARCHITECTURE.md)
- [Agent Runtime and Execution Contract](67_ORDVELA_AGENT_RUNTIME_EXECUTION_CONTRACT.md)
- [Security and Data Governance](68_ORDVELA_SECURITY_DATA_GOVERNANCE.md)
- [Provider and Connector Policy](69_ORDVELA_PROVIDER_CONNECTOR_POLICY.md)
- [Implementation Roadmap and Release Gates](70_ORDVELA_IMPLEMENTATION_ROADMAP_RELEASE_GATES.md)
- [Acceptance Test Matrix](71_ORDVELA_ACCEPTANCE_TEST_MATRIX.md)
