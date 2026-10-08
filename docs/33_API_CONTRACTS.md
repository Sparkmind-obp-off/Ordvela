# ORDVELA INTELLIGENCE — API Contracts
Status: V0 CANONICAL

## API boundary
The API is the server-side control boundary between the dashboard, core services and external providers.

## Resource groups
- /signals
- /opportunities
- /executions
- /distributions
- /usage
- /health

## Common response model
Success:
{ data, request_id }
Failure:
{ error: { code, message, retryable }, request_id }

## State transitions
Opportunity:
NEW → REVIEWED → SELECTED → EXECUTION_READY → CONTACT_READY → WON/LOST

Execution:
PENDING → RUNNING → SUCCEEDED / FAILED / RETRYABLE / CANCELLED

Distribution:
DRAFT → APPROVAL_REQUIRED → APPROVED → CONTACTED → FOLLOW_UP → REPLIED → QUALIFIED → PROPOSAL → WON/LOST

## Rules
- Authenticate every protected workspace operation.
- Authorize by workspace ownership/membership.
- Validate provider responses before persistence.
- Never return secrets.
- Generate request IDs for traceability.
