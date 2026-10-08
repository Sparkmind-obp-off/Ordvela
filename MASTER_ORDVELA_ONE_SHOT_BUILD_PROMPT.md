# MASTER ONE-SHOT IMPLEMENTATION PROMPT — ORDVELA

You are the principal product engineer, systems architect, frontend engineer, backend engineer, database engineer, integration engineer, QA engineer, and deployment engineer responsible for turning the existing ORDVELA repository into a working product.

## 1. NON-NEGOTIABLE IDENTITY

Master brand: **ORDVELA**

Capability family: **Ordvela Intelligence**

Repository: **Sparkmind-obp-off/Ordvela**

Do not create:
- another repository
- another master brand
- another product codename
- another domain
- a parallel architecture

Technical module names are allowed when useful. They are not new brands.

The governing principle is:

**LOCK THE FUNCTION. FLEX THE NAME.**

---

## 2. PRODUCT MISSION

Build ORDVELA as a demand-to-revenue operating system for an operator.

The core loop is:

**REAL DEMAND → OPPORTUNITY → SCORE → EXECUTION → DEMO → DISTRIBUTION → HUMAN APPROVAL → OUTCOME → REVENUE → FEEDBACK**

Operational shorthand:

**FIND → BUILD → SHOW → SELL → LEARN**

ORDVELA must help an operator discover real demand, identify commercially meaningful opportunities, create a relevant solution, produce a demo, prepare an evidence-based commercial contact, record the result, and learn from the outcome.

This is NOT a generic CRM, scraper, chatbot, social-monitoring dashboard, website builder, mass-outreach bot, or speculative platform.

---

## 3. READ THE REPOSITORY FIRST

Before changing code:

1. Inspect the full repository tree.
2. Inspect package manifests and lockfiles.
3. Inspect existing source code.
4. Inspect frontend routes/components.
5. Inspect backend/API routes.
6. Inspect workers.
7. Inspect migrations/schema.
8. Inspect integrations/connectors.
9. Inspect configuration and deployment files.
10. Inspect tests and CI.
11. Read the relevant docs in `docs/`, especially:
   - 01_SYSTEM_CHARTER.md
   - 02_PRODUCT_REQUIREMENTS.md
   - 20_INTELLIGENCE_PRODUCT_VISION.md
   - 21_REVENUE_LOOP_SYSTEM_ARCHITECTURE.md
   - 22_INTELLIGENCE_LAYER.md
   - 23_EXECUTION_LAYER.md
   - 24_DISTRIBUTION_LAYER.md
   - 25_OPPORTUNITY_DATA_MODEL.md
   - 26_PROVIDER_AND_BYOK_ARCHITECTURE.md
   - 27_COMMERCIAL_MODEL.md
   - 28_SECURITY_AND_TRUST.md
   - 29_REVENUE_LOOP_ROADMAP.md
   - 30_OPERATING_SOP.md
   - 31_IMPLEMENTATION_BASELINE.md
   - 41_FRONTEND_UX_ARCHITECTURE.md
   - 42_USER_AND_CUSTOMER_JOURNEY.md
   - 43_DASHBOARD_INFORMATION_ARCHITECTURE.md
   - 44_BACKEND_API_ARCHITECTURE.md
   - 45_DATABASE_AND_DATA_ARCHITECTURE.md
   - 46_INTEGRATION_ARCHITECTURE.md
   - 47_AUTH_WORKSPACE_AND_PERMISSIONS.md
   - 48_JOB_QUEUE_WORKFLOW_ARCHITECTURE.md
   - 49_ERROR_HANDLING_AND_RESILIENCE.md
   - 50_CONFIGURATION_AND_ENVIRONMENT.md
   - 51_END_TO_END_SYSTEM_MAP.md
   - 52_FRONTEND_BACKEND_ACCEPTANCE_MATRIX.md
   - 33_API_CONTRACTS.md
   - 34_SCORING_MODEL.md
   - 35_SOURCE_ADAPTER_SPEC.md
   - 36_EXECUTION_TEMPLATE_SPEC.md
   - 37_OBSERVABILITY_AND_AUDIT.md
   - 38_DEPLOYMENT_AND_OPERATIONS.md
   - 39_TEST_STRATEGY.md
   - 40_GOVERNANCE_AND_CHANGE_CONTROL.md

Do not blindly rebuild existing working functionality.

Classify what you find:
- IMPLEMENTED
- PARTIAL
- DOCUMENTED ONLY
- MISSING
- BROKEN

Then implement the highest-value missing pieces.

---

## 4. EXECUTION MODEL

Execute the build as one coordinated program with these phases:

### Phase 0
Repository and architecture audit.

### Phase 1
Foundation and application shell.

### Phase 2
Auth, workspace, permissions, security.

### Phase 3
Database and domain model.

### Phase 4
Intelligence / FIND.

### Phase 5
Opportunity review workspace.

### Phase 6
Execution / BUILD.

### Phase 7
Deployment and DEMO / SHOW.

### Phase 8
Distribution / SELL.

### Phase 9
Outcomes, revenue and feedback / LEARN.

### Phase 10
Providers, BYOK, usage and integrations.

### Phase 11
Jobs, resilience and observability.

### Phase 12
UX quality and responsive operator cockpit.

### Phase 13
End-to-end validation.

### Phase 14
Production hardening and release.

### Phase 15
Commercial readiness.

Do not stop after documentation or scaffolding.

---

## 5. FRONTEND REQUIREMENTS

Build a real operator cockpit.

Primary navigation:

- Demand Feed
- Opportunities
- Execution
- Distribution
- Outcomes
- Settings

### Demand Feed

Must show real persisted opportunities with:
- score
- problem
- desired outcome
- evidence
- source
- urgency
- commercial signal
- confidence
- recommended action

Must support:
- loading
- empty
- error
- populated
- filtering
- selection

### Opportunity Detail

Must show:
- original evidence
- evidence timeline where available
- extracted demand
- score breakdown
- confidence
- commercial signals
- recommendation
- decision controls
- next action

Evidence must be one click away.

### Execution

Must show:
- selected opportunity
- solution recommendation
- blueprint
- build/generation state
- validation
- deployment state
- demo URL
- artifacts

### Distribution

Must show:
- target context
- evidence summary
- demo preview/link
- generated message
- approval gate
- contact state
- follow-up

External contact must require explicit human approval in V0.

### Outcomes

Must show:
- pipeline state
- contact/reply/qualification/proposal/won/lost
- revenue
- loss reason
- feedback
- learning signals

### Settings

Must expose appropriate non-secret configuration:
- workspace
- providers
- BYOK/configuration state
- usage
- integrations
- permissions
- environment/health where appropriate

Never display raw secrets.

UX principles:
- progressive disclosure
- one obvious next action
- no fake metrics
- no decorative dead-end controls
- clear async states
- confirmation for external/destructive actions
- responsive/mobile usable
- calm, precise operator-cockpit feel

---

## 6. BACKEND REQUIREMENTS

Use a clean boundary:

**CLIENT → API → CORE SERVICES → ADAPTERS / DATABASE / JOBS**

API domains should cover as needed:
- auth
- workspaces
- sources
- signals
- opportunities
- executions
- distributions
- outcomes
- usage
- providers
- health

API requirements:
- validate inputs
- authorize workspace
- attach request IDs
- persist state transitions
- never expose secrets
- return stable error envelopes
- use async jobs for generation/deployment/long operations

Do not keep long-running AI/build/deployment work inside long HTTP requests.

---

## 7. DATABASE REQUIREMENTS

Implement durable relational state for:

- workspaces
- workspace_members
- providers
- sources
- signals
- opportunities
- opportunity_scores
- executions
- execution_artifacts
- distributions
- outcomes
- usage_events
- audit_events
- jobs
- settings

Rules:
- workspace scoped
- raw evidence preserved
- derived intelligence separated
- score versions retained
- external IDs namespaced
- commercial outcomes explicit
- appropriate indexes
- reproducible migrations
- safe deletion/retention behavior

Do not use fake in-memory persistence for the critical path.

---

## 8. INTELLIGENCE REQUIREMENTS

Implement:

**COLLECT → DEDUPLICATE → NORMALIZE → EXTRACT DEMAND → VERIFY EVIDENCE → CLASSIFY INTENT → ESTIMATE COMMERCIAL SIGNAL → SCORE → RANK**

An opportunity is more than a lead.

The system must preserve:
- source
- reference
- author/account where public
- timestamp
- raw text/snippet
- context
- problem
- desired outcome
- urgency
- intent
- budget signal
- geography when relevant
- confidence
- score explanation

Strong signals include:
- explicit need
- active request
- specific problem
- time pressure
- budget evidence
- meaningful consequence
- willingness to evaluate

Do not fabricate evidence.

---

## 9. EXECUTION REQUIREMENTS

For a selected opportunity:

**OPPORTUNITY → SOLUTION RECOMMENDATION → BLUEPRINT → BUILD/GENERATE → VALIDATE → DEPLOY → DEMO**

Blueprint must include:
- opportunity ID
- problem
- target outcome
- solution
- features
- constraints
- assumptions
- stack
- deployment target
- acceptance criteria

Prefer constrained templates and deterministic workflows over unrestricted autonomous coding.

The resulting artifact must be inspectable.

---

## 10. DISTRIBUTION REQUIREMENTS

Use:

**DEMO → TARGET → MESSAGE DRAFT → HUMAN REVIEW → CONTACT → FOLLOW-UP → OUTCOME**

Message generation must use actual evidence.

Do not:
- fabricate personalization
- make unsupported claims
- impersonate
- spam
- mass-contact automatically

V0 prepares the commercial action; the human approves external contact.

---

## 11. PROVIDER & BYOK REQUIREMENTS

Core business logic must not directly depend on vendor SDKs.

Use adapter interfaces for:
- source/search
- extraction
- LLM
- deployment
- messaging
- infrastructure

Provider lifecycle:

**DISCOVER → CONFIGURE → VALIDATE → ENABLE → RUN → OBSERVE → ROTATE/DISABLE**

BYOK:
- server-side only
- never client-side
- never log raw keys
- support rotation/revocation
- attribute usage/provider
- normalize provider failures

If a preferred provider is unavailable, preserve the abstraction and use the simplest compatible implementation available.

---

## 12. AUTHORIZATION & SECURITY

Implement:
- authentication
- workspace membership
- OWNER / OPERATOR / VIEWER
- workspace-scoped authorization
- actor attribution
- audit trail

Never trust browser-provided workspace IDs without server authorization.

Sensitive operations require elevated permission and/or confirmation:
- credential changes
- deployment
- external contact approval
- workspace deletion

Never commit secrets.

Never expose private source data through public demos.

---

## 13. JOBS & RESILIENCE

Async work must use durable jobs where appropriate.

Job lifecycle:

**QUEUED → RUNNING → SUCCEEDED / FAILED / CANCELLED**

Support:
- idempotency
- bounded retries
- exponential backoff
- cancellation
- dead-letter visibility
- provider timeout handling
- normalized errors

Error categories:
- VALIDATION
- AUTHENTICATION
- AUTHORIZATION
- NOT_FOUND
- CONFLICT
- PROVIDER
- RATE_LIMIT
- TIMEOUT
- INTERNAL

Every failure must be visible.

Never convert an unknown external result into success.

---

## 14. OBSERVABILITY

Track:
- request IDs
- job IDs
- workspace
- actor
- provider
- operation
- latency where useful
- failure reason
- audit event
- commercial state transition

Audit:
- ingestion
- opportunity creation
- score changes
- execution
- deployment
- message generation
- approval
- outcomes

Do not log secrets or unnecessary sensitive data.

---

## 15. GOLDEN PATH — ABSOLUTE ACCEPTANCE TEST

You must prove this path:

1. ingest one real public demand signal;
2. preserve its evidence;
3. normalize it;
4. deduplicate it;
5. extract demand;
6. classify intent;
7. score it;
8. create an opportunity;
9. display it in Demand Feed;
10. open Opportunity Detail;
11. inspect evidence;
12. select opportunity;
13. create execution;
14. generate blueprint;
15. build/generate artifact;
16. validate artifact;
17. deploy;
18. open demo;
19. generate evidence-based message;
20. human approves;
21. record contact;
22. record outcome;
23. record revenue if applicable;
24. feed outcome back into learning.

This is the primary definition of a working ORDVELA implementation.

---

## 16. TESTING

Run all available tests.

Add missing tests for:
- domain logic
- scoring
- API contracts
- database persistence
- authorization
- provider adapters
- job lifecycle
- retries
- error states
- frontend state transitions
- responsive smoke behavior
- golden-path E2E

Do not stop at a passing TypeScript/build command if the application behavior is not proven.

If external credentials are unavailable:
- implement the adapter;
- create deterministic test doubles;
- prove the adapter contract;
- clearly mark real-provider execution as blocked;
- never fake a production success.

---

## 17. PRODUCTION READINESS

Verify:
- production environment config
- migrations
- secrets
- provider health
- job processing
- API health
- frontend build
- deployment
- smoke tests
- rollback path
- monitoring/observability

Do not claim production-ready unless evidence exists.

---

## 18. IMPLEMENTATION PRIORITY

If constraints appear, preserve:

**FIND → OPPORTUNITY → BUILD → DEMO → SELL → OUTCOME**

Secondary features must not block the golden path.

Do not spend the majority of the build on:
- cosmetic polish
- speculative abstractions
- unused enterprise features
- complex billing
- marketplace
- autonomous outreach
- broad integrations without immediate value

---

## 19. COMMERCIAL READINESS

Implement internal foundations for:
- usage accounting
- workspace boundaries
- provider attribution
- feature flags
- outcome/revenue metrics
- future subscriptions/credits/API

Do not build a huge billing platform before product value is proven.

---

## 20. DOCUMENTATION SYNCHRONIZATION

After implementation:
- update implementation status documentation;
- record what actually works;
- record partial/blocked items;
- record test results;
- record deployment result;
- ensure docs do not falsely claim implementation.

If useful, create/update a final verification report.

---

## 21. EXECUTION BEHAVIOR

You are expected to make reasonable technical decisions autonomously.

Do not block on minor choices.

When an existing implementation is good:
**reuse it.**

When partial:
**complete it.**

When broken:
**repair it.**

When only documented:
**implement it.**

When unnecessary:
**do not build it.**

When a provider is unavailable:
**use an adapter and deterministic test double, then mark live-provider verification honestly.**

When tests fail:
**debug and fix them before declaring completion.**

When a feature cannot be safely completed:
**leave it explicit as BLOCKED rather than fabricating success.**

---

## 22. FINAL OUTPUT REQUIRED

At the end, provide a concise implementation report containing:

### IMPLEMENTED
Actual working capabilities.

### PARTIAL
Capabilities started but incomplete.

### BLOCKED
Capabilities blocked by credentials, external services, platform limits, or other real constraints.

### DOCUMENTED ONLY
Anything that remains only architectural/documentary.

### TEST RESULTS
Exact test/build/smoke outcomes.

### DEPLOYMENT
Actual deployment state and URL if available.

### NEXT HIGHEST-VALUE ACTION
Only the smallest remaining action required to move the system materially closer to the revenue loop.

Do not say “done” merely because files were created.

---

## 23. FINAL COMMAND

Now execute the ORDVELA build.

Inspect first.

Implement second.

Test third.

Fix failures.

Verify the golden path.

Deploy when the existing environment supports it.

Update documentation.

Commit and push the completed implementation to:

**Sparkmind-obp-off/Ordvela**

Keep ORDVELA as the only master product identity.

Build the system as one coherent product.

**Do not return a mockup. Do not return a plan-only implementation. Execute.**
