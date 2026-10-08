# MASTER ORDVELA PROVIDER GENERATOR PROMPT

You are implementing the external-provider layer for ORDVELA.

## Mission

Build a provider-independent integration framework and Provider Generator. Do not create a new brand, repository, domain or product identity.

## Rules

1. Inspect the existing ORDVELA repository before changing code.
2. Preserve Intelligence → Opportunity → Execution → Distribution → Outcome.
3. Keep vendor SDK/API logic inside adapters.
4. Never expose credentials to browser code.
5. Never commit secrets.
6. Never invent undocumented API endpoints, scopes, rate limits or authentication methods.
7. Use official API documentation as source of truth.
8. If manual developer-console approval is required, surface the exact operator checklist.
9. If credentials are absent, keep the adapter in NOT_CONFIGURED and continue with deterministic tests.
10. One provider failure must not break unrelated providers.

## Generator Input

provider id/name, family, official docs URL, API base URL, auth type, credential schema, scopes, endpoints, pagination, rate limits, webhook/event model, normalized output schema and sample responses.

## Generator Output

Generate:
- provider manifest
- adapter scaffold
- credential schema
- validateCredentials()
- healthCheck()
- fetch()
- normalize()
- getUsage()
- revoke()
- provider-specific error mapping
- deterministic fixtures
- contract tests
- documentation/checklist
- UI metadata

## Required States

NOT_CONFIGURED → CONFIGURED → VALIDATING → HEALTHY

Failure states:
AUTH_ERROR, RATE_LIMITED, DEGRADED, DISABLED, UNAVAILABLE.

## First Targets

Hacker News and GitHub are existing providers. Add contracts/scaffolds for Reddit, X, Threads, Facebook/Instagram/Meta where official access is valid, Web/Search, OpenAI and Groq.

A scaffold is NOT a live integration.

## Operator Credential Surface

Genspark must create Settings → Providers and explicitly show:

WHAT I NEED:
- exact credential names
- where to create them
- required scopes
- redirect URI if applicable
- webhook secret if applicable

WHERE TO PUT IT:
- secure runtime secret/configuration surface

HOW TO TEST IT:
- Validate Credentials
- Health Check
- Fetch Test / normalized sample

CURRENT STATE:
- Not configured / Configured / Healthy / Error

Never display secret values after saving.

## Production

CREDENTIAL_MASTER_KEY is required for production encrypted BYOK storage.

Provider credentials are optional per adapter. Deterministic V0 remains functional without LLM credentials.

## Acceptance Tests

- no secret in client bundle
- no secret in logs
- invalid credentials produce stable auth errors
- rate limits are classified correctly
- provider failure cannot silently become success
- duplicate external IDs are deduplicated per provider namespace
- normalized records satisfy the core source contract
- disabling a provider stops new ingestion without corrupting prior evidence
- provider health is visible
- credentials can be rotated/revoked
- missing credentials do not break unrelated providers

## Final Report

Return IMPLEMENTED, PARTIAL, BLOCKED or DOCUMENTED ONLY.

For every provider state whether it is scaffolded, configured, validated, healthy or unavailable.

Never fabricate live credentials, provider approval or production deployment.
