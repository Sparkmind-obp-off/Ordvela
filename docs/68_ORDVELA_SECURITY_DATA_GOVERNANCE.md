# ORDVELA — Security and Data Governance

**Status:** Security requirements for the hybrid command center  
**Date:** 2026-10-11

## Security objective

Adding chat and agents must not weaken the existing ORDVELA workspace security model or expose credentials, business records, or production resources. Existing production data and auth remain canonical.

## Identity and workspace boundaries

- Reuse existing authentication and role checks.
- Enforce workspace scope in every database query and every tool call.
- Treat client-supplied workspace IDs, record IDs, roles, and status values as untrusted.
- Verify ownership/relationship of each referenced record server-side.
- Apply deny-by-default behavior to unknown roles, tools, providers, and routes.
- Do not create a second user/session model just for AI Workspace.

## Secrets

- Provider keys and tokens are managed as server-side secrets using the deployment platform's supported secret mechanism.
- Never store raw credentials in D1, Git, frontend bundles, URLs, prompts, analytics, or logs.
- Never ask the user to paste production secrets into ordinary chat as an implementation shortcut.
- The UI may show configured/unconfigured and validation status, but must not reveal the secret value.
- Redact credential-shaped values from errors and telemetry.
- Secret rotation and revocation procedures must be documented for each provider.

## Conversation data

- Persist only data required for chat history, tool traceability, and user-facing functionality.
- Associate conversations and messages with workspace and authorized owner/scope.
- Apply access checks to list, read, update, archive/delete, and export operations.
- Do not mix one workspace's conversation or retrieval context with another.
- Define retention and deletion behavior before enabling broad user adoption.
- Avoid putting raw secrets, unnecessary personal data, or complete external payloads into message history.
- Treat conversation text as untrusted input when used by an agent.

## Source and retrieval governance

- Store provenance for evidence: source/provider, source record identifier or URL when available, observation time, retrieval time, and normalization status.
- Keep original evidence distinct from summaries and model synthesis.
- Use bounded retrieval: explicit filters, result counts, timeouts, and output limits.
- Source text is untrusted and may contain malicious instructions.
- Preserve canonical deduplication identity; new connectors must not silently overwrite existing evidence.
- Respect provider terms, access permissions, rate limits, and retention constraints.

## Logging and audit

Audit events should capture actor, workspace, action, target record/run, policy decision, timestamps, result state, and sanitized error code. Do not store full prompts/responses by default in operational logs; conversation storage is separate and permission-controlled. Never log secret values, authorization headers, session tokens, or unredacted sensitive provider payloads.

## Database and migrations

- Prefer additive, backward-compatible migrations.
- Inspect existing schema and migration ordering before writing new migrations.
- Do not recreate, drop, or repurpose existing production tables as a shortcut.
- Test migrations against a representative database before release.
- Backup/restore procedure and rollback strategy must be documented before destructive schema changes.
- Apply unique constraints and indexes for workspace-scoped lookups and idempotency where appropriate.
- Never treat a successful local migration as proof that production migration has run.

## AI/provider boundaries

- Provider calls originate from server-side adapters only.
- Validate provider IDs and model names against a server-owned allowlist.
- Set timeouts, response-size limits, and request quotas.
- Distinguish provider outage, missing credentials, quota exhaustion, and invalid response.
- Never silently fall back from a failed real provider to a demo/mock response.
- Treat provider output as untrusted; validate any proposed tool call independently.
- Prevent unbounded loops and cap the number of agent steps.

## Privacy and retention decisions required before broad launch

Before multi-user/general availability, define:
- conversation retention and deletion policy;
- export requirements;
- what provider data is transmitted;
- provider retention/training terms where available;
- user-facing disclosure for external processing;
- audit log retention and who can inspect it;
- incident response and credential rotation ownership.

Unknown terms must be recorded as unknown and block the affected integration until reviewed.

## Release security checklist

- [ ] Cross-workspace authorization tests pass.
- [ ] OWNER/OPERATOR/VIEWER capabilities match the policy.
- [ ] Secrets absent from client bundles, D1 rows, URLs, logs, and error messages.
- [ ] Prompt-injection tests cover retrieved records and external source content.
- [ ] Quotas and time/output bounds enforced server-side.
- [ ] Tool approval bound to immutable plan/version.
- [ ] Provider/connector disabled by default until validated.
- [ ] Migration tested and rollback/backup approach reviewed.
- [ ] Production changes limited to the approved ORDVELA resources.
