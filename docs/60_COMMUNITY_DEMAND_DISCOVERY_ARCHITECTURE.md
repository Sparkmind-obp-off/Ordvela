# ORDVela Intelligence — Community & Demand Discovery Architecture

Status: CANONICAL / DESIGN LOCK
Date: 2026-10-08
Revision: Apify Acquisition Bridge

## Purpose

Community & Demand Discovery is a provider-independent capability inside Ordvela Intelligence for finding real demand across social networks, communities, forums, search surfaces and discussion channels.

The intelligence core must remain independent from any acquisition vendor. **Apify is an acquisition/infrastructure bridge, not the intelligence engine and not the business-logic system of record.**

## Canonical pipeline

**COMMUNITY DISCOVERY → ACQUISITION → COLLECT → NORMALIZE → DEDUP → DETECT DEMAND → QUALIFY → SCORE → OPPORTUNITY → HUMAN REVIEW**

Downstream:

**OPPORTUNITY → BUILD → DEMO → SELL → REVENUE → LEARN**

## Acquisition layers

1. **Official first-party APIs** — preferred when access is available, stable and commercially sensible.
2. **Apify acquisition bridge** — external Actor infrastructure for permitted public-data acquisition where direct first-party API access is unavailable, insufficient or uneconomical.
3. **Other licensed/commercial data providers** — considered only when coverage and ROI justify them.
4. **Open feeds/public sources** — RSS, public forums and other permitted feeds.

The same normalized evidence contract applies regardless of acquisition route.

## Apify role

Apify provides execution and acquisition infrastructure:

**ORDVELA → APIFY ADAPTER → ACTOR → DATASET / RUN OUTPUT → ORDVela EVIDENCE**

Ordvela then owns:

**NORMALIZE → DEDUP → DEMAND DETECTION → QUALIFICATION → SCORING → OPPORTUNITY → OUTCOME LEARNING**

Do not move demand scoring, commercial qualification or opportunity logic into individual Actors.

## Actor registry

Ordvela maintains a logical Actor Registry rather than hard-coding one Actor into the intelligence layer.

Each registry entry should record:
- logical capability
- source/platform
- Actor ID
- Actor version when relevant
- author/provider
- input schema
- output mapping
- permission/security classification
- pricing model
- expected unit cost
- coverage notes
- terms/licensing notes
- validation status
- enabled/disabled state

Example logical capabilities: threads-search, reddit-search, youtube-comments, tiktok-comments, instagram-posts, facebook-posts, x-search, google-search.

An Actor may be replaced without changing the core evidence/opportunity model.

## Provider availability states

IMPLEMENTED, CONFIGURED, VALIDATED, ENABLED, BLOCKED_PERMISSION, AUTH_ERROR, RATE_LIMITED, UNAVAILABLE, DOCUMENTATION_REQUIRED, DISABLED.

A blocked provider must never block the intelligence core.

## Meta policy

Threads, Facebook Pages and Instagram official adapters remain valuable and are retained.

Current Meta state remains **SOFT-HOLD / ACCESS-RECOVERY OPTIONAL**.

Apify does not retroactively make the official Meta adapters operational. If an Apify Actor is used for a permitted acquisition path, its evidence must be attributed to Apify/Actor provenance and must not be represented as official Meta API ingestion.

No bypass of platform controls, private-account discovery, stolen/session credentials, CAPTCHA bypass or undocumented production endpoints.

## Apify credentials

The primary Ordvela → Apify credential is **APIFY_API_TOKEN**.

It is a server-side secret. It must never be exposed to the browser, committed to Git, embedded in client bundles, or written to logs.

Production preference: use a scoped token where Apify's token/resource model supports the required access; limit access to resources/Actors Ordvela actually needs; use separate credentials for separate services where practical; rotate/revoke credentials through the secret-management path.

The Apify MCP connection used by an operator/AI assistant is separate from the runtime credential used by the deployed Ordvela application.

## Run lifecycle

**QUEUED → RUNNING → SUCCEEDED / FAILED / CANCELLED**

For each successful run, retain provider, Actor ID, run ID, dataset ID when applicable, source/platform, requested capability, input fingerprint, retrieval timestamp, result count, estimated/recorded cost when available, freshness, coverage notes, licensing/terms metadata and normalized error/status.

Unknown external outcomes must not be marked successful.

## Cost guard

**DISCOVER ACTOR → INSPECT SCHEMA/PRICE/PERMISSIONS → SMALL SAMPLE → VALIDATE SIGNAL QUALITY → SCALE**

Where supported, enforce bounded item/run limits and a maximum spend ceiling.

Measure: **SOURCE COST → SIGNAL QUALITY → QUALIFIED DEMAND → OPPORTUNITY RATE → REVENUE**.

A paid acquisition route is justified only when incremental commercial value can plausibly exceed its operational cost.

## Evidence contract

Every acquired item must preserve source, acquisition provider/Actor, observed content, publication time, retrieval time, canonical URL/reference, source identity, raw/normalized state, acquisition/cost metadata and applicable terms/licensing constraints.

External acquisition output never becomes the Ordvela business-logic system of record.

## Safety and compliance

Never bypass platform controls; use stolen/session credentials; bypass CAPTCHA; discover private accounts without authorization; use Discord self-bots/user-account automation; invent undocumented endpoints; present restricted scraping as an official API integration; expose secrets to client code/logs; or enable autonomous posting, replies, DMs or mass outreach.

External contact remains OFF in V0.

## Rollout principle

Provider rollout is parallel rather than blocked on Meta:

**DIRECT OFFICIAL SOURCES + APIFY BRIDGE → NORMALIZED EVIDENCE → INTELLIGENCE CORE**

Use official APIs when they are the best route. Use Apify where it provides a lawful, permitted and economically sensible acquisition path.

## Definition of success

**qualified demand → opportunity → human-approved action → outcome → revenue**
