# ORDVela — Apify Acquisition Architecture

Status: CANONICAL / DESIGN LOCK
Date: 2026-10-08

## Decision

ORDVELA will use **Apify as an external acquisition bridge** for community/social/search data where a direct official API is unavailable, insufficient or economically inferior.

This does not replace provider independence and does not turn Ordvela into an Apify-dependent product.

## Responsibility split

**Apify:** Actor execution, external acquisition, source-specific extraction, run lifecycle, dataset/result transport.

**Ordvela:** provider selection policy, source configuration, evidence normalization, deduplication, demand detection, intent/commercial qualification, scoring, opportunity creation, human review, outcomes and revenue learning.

**LLM:** structured extraction/assessment where enabled; never the raw evidence source of truth.

**D1:** provider configuration, jobs, evidence references, normalized signals, opportunities, usage events and audit state.

## Runtime topology

**Browser → Ordvela API/Worker → Apify Adapter → Apify API → Actor → Dataset/Run Output → Ordvela Worker → Evidence → Demand Intelligence → Opportunity**

The browser never calls Apify directly with the runtime secret.

## Credential model

Primary runtime secret: **APIFY_API_TOKEN**.

Store it in the server-side secret store. Never put it in frontend environment variables, return it through settings APIs, write it to logs, commit it to Git, or ask an operator to paste it into a public field.

Where supported, use a scoped token with only the resources required by Ordvela.

## MCP distinction

Apify MCP is an operator/tooling connection. It is useful for discovering Actors, inspecting Actor details/schema and comparing acquisition options. It is not a substitute for the production application's runtime credential.

Production acquisition uses the Ordvela Apify adapter, persisted jobs, provenance and usage/cost accounting.

## Actor registry model

Logical capability → source → Actor ID → schema → pricing → permission/security → status.

Examples: reddit-search, threads-search, youtube-comments, google-search, tiktok-comments, instagram-posts, facebook-posts and x-search.

Actor selection remains replaceable.

## Acquisition lifecycle

**DISCOVER → REVIEW → AUTHORIZE → CONFIGURE → VALIDATE → BOUNDED RUN → RETRIEVE → NORMALIZE → DEDUP → INTELLIGENCE**

No Actor is production-enabled solely because it is discoverable.

## Bounded execution

Every run should have explicit bounds where supported: query scope, time range, result/item limit, run timeout, maximum spend/charge and workspace/job budget.

Start small, inspect signal quality, then scale.

## Provenance

For every Apify acquisition, retain provider=apify, Actor ID, run ID, dataset ID when available, source/platform, query/input fingerprint, retrieval timestamp, result count, cost/usage metadata, freshness, terms/licensing reference and acquisition status.

## Data boundary

Apify output is **evidence**, not truth. The normalized Ordvela model is the only input expected by the intelligence core.

No Actor-specific field should be required by scoring, opportunity, execution, distribution or outcomes.

## Security / policy boundary

Ordvela must not use Apify to bypass platform controls, access private accounts without authorization, use stolen cookies/session tokens, defeat CAPTCHA, automate user accounts through prohibited methods or claim an unofficial acquisition route is an official API.

Only permitted/public/licensed acquisition paths are eligible for production.

## Economic gate

Actor cost is evaluated against **qualified demand → opportunity → conversion → revenue**. The objective is maximum commercial signal per unit cost, not maximum scraping volume.

## Initial implementation order

1. Finalize Apify runtime credential configuration.
2. Discover and review candidate Actors.
3. Select a minimal first source set.
4. Add Actor Registry.
5. Implement bounded run adapter.
6. Retrieve and preserve results.
7. Normalize into existing evidence contract.
8. Run demand qualification/scoring.
9. Measure opportunity yield.
10. Expand sources only when economics justify it.

## Production gate

Apify is production-enabled only after runtime token validation succeeds; selected Actor permissions/security are reviewed; input schema is validated; a bounded test run succeeds; output mapping is tested; provenance is persisted; cost metadata is observable; downstream demand/opportunity passes; and no secret leakage is observed.
