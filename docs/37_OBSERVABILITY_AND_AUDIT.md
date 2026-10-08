# ORDVELA INTELLIGENCE — Observability and Audit
Status: V0 CANONICAL

## Required telemetry
Track:
- request ID
- workspace ID
- operation
- provider
- status
- latency
- retry count
- usage units
- estimated cost
- error code

## Audit events
Record material events:
- signal ingestion
- opportunity creation
- score/version changes
- selection
- blueprint creation
- execution start/end
- deployment
- message generation
- approval
- contact
- follow-up
- outcome

## Privacy
Logs must not contain raw credentials. Sensitive source content should be minimized in operational logs; full evidence belongs in controlled data storage.

## Operator visibility
The dashboard must make failures, pending work and retryable work visible instead of silently swallowing errors.
