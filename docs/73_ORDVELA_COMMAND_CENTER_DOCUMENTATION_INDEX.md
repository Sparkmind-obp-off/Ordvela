# ORDVELA Command Center — Documentation Index

**Date:** 2026-10-11  
**Status:** Product and architecture documentation baseline  
**Canonical repo:** `Sparkmind-obp-off/Ordvela`  
**Branch:** `docs/ordvela-command-center-blueprint`

## Start here

1. [Product Vision](64_ORDVELA_COMMAND_CENTER_PRODUCT_VISION.md) — what ORDVELA is becoming and the shared operating model.
2. [Product Requirements](65_ORDVELA_COMMAND_CENTER_PRD.md) — functional and non-functional requirements.
3. [Information Architecture and UX](66_ORDVELA_COMMAND_CENTER_INFORMATION_ARCHITECTURE.md) — global navigation and screen behavior.
4. [Unified AI Platform Architecture](63_UNIFIED_ORDVELA_AI_WORKSPACE_ARCHITECTURE.md) — core architecture decision and phased integration.

## Build and execution contracts

5. [Agent Runtime and Execution Contract](67_ORDVELA_AGENT_RUNTIME_EXECUTION_CONTRACT.md) — planning, typed tools, approval, execution, audit, and state machine.
6. [Security and Data Governance](68_ORDVELA_SECURITY_DATA_GOVERNANCE.md) — workspace isolation, secrets, conversation data, migrations, and logging.
7. [Provider and Connector Policy](69_ORDVELA_PROVIDER_CONNECTOR_POLICY.md) — provider lifecycle, live-validation evidence, credentials, and cost controls.

## Delivery and verification

8. [Implementation Roadmap and Release Gates](70_ORDVELA_IMPLEMENTATION_ROADMAP_RELEASE_GATES.md) — ordered phases and release authorization.
9. [Acceptance Test Matrix](71_ORDVELA_ACCEPTANCE_TEST_MATRIX.md) — required scenarios; only executed tests may be reported as passing.
10. [Decision Log](72_ORDVELA_COMMAND_CENTER_DECISION_LOG.md) — durable product and architecture decisions.

## Product model in one sentence

ORDVELA is one AI Intelligence & Agent Command Center: the dashboard observes and prioritizes, AI Workspace investigates and prepares, and Agent Runtime executes approved bounded actions and records outcomes.

## Important status note

These documents establish the agreed target and implementation contracts. They do not mean the assistant, all agent tools, all listed screens, or all connectors are implemented or production-enabled. Implementation must begin with an audit of the existing ORDVELA code and production resources, preserve existing workflows, and pass the stated gates before deployment.

## Repository and production boundaries

- Canonical product/repository: `Sparkmind-obp-off/Ordvela`.
- AI-Workspace remains a reference implementation, not a replacement.
- Existing ORDVELA Cloudflare and D1 resources are preserved unless a reviewed, approved change is necessary.
- No GitHub Actions/CI or paid infrastructure without explicit approval.
- No production deployment or resource mutation merely because documentation is complete.
- Do not touch Commerce, Bozq, or unrelated product resources.
