# ORDVELA INTELLIGENCE — Deployment and Operations
Status: V0 CANONICAL

## Preferred runtime
Use Cloudflare-compatible components where practical:
- Workers for APIs/jobs
- D1 for structured operational data
- Pages or Workers for dashboard delivery
- scheduled jobs for ingestion
- external providers behind adapters

## Environments
- local/development
- staging/preview
- production

Production secrets must never be committed.

## Release sequence
1. validate locally
2. run automated tests
3. deploy preview
4. execute E2E smoke test
5. promote production
6. verify health and key workflow
7. record release

## Rollback
Every production release must have a known rollback path. Provider or schema changes must not silently invalidate existing commercial state.

## Operations
Monitor ingestion, execution, deployment, distribution preparation and error rates. Prefer a smaller reliable system over a larger fragile system.
