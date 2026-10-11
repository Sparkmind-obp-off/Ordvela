# ORDVELA Command Center — Acceptance Test Matrix

**Status:** Required verification matrix; tests must be implemented/executed before release  
**Date:** 2026-10-11

This matrix defines expected behavior. A row is not marked PASS until a test was actually run and its result recorded.

| ID | Area | Scenario | Expected result |
|---|---|---|---|
| AC-01 | Regression | Existing intelligence feed loads | Existing production behavior preserved |
| AC-02 | Regression | Existing opportunity scoring | Rules and score semantics unchanged |
| AC-03 | Auth | Unauthenticated request to protected API | Rejected without data disclosure |
| AC-04 | Workspace | User references another workspace's record ID | Denied; no record data returned |
| AC-05 | Roles | VIEWER attempts restricted mutation | Denied server-side |
| AC-06 | Chat | Authenticated user creates conversation | Persisted with correct workspace/owner |
| AC-07 | Chat | User reloads and opens history | Authorized history restored |
| AC-08 | Chat | Provider credential absent | Explicit unavailable/error state; no mock substitution |
| AC-09 | Provider | Real provider returns valid answer | Answer and sanitized usage metadata persisted |
| AC-10 | Provider | Provider timeout or invalid response | Safe actionable error; no secret/stack leak |
| AC-11 | Secrets | Secret-like input appears in a request/error | Redacted from logs and response where applicable |
| AC-12 | Context | Assistant reads opportunity and linked evidence | Only authorized records returned; references resolvable |
| AC-13 | Evidence | Model inference presented as fact | Response format/validation distinguishes synthesis and unknowns |
| AC-14 | Tools | Unknown tool ID submitted | Rejected before execution |
| AC-15 | Tools | Invalid tool arguments submitted | Schema validation rejects request |
| AC-16 | Approval | Unapproved plan submitted to executor | No tool invocation |
| AC-17 | Approval | Plan changes after approval | Prior approval invalidated |
| AC-18 | Approval | Approval action submitted | State becomes approved; execution does not start automatically |
| AC-19 | Quota | Quota exhausted | No provider/tool call is made |
| AC-20 | Cost | Paid action with unknown cost or no authorization | Blocked |
| AC-21 | Runtime | Duplicate submission of same idempotent run | No duplicate side effect |
| AC-22 | Runtime | Non-idempotent tool fails | No automatic retry |
| AC-23 | Runtime | Cancellation requested | State accurately reflects requested/confirmed status |
| AC-24 | Runtime | One step fails in multi-step plan | Partial/failure state lists exact completed steps |
| AC-25 | Injection | Retrieved content instructs agent to reveal secret | Treated as untrusted data; policy unchanged |
| AC-26 | Connector | Provider is only discovered/configured | UI does not label it live/validated |
| AC-27 | Connector | Live validation returns unusable schema | Provider remains disabled |
| AC-28 | Data | Migration runs on representative database | Existing records/routes remain valid |
| AC-29 | Audit | Agent run completes | Actor, plan version, tool, decision, timestamps, and outcome recorded |
| AC-30 | Logging | Tool error includes sensitive provider content | Stored/logged error is sanitized |
| AC-31 | UI | Mobile approval review | Inputs, permissions, risk, and decision controls remain usable |
| AC-32 | UI | Disabled/unimplemented module opened | Clear unavailable state; no false success |
| AC-33 | Outcome | Test/fixture run appears in outcome summary | Excluded or explicitly labeled as test data |
| AC-34 | Release | Production deployment requested before gates pass | Release blocked |
| AC-35 | Release | Production smoke after authorized release | Exact version, migration state, and checks recorded |

## Test evidence template

For each execution, record:
- date/time and environment;
- commit SHA;
- test command or browser scenario;
- pass/fail count and failures;
- whether provider calls were mocked or live;
- whether paid usage occurred;
- migration/deployment version;
- remaining blockers.

## Release blocker policy

Any failure in authorization, workspace isolation, secret handling, approval enforcement, quota/cost limits, or migration safety is a release blocker. A documentation checkbox alone is not evidence. Production readiness requires actual observed results.
