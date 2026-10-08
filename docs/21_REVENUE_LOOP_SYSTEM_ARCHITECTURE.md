# ORDVELA INTELLIGENCE — Revenue Loop System Architecture
Status: LOCKED FOR EXECUTION

SOURCES → INGESTION → NORMALIZATION → INTELLIGENCE → OPPORTUNITY ENGINE → SCORING → OPPORTUNITY STORE → EXECUTION → DEMO → DISTRIBUTION → HUMAN ACTION → OUTCOME → FEEDBACK

## Boundaries
Intelligence owns evidence, demand detection, intent and scoring.
Execution owns solution recommendation, blueprint, generation, validation and deployment.
Distribution owns target selection, message preparation, approval, contact handoff, follow-up and outcomes.

## Technical Architecture
Provider-independent core with adapters for sources, search, extraction, LLM, deployment and messaging.
Prefer Cloudflare Workers, D1, Pages/Workers and scheduled jobs where practical.
Secrets remain server-side.

## V0
Manual/human-approved outreach. No autonomous mass contact.