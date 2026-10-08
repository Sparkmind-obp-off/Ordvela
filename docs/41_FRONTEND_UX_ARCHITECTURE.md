# ORDVELA — Frontend & UX Architecture
Status: CANONICAL / V0

## UX Objective
The interface is an operator cockpit, not a generic analytics dashboard. Every primary screen moves the operator toward FIND → BUILD → SHOW → SELL.

## Primary Navigation
1. Demand Feed
2. Opportunities
3. Execution
4. Distribution
5. Outcomes
6. Settings

## Core Screens
### Demand Feed
Ranked opportunities, score, problem, evidence, source, urgency, commercial signal and recommended action.

### Opportunity Detail
Evidence timeline, source link, extracted demand, score breakdown, confidence, decision controls and next action.

### Execution
Selected opportunity, solution recommendation, blueprint, build status, validation, deployment and demo URL.

### Distribution
Target context, evidence, demo preview, generated message, approval gate, contact state and follow-up.

### Outcomes
Contacted, replied, qualified, proposal, won/lost, revenue and learning signals.

### Settings
Workspace, providers, BYOK, usage, integrations, permissions and environment status.

## UX Rules
- Progressive disclosure.
- Evidence always one click away.
- No fake metrics.
- Loading, empty, success, failed and retryable states for every async operation.
- Destructive/external actions require confirmation.
- Mobile responsive, desktop-first operator workflow.
- One obvious next action per state.