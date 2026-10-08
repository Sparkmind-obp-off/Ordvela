# ORDVELA INTELLIGENCE — Deployment and Operations
Status: V0 CANONICAL

## Preferred Runtime
Cloudflare-compatible components where practical: Workers for APIs/jobs, D1 for structured data, Pages/Workers for dashboard delivery, scheduled jobs for ingestion, external providers behind adapters.

## Environments
Development → staging/preview → production.

## Release
Validate locally → automated tests → preview → E2E smoke test → production → health verification → release record.

## Rollback
Every production release has a known rollback path. Provider/schema changes must not silently invalidate commercial state.

## Operations
Monitor ingestion, execution, deployment, distribution preparation and errors. Prefer smaller reliable systems over larger fragile ones.