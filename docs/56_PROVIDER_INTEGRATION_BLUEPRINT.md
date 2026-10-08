# ORDVELA — External Provider Integration Blueprint

Status: CANONICAL / UPDATED 2026-10-08
Scope: direct providers + Apify acquisition bridge

## 1. Core rule

ORDVELA Intelligence is provider-independent. Providers are adapters behind stable internal contracts. Vendor-specific request formats, Actor schemas, credentials and response objects must not leak into the core Opportunity model.

**Apify is an acquisition provider/bridge. It is not the Ordvela intelligence layer.**

## 2. Provider families

Demand/Discovery: Web/search, Reddit, X, Threads, Facebook/Instagram where access permits, Hacker News, GitHub, YouTube, Discord, Mastodon, RSS/forums, jobs/freelance sources and justified external providers.

Acquisition infrastructure: Apify Actors and other licensed/commercial acquisition services.

Intelligence/AI: OpenAI, Groq and compatible LLM providers.

Execution/Deployment: Cloudflare Pages/Workers and justified deployment adapters.

Distribution: Email, WhatsApp and other approved official messaging APIs.

## 3. Canonical adapter interface

Every provider adapter should expose: providerId, providerVersion, capabilities, authType, requiredCredentials, configure(), validateCredentials(), healthCheck(), fetch(), normalize(), getUsage(), revoke().

For Apify, fetch() represents a bounded Actor run and result retrieval. Actor-specific input/output mapping stays inside the Apify adapter.

## 4. Normalized evidence contract

Every discovered item normalizes to: source, provider, externalId, canonicalUrl, authorRef, publishedAt, retrievedAt, title, body, language, engagement, metadata, evidence, rawReference, contentHash.

Apify-originated evidence additionally preserves actorId, actorVersion when relevant, runId, datasetId when applicable, inputFingerprint, estimatedCost when available and terms/licensing references.

No provider-specific object may leak into the core Opportunity model.

## 5. Apify credential contract

Runtime credential: **APIFY_API_TOKEN**.

Storage: server-side only; Cloudflare Worker secret / encrypted server configuration; never browser-side; never source-controlled; never logged.

Recommended production posture: scoped token where feasible; resource-limited access; separate token per service/workspace integration when practical; rotation/revocation supported.

**Apify MCP credential ≠ Ordvela runtime API token.** MCP is for the connected operator/assistant. Ordvela production runtime authenticates directly to Apify with its server-side token.

## 6. Actor Registry

Do not hard-code Actor IDs throughout business logic. Use logical capability → source → Actor ID → schema → pricing → permission/security → status.

Logical slots include threads-search, reddit-search, youtube-comments, tiktok-comments, instagram-posts, facebook-posts, x-search and google-search. These are logical slots, not claims that every Actor is currently validated.

## 7. Apify execution contract

**Ordvela request → Apify Adapter → Actor input validation → bounded Actor run → run status → dataset/result retrieval → raw evidence → normalization → deduplication → demand intelligence**

The adapter must validate capability, resolve Actor, validate known input schema, apply item/time/spend bounds, persist a job, run the Actor, observe completion/failure, retrieve output, attach provenance, normalize evidence, record usage/cost metadata and surface failures without fabricating data.

## 8. Security gate

Before enabling an Actor: inspect identity/author, permission/security requirements, input/output schema, pricing, coverage, platform/terms constraints and login/session requirements; prefer limited-permission Actors; test with a minimal bounded run; retain evidence supporting enablement.

No full-scale run should occur merely because an Actor exists.

## 9. Cost policy

Minimum controls: max items, max run duration where supported, max spend/charge ceiling where supported, per-workspace usage event, provider attribution, Actor attribution, run-level cost metadata and alert/disable threshold.

Scale only after signal validation.

## 10. Failure normalization

authentication → AUTH_ERROR; permission → BLOCKED_PERMISSION; rate limit → RATE_LIMITED; timeout/unavailable → UNAVAILABLE; invalid Actor/input → VALIDATION_ERROR; provider degradation → DEGRADED.

A provider failure must not corrupt existing opportunities or block other providers.

## 11. Direct API vs Apify

Prefer direct official API when access is available, capability is sufficient, terms permit intended use, economics are sensible and reliability is acceptable.

Prefer Apify when direct access is blocked/unavailable and the Actor provides a permitted, useful, bounded and economically sensible acquisition path.

Use both where complementary. Never make Apify an irreversible system dependency.

## 12. V0 safety boundary

Acquisition is read-only. No autonomous posting, commenting, replying, liking, following, DM or mass outreach. The system discovers and analyzes demand; humans decide what to do.

## 13. Definition of done

Apify integration is complete only when credentials are securely configured, Actor Registry exists, bounded execution works, raw output and provenance are preserved, normalized evidence is produced, duplicate handling works, demand extraction works, failures are observable, cost/usage is recorded and opportunity scoring consumes normalized evidence.
