# ORDV​​ELA — RapidAPI Acquisition Bridge Architecture v0.1

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

**Success is not “RapidAPI works.”**

Success is:

```
RapidAPI
→ REAL EVIDENCE
→ QUALIFIED DEMAND
→ OPPORTUNITY
```
