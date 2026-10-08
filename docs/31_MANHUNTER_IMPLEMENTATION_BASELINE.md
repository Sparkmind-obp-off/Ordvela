# Manhunter — Implementation Baseline

Status: READY FOR IMPLEMENTATION
Date: 2026-10-08

## Repository Position
Manhunter lives inside the existing Ordvela repository.

No new repository.
No new master brand.
No new domain is required for V0.

## Suggested Structure
Ordvela/
- docs/
- apps/dashboard/
- workers/api/
- packages/core/
- packages/intelligence/
- packages/execution/
- packages/distribution/
- packages/connectors/
- migrations/

Use existing repository conventions when they exist. Do not duplicate infrastructure.

## V0 Screens
1. Demand Feed — ranked real-demand opportunities.
2. Execution — selected opportunity → solution blueprint → build/deploy → demo.
3. Distribution / Final Message — demo + target + message + manual send + outcome.

## V0 Acceptance Criteria
- real public signal can be ingested
- evidence is normalized and stored
- evidence becomes an opportunity
- score is explainable
- original evidence is inspectable
- opportunity can enter execution
- execution can produce a demo
- demo has a shareable URL
- message draft can be generated
- human can approve and record outcome
- secrets stay server-side
- provider logic is adapterized
- workspace/usage hooks exist

## Naming
Internal working name: Manhunter.
Screen/module names are flexible.
Do not create additional brands until independent commercial evidence exists.
