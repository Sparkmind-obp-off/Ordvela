# ORDVela Intelligence — Community & Demand Discovery Architecture

Status: CANONICAL / DESIGN LOCK
Date: 2026-10-08

## Purpose
Community & Demand Discovery expands ORDVela Intelligence into a provider-independent system for finding real demand across social networks, communities, forums and discussion surfaces.

It is a capability inside Ordvela Intelligence, not a new product or brand.

## Canonical pipeline
**COMMUNITY DISCOVERY → COLLECT → NORMALIZE → DEDUP → DETECT DEMAND → QUALIFY → SCORE → OPPORTUNITY → HUMAN REVIEW**

Downstream:
**OPPORTUNITY → BUILD → DEMO → SELL → REVENUE → LEARN**

## Source classes
- Social: Threads, Facebook Pages, Instagram Professional, X and other officially accessible networks.
- Communities: Reddit, Discord servers with an authorized bot/app, forums and community APIs.
- Video/discussion: YouTube and other official discussion APIs.
- Open feeds: RSS and permitted public forum feeds.
- External data providers: commercial aggregators, search/data APIs and licensed sources.

## Provider strategy
Provider availability is not a core dependency. A provider may be IMPLEMENTED, CONFIGURED, VALIDATED, ENABLED, BLOCKED_PERMISSION, AUTH_ERROR, RATE_LIMITED, UNAVAILABLE or DOCUMENTATION_REQUIRED.

A blocked provider must never block the intelligence core.

## Meta policy
Threads, Facebook Pages and Instagram remain implemented and valuable. Current state:

**SOFT-HOLD / ACCESS-RECOVERY OPTIONAL**

Keep adapters; do not claim live ingestion; do not guess scopes or tokens; perform one controlled recovery attempt when valid access exists; activate only after real validation and evidence; continue other providers in parallel.

## Cost policy
Start with free/official access where sufficient. Evaluate paid sources by:

**SOURCE COST → SIGNAL QUALITY → QUALIFIED DEMAND → OPPORTUNITY RATE → REVENUE**

A paid provider is acceptable when incremental commercial value exceeds API and operational cost.

## External provider adapter contract
External providers must preserve original provenance where available, source identity, retrieval timestamp, freshness, licensing/terms constraints, cost/usage and coverage notes. External providers never become the ORDVela business-logic system of record.

## Safety
Never bypass platform controls, use stolen/session credentials, use Discord self-bots/user-account automation, bypass CAPTCHA, discover private accounts without authorization, invent undocumented endpoints, or present unofficial workarounds as production integrations.

External contact, posting, reply and DM remain OFF in V0.

## First implementation wave
1. Reddit
2. YouTube
3. Discord
4. RSS/public forums
5. Mastodon/other official sources
6. X when economics justify
7. Meta access recovery when credentials/permissions are ready
8. External aggregation providers when coverage/ROI justify

## Definition of success
ORDVela is not judged by records collected. It is judged by:

**qualified demand → opportunity → human-approved action → outcome → revenue**
