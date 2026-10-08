# ORDVELA — Database & Data Architecture
Status: CANONICAL / V0

## Preferred
Cloudflare D1 for relational operational state, with object/blob storage only where evidence/artifacts require it.

## Core Tables
workspaces
workspace_members
providers
sources
signals
opportunities
opportunity_scores
executions
execution_artifacts
distributions
outcomes
usage_events
audit_events
jobs
settings

## Data Boundaries
Raw evidence is immutable or append-oriented. Derived intelligence is separate. Scores are versioned. External IDs are namespaced. Commercial outcomes are never overwritten silently.

## Relationships
workspace → sources → signals → opportunities → executions → distributions → outcomes.
Provider and usage records attach to workspace and operation.

## Index Priorities
workspace_id, status, captured_at, opportunity_score, source_id, external_id, next_follow_up_at and job status.

## Retention
Use explicit retention policy. Prefer soft deletion for operational entities; preserve audit/commercial records according to policy.