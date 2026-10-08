# ORDVELA INTELLIGENCE — API Contracts
Status: V0 CANONICAL

## Boundary
Server-side control boundary between dashboard, core services and external providers.

## Resources
/signals · /opportunities · /executions · /distributions · /usage · /health

## Response
Success: { data, request_id }
Failure: { error: { code, message, retryable }, request_id }

## State Machines
Opportunity: NEW → REVIEWED → SELECTED → EXECUTION_READY → CONTACT_READY → WON/LOST
Execution: PENDING → RUNNING → SUCCEEDED / FAILED / RETRYABLE / CANCELLED
Distribution: DRAFT → APPROVAL_REQUIRED → APPROVED → CONTACTED → FOLLOW_UP → REPLIED → QUALIFIED → PROPOSAL → WON/LOST

## Rules
Authenticate protected workspace operations. Authorize by workspace membership. Validate provider responses before persistence. Never return secrets. Generate request IDs for traceability.