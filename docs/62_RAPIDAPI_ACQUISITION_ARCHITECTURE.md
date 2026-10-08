# ORDV​​ELA — RapidAPI Acquisition Bridge Architecture v0.1

**Push recovery (2026-10-08):** GitHub write authorization recovered. Existing main advanced from f6b6061 to d192cb3 with all outstanding Apify/RapidAPI release commits, verified by successful git push. Earlier push-blocker paragraphs below are historical attempts, not current status. Live Rp0 validation still requires verified subscription/hard-limit proof; recovery does not authorize provider execution.

**Status:** IMPLEMENTATION-READY  
**Policy:** FREE-FIRST / REVENUE-GATED  
**Existing provider:** Apify remains active  
**Runtime:** Cloudflare Workers + D1

## 1. Decision

Ordvela adds RapidAPI as a secondary acquisition provider. RapidAPI does **not** replace Apify.

Provider strategy:

```
Official / Free API
      ↓
RapidAPI Free/Freemium
      ↓
Apify
      ↓
Other paid provider
```

This is a routing preference, not a permanent dependency chain. Ordvela remains provider-agnostic.

The real optimization target is:

```
COST → SIGNAL QUALITY → QUALIFIED DEMAND → OPPORTUNITY → REVENUE
```

## 2. Mission

Acquisition exists to feed the canonical Ordvela intelligence loop:

```
REAL DEMAND
→ QUALIFIED DEMAND
→ OPPORTUNITY
→ HUMAN REVIEW
→ ACTION
→ REVENUE
→ LEARN
```

Ordvela does not optimize for scraping volume.

## 3. Architecture

```
                         ORDV​​ELA
                            │
                            ▼
                    PROVIDER ROUTER
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   OFFICIAL / FREE      RAPIDAPI            APIFY
        API            FREE-FIRST       ACQUISITION
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                         EVIDENCE
                            ▼
                        NORMALIZE
                            ▼
                          DEDUP
                            ▼
                    DEMAND DETECTION
                            ▼
                       QUALIFICATION
                            ▼
                          SCORE
                            ▼
                       OPPORTUNITY
                            ▼
                      HUMAN REVIEW
                            ▼
                          ACTION
                            ▼
                         REVENUE
                            ▼
                           LEARN
                            │
                            └────→ PROVIDER EVALUATION
```

## 4. Responsibility

### RapidAPI adapter

Responsible for:

- API transport
- provider authentication
- endpoint invocation
- response retrieval
- provider-specific error handling
- quota/rate-limit metadata where available

Not responsible for:

- demand semantics
- scoring
- opportunity decisions
- outreach
- revenue attribution

### Ordvela

Owns:

- provider selection
- acquisition policy
- budget controls
- normalization
- deduplication
- provenance
- demand detection
- qualification
- scoring
- opportunity creation
- human review
- outcomes
- revenue learning

## 5. Provider Contract

RapidAPI must conform to the existing acquisition-provider abstraction.

Conceptual interface:

```ts
interface AcquisitionProvider {
  id: string;
  health(): Promise<ProviderHealth>;
  discover(config: AcquisitionConfig): Promise<AcquisitionResult>;
  estimate(config: AcquisitionConfig): Promise<CostEstimate>;
  capabilities(): ProviderCapabilities;
}
```

Provider ID:

```
rapidapi
```

Existing:

```
apify
```

Do not duplicate intelligence logic inside the RapidAPI adapter.

## 6. Server-Side Secret

Required secret:

```
RAPIDAPI_KEY
```

The key must never appear in:

- browser/client code
- frontend environment
- localStorage
- D1
- Git
- logs
- API responses
- settings payloads
- screenshots

All RapidAPI requests originate server-side through the Cloudflare Worker.

Provider-specific hosts/endpoints must be configuration, not secrets unless a provider explicitly requires otherwise.

## 7. API Registry

Create a provider-neutral registry with RapidAPI-specific metadata.

Minimum fields:

```text
apiId
name
host
baseUrl
platform
capabilities
pricingModel
freeQuota
rateLimit
enabled
reviewed
approvedForLive
termsReference
validationStatus
```

Pricing state must distinguish:

```
FREE
FREEMIUM
PAID
UNKNOWN
```

Never assume an API is free merely because it is listed on RapidAPI.

## 8. Candidate Lifecycle

```
DISCOVERED
    ↓
REVIEWED
    ↓
CONFIGURED
    ↓
VALIDATED
    ↓
APPROVED
    ↓
ENABLED
```

Discovery does not imply production authorization.

## 9. Acquisition Lifecycle

```
DISCOVER
→ REVIEW
→ AUTHORIZE
→ CONFIGURE
→ VALIDATE
→ BOUNDED REQUEST
→ RETRIEVE
→ NORMALIZE
→ DEDUP
→ INTELLIGENCE
```

Every live request must have explicit bounds.

## 10. FREE-FIRST Policy

Provider routing should prefer the cheapest viable source:

1. Free official API/feed
2. RapidAPI free/freemium API
3. Apify within approved budget
4. Other paid provider

A paid provider cannot be selected merely because it is technically available.

If a free quota is exhausted:

```
FREE QUOTA EXHAUSTED
        ↓
STOP
```

Never silently upgrade into paid usage.

## 11. Budget Contract

Every acquisition request carries:

```ts
interface AcquisitionBudget {
  maxRequests: number;
  maxItems: number;
  maxSpend: number;
  currency: string;
  timeoutMs: number;
}
```

For free-only validation:

```
maxSpend = 0
```

If the provider cannot guarantee compliance with the budget, the request must not execute automatically.

## 12. Canonical Evidence

RapidAPI output must normalize into the same canonical evidence contract used by Apify.

Conceptual fields:

```text
source
provider
externalId
canonicalUrl
authorRef
publishedAt
retrievedAt
title
body
language
engagement
metadata
evidence
rawReference
contentHash
```

RapidAPI provenance:

```text
provider = rapidapi
apiId
apiHost
endpoint
requestFingerprint
retrievedAt
responseStatus
quotaMetadata
acquisitionStatus
```

RapidAPI evidence must never be mislabeled as a first-party official API result.

## 13. Raw Data

Raw provider output is transport data, not intelligence truth.

Flow:

```
RapidAPI response
→ rawReference
→ canonical normalization
→ evidence
→ dedup
→ intelligence
```

## 14. Deduplication

Use the existing Ordvela deduplication system.

Preferred identity:

1. externalId
2. canonicalUrl
3. provider + source + externalId
4. contentHash

Cross-provider duplicates must be detected.

Example:

```
RapidAPI → Reddit item X
Apify    → Reddit item X
```

These should resolve to one canonical evidence item while retaining acquisition provenance.

## 15. Intelligence Integration

RapidAPI must feed the existing pipeline without changing semantic rules:

```
Evidence
→ Demand Detection
→ Qualification
→ Score
→ Opportunity
```

Do not create a separate RapidAPI scoring system.

## 16. Human Approval

RapidAPI must never trigger autonomous:

- posting
- commenting
- replying
- following
- liking
- direct messaging
- mass outreach

The boundary remains:

```
Opportunity
    ↓
HUMAN REVIEW
    ↓
APPROVE / REJECT
```

## 17. Provider Evaluation

Track RapidAPI and Apify using the same metrics:

```
requests
successfulRequests
failedRequests
itemsRetrieved
validEvidence
duplicates
qualifiedDemand
opportunities
approvedOpportunities
wins
revenue
acquisitionCost
revenuePerAcquisitionCost
```

Primary business metric:

```
Revenue / acquisition cost
```

Secondary metrics:

```
qualified demand / request
opportunity / request
opportunity / cost
```

## 18. Provider Evaluation Record

Conceptual:

```ts
interface ProviderEvaluation {
  provider: string;
  source: string;
  periodStart: string;
  periodEnd: string;
  requests: number;
  successfulRequests: number;
  evidenceCount: number;
  qualifiedDemandCount: number;
  opportunityCount: number;
  approvedCount?: number;
  revenue?: number;
  acquisitionCost: number;
  qualityScore?: number;
  opportunityRate?: number;
  revenuePerCost?: number;
}
```

## 19. First Validation Experiment

Do not validate many APIs at once.

First experiment:

```
1 source
1 use case
1 RapidAPI candidate
1 Apify candidate
5–10 results
read-only
zero/near-zero budget
```

Compare:

- data quality
- freshness
- coverage
- qualified demand
- opportunity rate
- cost
- reliability

The result determines provider preference for that source.

## 20. Database Integration

Reuse existing Ordvela acquisition/evidence/opportunity structures wherever possible.

Potential configuration:

```
provider_configs
acquisition_jobs
acquisition_runs
evidence
provider_evaluations
```

RapidAPI-specific values should be represented through provider metadata rather than duplicated intelligence tables.

## 21. Failure States

Normalize RapidAPI failures:

```
AUTH_ERROR
RATE_LIMITED
QUOTA_EXCEEDED
PAYMENT_REQUIRED
API_UNAVAILABLE
PROVIDER_ERROR
VALIDATION_ERROR
TIMEOUT
DEGRADED
```

Retries must remain bounded by request, timeout, quota, and budget policies.

## 22. Security

Required controls:

- server-side authentication
- input validation
- host/endpoint allowlisting where practical
- timeout
- response-size bounds
- rate limiting
- secret redaction
- structured errors
- audit logging without secrets
- no arbitrary proxy behavior

Browser calls Ordvela. Browser does not call RapidAPI directly.

## 23. UI / Settings

Expose provider state, not secrets.

Display:

```
RapidAPI
Status: HEALTHY / DEGRADED / ERROR
Credential: CONFIGURED / MISSING
Free-first: ENABLED
Approved APIs: N
Live validated APIs: N
Paid execution: BLOCKED / ALLOWED
Last validation: <timestamp>
```

Never display the API key.

## 24. Runtime Modes

```
DISCOVERY
DRY_RUN
MOCK
VALIDATION
LIVE
DISABLED
```

Initial state:

```
MOCK
```

Then:

```
VALIDATION
```

Then LIVE only after explicit approval.

## 25. Implementation Phases

### R0 — Inspect

- inspect current Ordvela architecture
- inspect Apify provider contract
- identify reusable abstractions
- do not break existing Apify behavior

### R1 — Adapter

- implement RapidAPI provider adapter
- provider registration
- credential contract
- health check
- bounded request contract

### R2 — Registry

- RapidAPI API registry
- pricing state
- capability metadata
- review/approval state

### R3 — Mock

- mock requests
- mock responses
- normalization
- provenance
- dedup
- no live/paid calls

### R4 — Validation

Select exactly one approved free/freemium API.

Execute one bounded read-only validation within zero-cost quota where possible.

### R5 — Intelligence

Verify:

```
RapidAPI
→ Evidence
→ Dedup
→ Demand
→ Qualification
→ Score
→ Opportunity
```

### R6 — Comparison

Compare RapidAPI and Apify using real validation evidence.

### R7 — Production Gate

Routine production use requires:

- acceptable quality
- acceptable reliability
- acceptable terms
- acceptable cost
- demonstrated opportunity contribution

## 26. Testing

### Unit

- configuration
- request construction
- authentication
- timeout
- errors
- budget enforcement
- normalization
- provenance
- dedup
- secret redaction

### Contract

- provider interface
- evidence contract
- acquisition job
- evaluation record

### Security

- key never returned
- key never logged
- browser cannot invoke provider directly
- malformed input rejected
- arbitrary host protection

### Integration

```
RapidAPI
→ Worker
→ normalized evidence
→ D1
```

### Golden Path

```
request
→ provider
→ response
→ evidence
→ demand
→ qualification
→ score
→ opportunity
```

## 27. Non-Goals

v0.1 does not implement:

- autonomous outreach
- posting
- DM automation
- mass messaging
- CAPTCHA bypass
- credential/session scraping
- private-account discovery
- platform-control bypass
- automatic paid upgrades
- uncontrolled crawling

## 28. Definition of Done

RapidAPI Bridge v0.1 is complete when:

- provider adapter exists
- Apify remains functional
- RapidAPI registry exists
- credential is server-side
- FREE-FIRST policy is enforced
- accidental paid execution is impossible
- bounded requests are enforced
- results normalize into canonical evidence
- provenance is preserved
- cross-provider dedup works
- existing intelligence pipeline receives results
- opportunities can be created
- human approval remains mandatory
- provider metrics are recorded
- mock/unit/security tests pass
- one bounded live validation succeeds
- production deployment is verified

## 29. Final Rule

Ordvela does not belong to Apify.

Ordvela does not belong to RapidAPI.

Ordvela owns the intelligence layer and chooses the acquisition provider that produces the best qualified demand for the lowest justified cost.

**FREE-FIRST. PROVIDER-AGNOSTIC. REVENUE-GATED. HUMAN-APPROVED.**

## 30. Implementation Directive

Implement conservatively:

```
READ CURRENT CODE
→ READ APIFY CONTRACT
→ REUSE ABSTRACTIONS
→ ADD RAPIDAPI ADAPTER
→ MOCK
→ TEST
→ REGISTER ONE CANDIDATE
→ VALIDATE ONE FREE REQUEST
→ VERIFY FULL INTELLIGENCE PIPELINE
```

Do not redesign Ordvela unnecessarily.

Do not remove Apify.

Do not introduce paid APIs without explicit approval.

Do not expose credentials.

Do not expand to multiple live APIs until the first end-to-end path is proven.

## Observed implementation increment — v0.5.0 (2026-10-08)

### Architecture and scope actually implemented
- Audited existing acquisition contracts and canonical document `f6b6061`; merged it with the preserved Apify release commits. No repository, master brand, custom domain or parallel intelligence model created. Apify runtime/table/Actor gates remain intact.
- `src/rapidapi.ts`: typed AcquisitionProvider interface, fixed allowlisted GET transport, server-side X-RapidAPI-Key/X-RapidAPI-Host, manual redirect refusal, 10s/300kB/10-record limits, safe non-retriable errors, response quota whitelisting, estimate/capabilities/health, staged YouTube-comments normalization. Key presence yields CONFIGURED_NOT_LIVE_VALIDATED, never fabricated HEALTHY.
- `src/rapid-acquisition.ts`: provider-neutral config registry, explicit lifecycle, owner-attested zero-cost policy, global quota reservation for the shared runtime key, existing ACQUIRE jobs, durable STARTING/UNKNOWN guard, bounded normalization buffer for crash-safe ingestion, canonical evidence receipts, early cancellation, one initial validation per configuration. At most one network request per job; no external retries, no paid escalation.
- `src/acquisition-routing.ts`: capability-aware FREE-FIRST recommendations and derived D1 provider evaluations. No automatic execution/fallback. Routing gates cost, reviewed availability, current runtime validation and remaining shared quota; observed qualified-per-request contributes to preference. Quality, coverage/freshness and revenue remain visible human-review factors, not fabricated benchmarks.
- Reuses `jobs.ingest`, acquisition-demand-gate-v1 and rules-v1.0. RapidAPI and Apify pass the SAME qualification and historical score rules. Canonical YouTube IDs deduplicate across providers; duplicate acquisition receipts keep distinct provenance without rewriting original evidence or score history. Non-demand evidence does not become an opportunity.
- Migration `0004_acquisition_provider_configs.sql`: additive provider_configs, provider_quota_budgets, acquisition_runs (FK extension of existing jobs), evidence_receipts. No duplicate evidence/opportunity/outcome ledger. ProviderEvaluation is derived from persisted jobs/receipts/outcomes, not a second revenue table.
- Settings adds candidate registration/review/free-policy configuration, bounded validation/LIVE confirmation, status/quota/cost/provenance history, router and assisted provider comparison. No key input, masked value, suffix or client-side RapidAPI call. CSP connect-src remains self-only.
- Managed runtime RAPIDAPI_KEY only. Application ID is not an access token, asset ID, endpoint, subscription or quota proof. The policy stores a private one-way credential-binding digest solely to invalidate approvals after key rotation; neither raw key nor that digest is returned by registry APIs. Global API input guard rejects accidental runtime-key inclusion in any JSON/URL, including unrelated generators. Error logs omit URLs/payloads/headers.

### Candidate discovery vs live proof
Only **ytjar/yt-api**, host **yt-api.p.rapidapi.com**, endpoint **GET /comments?id=VIDEO_ID** is staged. Official marketplace overview documents this endpoint and optional pagination; pagination, downloads, cache-bypass and extra quota features are never used. One public video, not keyword discovery requiring additional requests.

Reference: https://rapidapi.com/ytjar/api/yt-api and https://rapidapi.com/ytjar/api/yt-api/pricing. Published comments mapping is staged from a synthetic `data[] / commentId / contentText / authorText / explicit publishedAt` contract, NOT a verified live provider schema. Relative publication text remains UNKNOWN. Any incompatible response fails, rather than guessing field paths. Provider-derived evidence has verified=false, not official YouTube/Meta verification.

Pricing **UNKNOWN**, subscription **NOT VERIFIED**, remaining free quota **UNKNOWN**, no hard-limit/zero-overage proof supplied. Plain/rendered marketplace pricing pages did not expose verifiable current account-plan quotas. Search snippets are not subscription evidence. Other seven source categories are honestly NO_REVIEWED_CANDIDATE. No guessed hosts or speculative credentialed marketplace/account endpoint called.

RapidAPI's official response-header documentation explicitly says quota remaining zero can start overage charges: https://docs.rapidapi.com/docs/response-headers. A global free-plan hard-limit header is not proof that every endpoint/billing dimension on a particular subscribed API is free. Therefore no live provider request was sent using the supplied key. Do not mark R4/R6/Definition of Done complete from mocks.

### Enforced operating policy
- Every job maxRequests=1, maxItems=1–10, maxSpend=0 (IDR or USD); 1–10s timeout, no pagination, 30-day maximum UTC window. Explicit timestamps outside the window rejected; absent timestamps explicitly unknown.
- OWNER reviews terms/source authorization and staged schema, then verifies active subscription, named plan, remaining free quota, period and hard-limit/no-overage for ALL billing dimensions. This is recorded as OWNER_ATTESTED, NOT an automatic marketplace verification or vendor invoice. UNKNOWN/PAID/soft-limit subscriptions remain blocked.
- Local quota reservoir shared across invite-only workspaces; atomic reservation, conservative cancellation accounting, observed response quotas can only shrink allowance. External use of the same key is not fully visible; provider-side hard-limit proof remains mandatory. Quota depletion → STOP, never automatic upgrade.
- Two request reservations/workspace/day, five/shared-runtime/day, max two STARTING/UNKNOWN jobs; existing 60 jobs/hour and evidence capacity gates preserved. One initial validation request/configuration; initial empty output does not validate mapping. Terminal malformed output fails and usable partial output is explicit.
- Routine FREE LIVE requires actual usable bounded validation → human quality approval → config enable + workspace provider enable. Paid routine acquisition is entirely BLOCKED in v0.1; revenue metrics never authorize spending themselves.
- Shared evidence can assist more than one provider; revenue attribution is NON-ADDITIVE. Currency ledgers remain separate. ROI is null for zero/unknown cost, not infinity or manufactured profit; USD ratio only when a nonzero USD denominator is known. RapidAPI cost zero is based on reviewed hard-limit policy, not an independently verified invoice.
- Jobs remain request-driven, no cron/queue daemon. UNKNOWN reconciliation, plan-policy refresh and credential-rotation recovery remain manual administrative tasks; no speculative replay endpoint or autonomous broad acquisition.

### Tests / release evidence before production deploy
Typecheck/build PASS; worker ~187.5 kB uncompressed. **69 tests PASS**, including 18 RapidAPI unit/security/D1/contract tests. Mock full pipeline: two evidence records, one qualified opportunity, one non-demand record; cross-provider canonical duplicate stays one opportunity with additional provenance. Tests cover quota reservation races, copied-workspace quota prevention, crash recovery without second request, timeout UNKNOWN, unsafe hosts/parameters/redirects/errors, key leakage, expired policy and disabled workspace. Existing Apify/provider/core tests preserved. API golden path 324 assertions in one run, 312 final repeat (poll timing), both PASS. Browser 56 checks PASS on desktop/mobile, zero unexpected errors. npm audit zero vulnerabilities.

Private D1 backup taken before migration; seven additive remote commands succeeded. Managed RAPIDAPI_KEY installed through stdin with value suppressed, no runtime secret in repo/D1/client config. Production deployed and verified on existing BYOK `ordvela`: https://ordvela.pages.dev and immutable https://ba52f2d1.ordvela.pages.dev, source `6c7f9e7` (runtime implementation `a3003c1`, contract tests `08eb290`). Health HTTP 200, production DB ready, version 0.5.0. Project metadata retained as ordvela.

Production safe gate test `tests/rapidapi-production.mjs`: **78 checks PASS_SAFE_DEPLOYMENT_GATES**. Authenticated operator candidate registered DISCOVERED / MOCK / disabled; no terms/schema review or plan attestation fabricated. Protected API 401, arbitrary-host/secret payload rejection 400, enable-before-validation 409, unreviewed free request and nonzero spend rejected 409, dry-run makes zero network requests and cannot estimate zero for UNKNOWN plan. Configured secret boolean true; no key in JSON/static assets, private binding digest hidden, CSP connect-src self-only. Existing DB defaults provider health to UNKNOWN (not HEALTHY); initial test expected NOT_CHECKED and was corrected after inspecting the actual unchanged schema semantics. No application fault or provider request occurred from that assertion mismatch.

Production golden path **77 checks PASS**, real historical HN evidence, all contact/revenue strictly labelled QA simulation; isolated QA archived and public demo revoked. Authenticated operator desktop/mobile browser **14 checks PASS**, zero unexpected page errors after candidate population. Working tree/dist/test-log secret scan: **126 files**, zero supplied/runtime key matches; Git history **210 blobs**, zero matches before release commit. Supplied RapidAPI key never sent to marketplace/source endpoints, only provisioned as a managed secret and verified against safe ORDVELA responses. Rotate the chat-exposed key before routine use; rotated runtime key invalidates current plan binding if one has been reviewed.

Real RapidAPI requests: **0**. Real RapidAPI evidence/opportunities: **0/0**. Paid calls: **0**. Terms approvals: **0**. Candidate/API enabled: **0**. Live authentication/subscription: **NOT VALIDATED**. One real Rp0 request and real RapidAPI-vs-Apify experiment remain **BLOCKED**, not complete, pending a verified subscribed hard-limited free plan and source/schema review. Apify implementation, managed secret and eight operator Actor configurations remain preserved; no paid Apify run, no Meta access recovery, no external outreach performed.

GitHub write authorization still rejected the existing main push despite successful setup/fetch; no alternate repository or force push used. Release/verification commits preserved locally. User must restore write authorization in the GitHub panel before outstanding main commits can be pushed.

**Success is not “RapidAPI works.”**

Success is:

```
RapidAPI
→ REAL EVIDENCE
→ QUALIFIED DEMAND
→ OPPORTUNITY
```
