# ORDVELA — MASTER BUILD ROADMAP

## Status
**Decision:** LOCKED FOR ONE-SHOT IMPLEMENTATION  
**Master brand:** ORDVELA  
**Capability:** Ordvela Intelligence  
**Repository:** Sparkmind-obp-off/Ordvela  
**Primary objective:** turn the documented revenue-loop architecture into a working, testable, deployable operator system.

## Build philosophy

ORDVELA is not being built as a collection of pages, mock dashboards, generic CRM features, or disconnected AI demos.

The implementation must produce one coherent operating loop:

**REAL DEMAND → OPPORTUNITY → SCORE → EXECUTION → DEMO → DISTRIBUTION → HUMAN APPROVAL → OUTCOME → REVENUE → FEEDBACK**

Operational shorthand:

**FIND → BUILD → SHOW → SELL → LEARN**

The implementation is allowed to make reasonable technical decisions without blocking for minor choices. Preserve the architecture and product intent; choose the simplest production-sensible implementation available in the existing repository.

---

# PHASE 0 — REPOSITORY & ARCHITECTURE AUDIT

### Goal
Understand what is already implemented before changing it.

### Work
- Inspect repository tree.
- Inspect package manifests and lockfiles.
- Inspect existing frontend, backend, workers, API routes, components, utilities and migrations.
- Inspect deployment configuration.
- Inspect environment examples.
- Inspect existing tests and CI.
- Compare implementation against docs 01–52.
- Classify every relevant capability:
  - IMPLEMENTED
  - PARTIAL
  - DOCUMENTED ONLY
  - MISSING
  - BROKEN
- Preserve working code.
- Remove obsolete/duplicate implementation only when verified.

### Exit gate
A concrete implementation gap matrix exists internally or in a build report. No major implementation decision is made from documentation alone.

---

# PHASE 1 — FOUNDATION & APPLICATION SHELL

### Goal
Create a stable application foundation.

### Work
- Establish clean project structure.
- Establish frontend application shell.
- Establish backend/API entrypoint.
- Establish shared types/contracts.
- Establish environment/config loading.
- Establish logging and request IDs.
- Establish error envelope.
- Establish health endpoint.
- Establish basic responsive layout.
- Establish navigation:
  - Demand Feed
  - Opportunities
  - Execution
  - Distribution
  - Outcomes
  - Settings
- Establish loading, empty, error and success states.
- Ensure navigation is functional, not decorative.

### Exit gate
The app boots, routes work, API health works, and frontend/backend boundaries are stable.

---

# PHASE 2 — AUTH, WORKSPACE & SECURITY FOUNDATION

### Goal
Make ORDVELA a real multi-user/workspace system rather than a local mock.

### Work
- Authentication appropriate to the existing stack.
- Workspace creation/selection.
- Workspace membership.
- Roles:
  - OWNER
  - OPERATOR
  - VIEWER
- Workspace-scoped authorization.
- Server-side secret handling.
- Safe session/token handling.
- Request actor attribution.
- Audit event foundation.
- Permission gates for sensitive actions.
- Never trust browser-supplied workspace authorization.

### Exit gate
Two logical users/workspaces cannot accidentally read or mutate each other's commercial data.

---

# PHASE 3 — DATABASE & DOMAIN MODEL

### Goal
Turn the documented data model into durable operational state.

### Work
Implement relational schema and migrations for the core entities:

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

### Rules
- Raw evidence is preserved.
- Derived intelligence is separate.
- Scores are versioned.
- External IDs are namespaced.
- Commercial outcomes are not silently overwritten.
- Workspace isolation is enforced.
- Appropriate indexes are created.
- Soft deletion is preferred where appropriate.
- Timestamps and lifecycle states are explicit.

### Exit gate
A clean migration path exists and the core revenue-loop entities can be created, queried and transitioned without mock persistence.

---

# PHASE 4 — INTELLIGENCE / FIND

### Goal
Make real demand discovery operational.

### Work
Implement:

**COLLECT → DEDUPLICATE → NORMALIZE → EXTRACT DEMAND → VERIFY EVIDENCE → CLASSIFY INTENT → ESTIMATE COMMERCIAL SIGNAL → SCORE → RANK**

Build:
- source abstraction
- source configuration
- ingestion service
- normalization
- deduplication
- evidence preservation
- demand extraction
- intent classification
- commercial-signal extraction
- scoring engine
- explainable score breakdown
- opportunity candidate creation
- ranked Demand Feed

### Evidence requirements
Every opportunity must retain enough evidence to answer:
- Where did this come from?
- What was actually said?
- When?
- Who/source?
- What problem exists?
- What outcome is wanted?
- How urgent is it?
- Is there budget/commercial evidence?
- Why is the system ranking it?

### Exit gate
A real public signal can become a persisted, explainable opportunity candidate.

---

## Phase 4 provider expansion gate

Community & Demand Discovery is part of FIND, not a separate product. Provider rollout should proceed by evidence and friction:

**Reddit → YouTube → Discord → RSS/forums → additional official sources → X when economics justify → Meta recovery when access is available → external aggregators when coverage economics justify.**

Meta must not block Phase 4 progress. Each provider is measured by qualified-demand yield and downstream opportunity/revenue, not raw record volume.

# PHASE 5 — OPPORTUNITY WORKSPACE / REVIEW

### Goal
Give the operator a decision surface, not a lead spreadsheet.

### Work
Build:
- ranked opportunity feed
- filters
- opportunity detail
- evidence timeline
- score explanation
- confidence
- commercial signal
- recommended next action
- decision state
- notes
- selection controls
- status transitions

Operator decision path:

**DISCOVER → VERIFY → SELECT / REJECT / DEFER**

### Exit gate
An operator can inspect an opportunity, verify its evidence, understand why it scored highly, and explicitly select it for execution.

---

# PHASE 6 — EXECUTION / BUILD

### Goal
Turn selected demand into a relevant solution.

### Work
Implement:

**OPPORTUNITY → SOLUTION RECOMMENDATION → BLUEPRINT → BUILD/GENERATE → VALIDATE**

Build:
- execution records
- solution recommendation
- blueprint generation
- constrained templates
- generation/build orchestration
- validation
- artifact tracking
- job status
- retry handling
- failure visibility

Blueprint must capture:
- opportunity ID
- problem
- target outcome
- proposed solution
- features
- constraints
- assumptions
- stack
- deployment target
- acceptance criteria

Prefer constrained, repeatable templates over unrestricted autonomous coding.

### Exit gate
A selected opportunity produces a concrete, inspectable solution artifact rather than a text-only AI answer.

---

# PHASE 7 — DEPLOYMENT & DEMO / SHOW

### Goal
Produce a real demo that directly answers the observed demand.

### Work
Implement:
- deployment abstraction
- deployment job
- deployment status
- artifact/version tracking
- validation
- demo URL
- demo metadata
- safe demo isolation
- rollback/failure state

Demo requirements:
- directly addresses observed problem
- does not expose secrets
- does not expose private source data
- is inspectable by the operator
- has a clear acceptance state

### Exit gate
The system can move:

**SELECTED OPPORTUNITY → BUILD → VALIDATE → DEPLOY → DEMO URL**

---

# PHASE 8 — DISTRIBUTION / SELL

### Goal
Turn a demo into a relevant human-approved commercial contact.

### Work
Implement:

**DEMO → TARGET → MESSAGE DRAFT → HUMAN REVIEW → SEND/CONTACT → FOLLOW-UP**

Build:
- target context
- evidence summary
- demo preview
- message generation
- approval gate
- contact state
- follow-up scheduling/state
- distribution history

V0 rule:
**The system prepares; the human authorizes external contact.**

Do not implement autonomous mass outreach.

Avoid:
- generic pitches
- fake personalization
- deceptive claims
- pressure tactics
- spammy automation

### Exit gate
An operator can review a real opportunity, see the demo, review an evidence-based message, approve it, and record the contact state.

---

# PHASE 9 — OUTCOMES, REVENUE & FEEDBACK / LEARN

### Goal
Close the loop.

### Work
Implement outcome lifecycle:

**NEW → CONTACT_READY → CONTACTED → REPLIED → QUALIFIED → PROPOSAL → WON / LOST**

Support:
- follow-up
- notes
- proposal state
- revenue amount
- outcome timestamp
- loss reason
- feedback
- source quality feedback
- scoring feedback
- solution/template feedback
- conversion metrics

The system must distinguish:
- opportunity quality
- contact quality
- reply
- qualification
- proposal
- win
- actual revenue

### Exit gate
A commercial outcome can be recorded and fed back into intelligence and operational reporting.

---

# PHASE 10 — PROVIDERS, BYOK, USAGE & INTEGRATIONS

### Goal
Make the system provider-independent and commercially operable.

### Work
Implement stable interfaces/adapters for:
- search/source providers
- extraction providers
- LLM providers
- deployment providers
- messaging/contact providers
- database/object storage/infrastructure services

Implement:
- provider configuration
- validation
- enable/disable
- health status
- provider error normalization
- BYOK
- usage accounting
- provider attribution
- budget awareness
- secret rotation/revocation
- safe configuration UI

Core services must never depend directly on a vendor SDK.

### Exit gate
Providers can change without rewriting business logic, and secrets never reach the client or logs.

---

# PHASE 11 — JOBS, RESILIENCE & OBSERVABILITY

### Goal
Make asynchronous operations trustworthy.

### Work
Implement:
- job queue
- job persistence
- idempotency keys
- retry policy
- bounded exponential backoff
- cancellation
- dead-letter visibility
- provider timeout handling
- normalized error codes
- request IDs
- audit events
- operational health
- execution history

Job lifecycle:

**QUEUED → RUNNING → SUCCEEDED / FAILED / CANCELLED**

No silent success.

Unknown external outcomes must never be treated as successful.

### Exit gate
Failures are visible, retryable when appropriate, and recoverable without corrupting commercial state.

---

# PHASE 12 — POLISH, UX QUALITY & RESPONSIVE OPERATOR COCKPIT

### Goal
Make the working system genuinely usable.

### Work
Audit every screen:
- information hierarchy
- typography
- spacing
- responsive behavior
- mobile usability
- empty states
- loading states
- error states
- confirmation states
- destructive-action protection
- keyboard/accessibility basics
- evidence discoverability
- obvious next action

The interface should feel like an operator cockpit:
- calm
- precise
- dense enough for work
- not visually noisy
- not a generic analytics dashboard

Every important state must have one obvious next action.

### Exit gate
The full operator journey can be completed without dead ends or placeholder screens.

---

# PHASE 13 — END-TO-END VALIDATION

### Goal
Prove the system, not just individual modules.

### Mandatory golden path

1. Ingest one real public signal.
2. Preserve original evidence.
3. Normalize and deduplicate.
4. Extract demand.
5. Classify intent.
6. Score.
7. Create opportunity.
8. Display in Demand Feed.
9. Open Opportunity Detail.
10. Verify evidence.
11. Select opportunity.
12. Create execution.
13. Generate blueprint.
14. Build/generate solution.
15. Validate artifact.
16. Deploy.
17. Open demo.
18. Generate distribution message.
19. Human reviews and approves.
20. Record contact.
21. Record outcome.
22. Record revenue if applicable.
23. Feed outcome back into learning.

### Test classes
- unit tests
- API tests
- database/migration tests
- authorization tests
- integration adapter tests
- job lifecycle tests
- frontend interaction tests
- error-state tests
- responsive smoke tests
- end-to-end golden-path test

### Exit gate
The complete revenue loop works with real persistence and observable state transitions.

---

# PHASE 14 — PRODUCTION HARDENING & RELEASE

### Goal
Move from working system to controlled production.

### Work
- production environment validation
- migration verification
- secret verification
- provider health verification
- job processing verification
- observability verification
- performance smoke tests
- rate-limit checks
- security checks
- rollback plan
- deployment verification
- production smoke test
- documentation synchronization
- implementation status report

### Exit gate
Production deployment is reproducible, observable and rollback-capable.

---

# PHASE 15 — COMMERCIAL READINESS

### Goal
Prepare ORDVELA for actual value capture without prematurely building a giant billing platform.

### Work
Prepare:
- workspace boundaries
- usage accounting
- feature flags
- provider attribution
- commercial event tracking
- outcome/revenue metrics
- hooks for future subscriptions/credits/API
- usage limits
- plan-independent internal metering

Do NOT overbuild:
- complex billing
- enterprise administration
- marketplace
- broad automation
- autonomous mass outreach

Only add commercial complexity when validated demand justifies it.

### Exit gate
ORDVELA can measure the value it creates and has clean architectural hooks for monetization.

---

# FINAL DEFINITION OF DONE

ORDVELA is considered implementation-complete for this build only when all of the following are true:

- The application is real, not a mockup.
- Frontend routes connect to real backend behavior.
- Backend persists real domain state.
- Database migrations are reproducible.
- Workspace authorization is enforced.
- Secrets remain server-side.
- Provider integrations use adapters.
- Async jobs have explicit lifecycle.
- Errors are visible and actionable.
- Demand Feed contains evidence-backed opportunities.
- Opportunities can be selected.
- Selected opportunities can produce solution blueprints.
- A solution can be built/validated.
- A demo can be deployed and opened.
- A distribution message can be generated.
- External contact requires human approval in V0.
- Outcomes can be recorded.
- Revenue can be recorded.
- Feedback can flow back into the system.
- The golden path is tested.
- Production smoke testing is documented.
- No critical path depends on fake data.
- No critical screen is merely decorative.
- No major documented feature is falsely represented as implemented.

## Implementation priority

If time, provider availability, or tooling becomes constrained, preserve this order:

**FIND → OPPORTUNITY → BUILD → DEMO → SELL → OUTCOME**

Do not sacrifice the golden path to build secondary features.

## Non-goals for this one-shot build

Do not turn ORDVELA into:
- generic CRM
- generic scraper
- generic chatbot
- generic social media monitor
- website builder
- autonomous spam/outreach engine
- unrestricted coding agent
- speculative marketplace
- bloated enterprise platform
- collection of disconnected AI tools

## One-shot execution rule

The implementation agent must:
1. inspect before modifying;
2. reuse existing code where sound;
3. implement missing critical path;
4. run tests;
5. fix failures;
6. verify build;
7. verify routes/API/data integration;
8. report exactly what is IMPLEMENTED, PARTIAL, BLOCKED, or DOCUMENTED ONLY;
9. never claim production readiness without evidence;
10. commit/push completed work to the existing repository.

**No new repository. No new master brand. No new product codename.**

This roadmap is the execution contract for ORDVELA.
