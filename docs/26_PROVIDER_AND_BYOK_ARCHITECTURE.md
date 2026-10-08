# ORDVELA INTELLIGENCE — Provider and BYOK Architecture
Status: CANONICAL ARCHITECTURE / IMPLEMENTED SELECTED PROVIDERS

## Current implementation (2026-10-08)
Registry and non-executing generator: src/providers.ts. Lifecycle and encrypted credential endpoints: src/api.ts. Durable health/assessment jobs: src/jobs.ts. HN/GitHub preserved; Groq grounded evidence assessment and documented Threads keyword adapter implemented. Missing vendor access remains NOT_CONFIGURED; broader providers remain DOCUMENTATION_REQUIRED. No arbitrary generated code is registered. Production encryption root is configured; exposed keys were not installed. Exact verified coverage: 58_PROVIDER_PRODUCTION_VERIFICATION.md.

## Principle
Core logic must not depend on one vendor.

## Adapter Contracts
SearchProvider, SourceProvider, ExtractionProvider, LLMProvider, DeploymentProvider, MessagingProvider.

## LLM Capabilities
classify, extract, summarize, score, recommend, generate_solution, generate_message.

## BYOK
Workspace credentials are securely stored server-side; raw secrets are never logged. Support rotation, revocation, provider attribution and usage accounting.

## Hosted Mode
Workspace → Provider Gateway → Selected Provider.

## Cost Control
Deduplicate, cache, budget-check, use economical models for routine classification/extraction and stronger models for high-value execution.

## Failure States
PENDING, RUNNING, SUCCEEDED, FAILED, RETRYABLE, CANCELLED.