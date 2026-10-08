# ORDVELA INTELLIGENCE — Opportunity Data Model
Status: V0 CANONICAL

## Entities
Workspace: id, name, settings, created_at.
Source: id, type, name, status, config_ref, last_run_at.
Signal: id, workspace_id, source_id, external_id, url, author, captured_at, raw_text, normalized_text, metadata.
Opportunity: id, workspace_id, signal_refs, title, problem, desired_outcome, intent, urgency, budget_signal, fit_score, opportunity_score, confidence, status, recommended_action, timestamps.
Execution: id, opportunity_id, blueprint, provider_mode, repository_ref, deployment_url, demo_url, status.
Distribution: id, opportunity_id, execution_id, message, channel, status, contacted_at, outcome, next_follow_up_at.
Usage: id, workspace_id, operation, provider, units, estimated_cost, created_at.

## Data Rules
Preserve raw evidence. Separate derived intelligence. Version scoring where practical. Namespace external IDs. Prefer soft deletion.