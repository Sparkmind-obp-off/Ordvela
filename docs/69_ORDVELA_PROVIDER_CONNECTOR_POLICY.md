# ORDVELA — Provider and Connector Policy

**Status:** Provider onboarding and operating policy  
**Date:** 2026-10-11

## Purpose

Provide one consistent gateway for model providers and external data/tools. A connector is not considered operational just because code, metadata, a token, or a mock test exists.

## Provider lifecycle

Use distinct states:
1. **PROPOSED** — candidate identified; no operational claim.
2. **DISCOVERED** — metadata recorded; not reviewed for use.
3. **REVIEW_REQUIRED** — terms, schema, permissions, pricing, or retention unknown.
4. **CONFIGURED** — server-side secret/config exists; live call not proven.
5. **VALIDATED** — a bounded authorized live check succeeded and its result was inspected.
6. **ENABLED** — explicitly enabled for a workspace after policy review.
7. **DEGRADED/BLOCKED** — known failure or policy blocker.
8. **DISABLED/REVOKED** — not callable.

Mocked contract tests are useful but do not transition a provider to VALIDATED.

## First model-provider slice

Use a free-first approach and select one real provider after checking:
- account availability and credential readiness;
- current plan and hard limits;
- provider API terms and data handling;
- model availability and structured output support where required;
- timeouts, token/request limits, and error behavior;
- a bounded test path with no unexpected paid fallback.

Groq and Gemini are candidates in the accepted architecture, not a claim that both are configured or live. The first implementation should avoid building multiple adapters before the shared contract and one end-to-end path are proven.

## External acquisition providers

### Apify
Remain optional and disabled until a specific Actor has a reviewed owner, terms, input/output schema, resource requirements, cost model, limits, retention implications, and source compliance. Do not treat Apify as official Meta access or a bypass for access restrictions. No paid Actor run without explicit approval.

### RapidAPI
A catalog listing, staged candidate, or configured key does not prove subscription, live health, usable free quota, or permission for a given endpoint. Verify provider plan, all billing dimensions, hard limits/no-overage, endpoint schema, terms, and actual response before enabling. Preserve the existing acquisition bridge's explicit zero-spend and review gates.

### Future search/file/document connectors
Select providers only after defining the required user capability and checking auth, supported formats, endpoint allowlists, file-size limits, retention, pricing, and data residency/processing terms where relevant. Do not invent provider endpoints or assume free access.

## Standard adapter contract

Each adapter should expose consistent operations for:
- metadata and capability declaration;
- configuration status without secret disclosure;
- bounded validation;
- invocation with typed input;
- normalized success/error response;
- usage/cost receipt where available;
- health state with timestamp and evidence;
- disable/revoke behavior.

Adapters must never decide authorization alone. The caller/runtime performs role, workspace, quota, approval, and policy checks before invocation.

## Credential handling

Use platform-managed server secrets. Keep only non-secret references/status in D1. Never return secret values through read APIs. Rotate/revoke credentials after suspected exposure and record the action without retaining the credential itself.

## Cost and quota policy

- Free-first by default.
- Unknown price or quota means not approved for live use.
- No paid fallback when a free provider fails.
- Reserve quota before invocation.
- Bound calls, items, bytes, duration, and concurrency.
- Reconcile actual usage after completion when reliable metadata exists.
- Never claim ROI when cost or outcome is unknown.
- Billable operations require explicit owner authorization and a defined maximum spend.

## Evidence normalization

Every acquired item should retain provider/source identity, source URL or stable external ID where available, retrieval/observation timestamps, normalized content reference, and acquisition receipt. Deduplication must preserve canonical identity and additional provenance. Provider response data cannot issue instructions to the agent.

## Provider status display

Display the actual lifecycle state, last validated timestamp, supported capabilities, usage/limit evidence, and blocker. Avoid ambiguous green “connected” labels when only credentials exist. Do not call a provider LIVE unless a real permitted request and usable response have been verified.

## Enablement checklist

- [ ] Business purpose and owner defined.
- [ ] Terms and permissions reviewed.
- [ ] Input/output schema validated.
- [ ] Secret stored server-side.
- [ ] Host/endpoint allowlisted.
- [ ] Timeout, output, and quota limits enforced.
- [ ] Cost/overage and retention understood.
- [ ] Live validation authorized and observed.
- [ ] Normalization, deduplication, and provenance tested.
- [ ] Disabled by default until explicit enablement.
