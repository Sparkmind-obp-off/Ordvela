# ORDVELA INTELLIGENCE — Product Vision
Status: LOCKED FOR EXECUTION
Date: 2026-10-08

## Position
Ordvela Intelligence is the demand-to-revenue capability within ORDVELA. It is not a separate master brand.

## Core Loop
REAL DEMAND → OPPORTUNITY → SCORE → EXECUTION → DEMO → DISTRIBUTION → DEAL → REVENUE

## Three Technical Layers
1. Intelligence — discover, verify, classify and score real demand.
2. Execution — turn a qualified opportunity into a solution, prototype and deployable demo.
3. Distribution — prepare a relevant final message, require human approval, contact the target and record outcomes.

## Principles
- Demand before build.
- Evidence before interpretation.
- Opportunity before lead volume.
- Demo before generic pitch.
- Human approval before external contact.
- Commercial readiness without premature complexity.
- Technical naming only until independent product demand proves otherwise.

## Non-Goals
Not a generic CRM, scraper, chatbot, social monitor, mass-outreach bot, generic website builder or speculative platform.

## Success
The system is successful when real opportunities repeatedly become conversations, deals and revenue.

## Community & Demand Discovery — canonical concept

ORDVELA Intelligence explicitly includes Community & Demand Discovery as a capability of the Intelligence layer. It is not a separate product or brand.

Canonical flow:

**COMMUNITY DISCOVERY → COLLECT → NORMALIZE → DETECT DEMAND → QUALIFY → SCORE → OPPORTUNITY**

Source classes include social platforms, communities, video/discussion APIs, RSS/public forums and licensed external data providers.

### Source hierarchy
1. Free / official / permissioned — preferred starting point.
2. Official but restricted — use when access and approval are available.
3. Paid official APIs — enable when measured signal quality justifies cost.
4. External aggregators — optional adapters for coverage gaps; never the system of record.

### Meta decision
Meta is **SOFT-HOLD / ACCESS-RECOVERY**, not abandoned. Keep Threads, Facebook Pages and Instagram adapters implemented and tested. Do not make Meta a prerequisite for broader Community & Demand Discovery. Perform one controlled recovery attempt when valid app/user/page/account credentials are available. Do not guess scopes, tokens or undocumented workarounds. If Meta remains blocked, leave it disabled and continue with other providers.

Current Meta state:
**IMPLEMENTED → ACCESS BLOCKED → RECOVERY OPTIONAL → NOT A CRITICAL-PATH DEPENDENCY**

### Commercial rule
Measure:
**SOURCE COST → SIGNAL QUALITY → QUALIFIED DEMAND → OPPORTUNITY QUALITY → REVENUE**

A paid source is justified when its incremental commercial value exceeds its API and operational cost.