# ORDVELA INTELLIGENCE — Execution Template Specification
Status: V0 CANONICAL

## Principle
Constrained templates beat unrestricted autonomous coding for the first production loop.

## Blueprint fields
- opportunity_id
- problem
- target_outcome
- solution
- features
- constraints
- assumptions
- stack
- deployment_target
- acceptance_criteria

## Template requirements
A template must define:
- input contract
- generated artifacts
- validation checks
- deployment method
- known failure modes
- rollback/cleanup path

## Demo standard
The demo must visibly answer the observed problem. It should be small, credible, functional and easy to share.

## Safety
Generated artifacts must not receive production secrets by default. Deployment credentials stay server-side.
