# Ordvela Intelligence — System Architecture

Status: LOCKED FOR EXECUTION
Date: 2026-10-08

## Flow
SOURCES → INGESTION/ADAPTERS → NORMALIZATION → DEMAND INTELLIGENCE → OPPORTUNITY ENGINE → SCORING → OPPORTUNITY DB → EXECUTION ENGINE → PROTOTYPE/DEPLOYMENT → DEMO → DISTRIBUTION → HUMAN ACTION → OUTCOME/DEAL

## Layer Boundaries
Intelligence owns discovery, evidence, intent, opportunity extraction and scoring.
Execution owns solution recommendation, blueprint generation, prototype generation, validation and deployment.
Distribution owns target selection, message drafting, human review, sending handoff and follow-up/outcome capture.

## Provider Independence
External providers sit behind adapters: search, Reddit, Threads, X, Instagram, Facebook, jobs/freelance, LLM and deployment.

No provider-specific logic should leak into core business logic.

## Infrastructure Baseline
Prefer Cloudflare where practical: Workers, D1 where appropriate, Pages/Workers for UI and demos, Cron for scheduled collection, server-side secrets.

Keep the architecture portable.

## V0 Constraint
No autonomous outreach. Distribution creates a ready-to-review message and demo. Human approval is required before external contact.

## Commercial Boundary
Support workspace/user ownership, provider configuration, usage accounting hooks, feature flags, source enable/disable, BYOK and future hosted-provider mode.
