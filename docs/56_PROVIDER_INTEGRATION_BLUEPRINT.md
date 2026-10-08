# ORDVELA — External Provider Integration Blueprint

## Implementation status — 2026-10-08
IMPLEMENTED: registry, lifecycle/health/enable/disable/rotation/revocation, provider checklist UI, normalized contracts, attributed usage, non-executing scaffold generator and selected HN/GitHub/Groq/Threads/Facebook/Instagram adapters. Generator currently accepts technical identity/family, official docs URL, auth and credential field names; endpoint/pagination/webhook implementations are NOT autonomously inferred. Its six files retain DOCUMENTATION_REQUIRED until reviewed integration work. Broader generator input/output below is target architecture, not a claim that vendor implementations are generated or verified. Groq live assessment passed but production activation requires rotated key. FIN v0.3 adds bounded header-auth Meta reads, published-only Page evidence, provider-specific configuration/collection UI and separate demand qualification. Latest token candidates were supplied and tested: Facebook identities accessible but four Page feeds PERMISSION blocked; Threads AUTH_ERROR; no linked IG User ID returned. This is not live Meta ingestion success. Public HN/GitHub credential regression repaired. See 59_FIN_META_IMPLEMENTATION.md for exact live/fixture distinctions and 58_PROVIDER_PRODUCTION_VERIFICATION.md for release verification.

## Purpose

Define one canonical integration contract before real API credentials are supplied.

The implementation must be provider-independent. Providers are adapters behind stable internal contracts; the intelligence and opportunity model must not know vendor-specific request formats.

## Provider Families

### Demand / Discovery
Web/search, Reddit, X, Threads, Facebook/Instagram where official access permits, Hacker News, GitHub, and jobs/freelance sources.

### Intelligence / AI
OpenAI, Groq, and other compatible LLM providers.

### Execution / Deployment
Cloudflare Pages/Workers and other justified deployment adapters.

### Distribution
Email, WhatsApp or other messaging providers only through approved official APIs.

## Canonical Adapter Interface

Every adapter exposes:
- providerId
- providerVersion
- capabilities
- authType
- requiredCredentials
- configure()
- validateCredentials()
- healthCheck()
- fetch()
- normalize()
- getUsage()
- revoke()

Provider-specific fields stay inside the adapter.

## Normalized Source Contract

Every discovered item normalizes to:
source, provider, externalId, canonicalUrl, authorRef, publishedAt, retrievedAt, title, body, language, engagement, metadata, evidence, rawReference, contentHash.

No provider-specific object may leak into the core Opportunity model.

## Credential Contract

The UI shows what the operator needs but never displays stored secret values.

Credential metadata includes provider, credential name/type, required/optional status, official setup instructions, scopes, environment, configured status, last validation, last error class and rotation/revocation status.

Secrets are server-side only, encrypted at rest, never returned by status endpoints, never logged, never committed and never embedded in client bundles.

## Provider Generator

The Provider Generator accepts:
- provider name/family
- official API base URL and documentation URL
- auth method
- credential fields
- scopes
- endpoints
- pagination model
- rate limits
- webhook/event model
- sample response schema

It outputs:
- adapter scaffold
- credential schema
- health-check implementation
- validation implementation
- normalized mapper
- usage metadata
- error mapping
- test fixtures
- documentation entry
- capability manifest

The generator must not invent undocumented endpoints or permissions.

## Lifecycle

DISCOVER → CONFIGURE → VALIDATE → ENABLE → RUN → OBSERVE → ROTATE/DISABLE

A provider cannot become ENABLED unless validation succeeds.

## Safety

Use only official APIs, permitted public feeds or explicitly authorized integrations. No credential scraping, session-cookie theft, CAPTCHA bypass or restriction bypass.

If official access is unavailable, mark the provider UNAVAILABLE rather than inventing a workaround.

V0: HN + GitHub already proven.
V1: production D1, runtime secrets and deployment.
V2: provider framework and selected high-value providers.
