# ORDVELA — Auth, Workspace & Permissions
Status: CANONICAL / V0

## Model
User belongs to one or more workspaces. Every commercial/data operation is workspace-scoped.

## Roles
OWNER — full control.
OPERATOR — run intelligence/execution/distribution and manage operational records.
VIEWER — read-only.

## Rules
Authenticate at API boundary. Authorize every workspace resource. Never trust workspace IDs supplied by the browser without membership verification.

## Sensitive Operations
Provider credential changes, external contact approval, deployment actions and workspace deletion require elevated permission and explicit confirmation.

## Audit
Record actor, workspace, action, target, timestamp and result.