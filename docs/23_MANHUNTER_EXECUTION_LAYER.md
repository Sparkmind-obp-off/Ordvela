# Manhunter — Layer 02: Execution

Status: V0 SPEC
Date: 2026-10-08

## Objective
Turn a qualified opportunity into something concrete that can be shown to the prospect.

## Pipeline
OPPORTUNITY → SOLUTION RECOMMENDATION → SOLUTION BLUEPRINT → BUILD/GENERATE → VALIDATE → DEPLOY → DEMO

## Solution Blueprint
Minimum fields: opportunity ID, problem, target outcome, proposed solution, required features, constraints, assumptions, stack, deployment target and demo acceptance criteria.

## BYOK
V0 should support user-provided provider credentials where technically and legally appropriate.

Requirements:
- secure server-side secret handling
- no raw key logging
- provider selection abstracted
- workspace usage attributable
- explicit failure and retry states

## Hosted Mode
Later Ordvela may provide managed provider access. Execution must support BYOK or ORDVELA-HOSTED PROVIDER without changing the workflow.

## Prototype Standard
A demo does not need to be production-complete. It must be relevant, functional enough to demonstrate the outcome, visually credible, deployable, shareable and fast to create.

Prefer templates and constrained generation over unrestricted autonomous coding.
