# ORDVELA — Frontend / Backend Acceptance Matrix
Status: RELEASE GATE

| Journey | Frontend proof | Backend proof | Data proof |
|---|---|---|---|
| Discover | feed renders real evidence | source ingestion works | signal persisted |
| Review | opportunity detail + score explanation | scoring endpoint works | score version stored |
| Select | clear CTA/state | authorized transition | status persisted |
| Build | blueprint/build progress | job orchestration works | execution/artifact stored |
| Demo | reachable URL | deployment verified | deployment state stored |
| Distribute | message + approval gate | approval enforced | distribution state stored |
| Contact | handoff state | no unauthorized send | contact timestamp stored |
| Outcome | outcome UI | outcome API works | outcome queryable |
| Learn | feedback visible | metrics/aggregation works | historical records preserved |

## Final Gate
No feature is complete until UI state, API behavior, persistence and failure behavior agree.