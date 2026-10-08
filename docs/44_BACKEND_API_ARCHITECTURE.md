# ORDVELA — Backend & API Architecture
Status: CANONICAL / V0

## Boundary
Client → API → Core Services → Provider Adapters / Database / Jobs.

## API Domains
/auth
/workspaces
/sources
/signals
/opportunities
/executions
/distributions
/outcomes
/usage
/providers
/health

## Core Services
- Signal ingestion
- Normalization/deduplication
- Intelligence/scoring
- Opportunity management
- Execution orchestration
- Deployment
- Distribution preparation
- Outcome/feedback
- Usage/audit

## Rules
API validates all input, authorizes workspace access, emits request IDs, persists state transitions and never exposes provider secrets.

## Async
Long operations return an operation/job identifier and expose status. Do not hold HTTP requests open for generation or deployment work.