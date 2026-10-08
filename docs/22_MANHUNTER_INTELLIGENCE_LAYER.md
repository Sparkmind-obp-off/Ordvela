# Manhunter — Layer 01: Intelligence

Status: V0 SPEC
Date: 2026-10-08

## Objective
Find real demand with enough evidence to justify action.

## Initial Source Adapters
Web search, Reddit, jobs/freelance demand, Threads, X, Instagram and Facebook.

The architecture supports additional sources without changing the core.

## Pipeline
COLLECT → DEDUPLICATE → NORMALIZE → EXTRACT DEMAND → VERIFY EVIDENCE → CLASSIFY INTENT → ESTIMATE COMMERCIAL SIGNAL → SCORE → RANK

## Signal Record
Preserve source, stable URL/reference, author/account when available, timestamp, original text/snippet, captured evidence, detected problem, requested outcome, urgency, intent, budget signal, geography, context and confidence.

## Real Demand Test
Strong signals contain one or more of: explicit need, active request for a solution, specific problem, time pressure, budget evidence, consequence of not solving, or willingness to evaluate providers/tools.

## Output
Create an Opportunity candidate, not a generic lead.

Minimum output: problem, desired outcome, evidence, intent, urgency, budget signal, fit, opportunity score, confidence and recommended action.

## V0 UI
Optimize for decision speed: score, problem, evidence, source, budget signal, recommended action, original-source link and create-execution action.
