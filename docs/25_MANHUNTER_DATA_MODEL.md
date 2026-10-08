# Manhunter — Data Model

Status: V0 SPEC
Date: 2026-10-08

## Core Entities

Workspace: id, name, created_at, settings.

Source: id, type, name, status, configuration reference, last_run_at.

Signal: id, workspace_id, source_id, external_id, url, author, captured_at, raw_text, normalized_text, metadata.

Opportunity: id, workspace_id, signal references, title, problem, desired_outcome, intent, urgency, budget_signal, fit_score, opportunity_score, confidence, status, recommended_action, created_at, updated_at.

Execution: id, opportunity_id, blueprint, provider_mode, repository/reference, deployment_url, demo_url, status.

Distribution: id, opportunity_id, execution_id, message, channel, status, contacted_at, outcome, next_follow_up_at.

Usage: id, workspace_id, operation, provider, units, estimated_cost, created_at.

## Rules
Preserve original evidence.
Never overwrite raw evidence with AI interpretation.
Derived scores should be reproducible from stored inputs where practical.
External IDs are namespaced by source.
Soft deletion is preferred for user-visible records.
