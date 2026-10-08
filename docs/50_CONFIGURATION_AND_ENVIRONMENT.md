# ORDVELA — Configuration & Environment
Status: CANONICAL / V0

## Environments
development / preview / production.

## Configuration Classes
Public runtime config, server configuration, provider configuration and secrets.

## Rules
Secrets only in managed server-side secret storage. Never commit secrets. Never expose them through build output, logs or client configuration.

## Feature Flags
Use flags for incomplete providers, experimental sources and rollout controls.

## Production Checklist
Database migrations applied → secrets present → provider health checked → scheduled jobs enabled → smoke test passed → monitoring active → rollback path known.