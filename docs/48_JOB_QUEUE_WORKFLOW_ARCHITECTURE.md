# ORDVELA — Job & Workflow Architecture
Status: CANONICAL / V0

## Async Jobs
Ingestion, extraction, scoring, prototype generation, validation, deployment and follow-up scheduling.

## Job Lifecycle
QUEUED → RUNNING → SUCCEEDED
QUEUED → RUNNING → RETRYABLE → QUEUED
QUEUED/RUNNING → CANCELLED
RUNNING → FAILED

## Job Record
id, workspace_id, type, input_ref, status, attempts, provider, started_at, finished_at, error_code, error_message, created_at.

## Reliability
Idempotency key for repeatable operations. Exponential retry with bounded attempts. Dead-letter visibility for persistent failures. Never silently mark commercial work successful.