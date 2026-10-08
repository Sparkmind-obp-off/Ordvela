# ORDVELA — Integration Architecture
Status: CANONICAL / V0

## Adapter Boundary
Core never calls vendor SDKs directly. Connectors implement stable interfaces.

## Integration Families
Sources: web/search/social/community/job providers.
AI: LLM/extraction/scoring providers.
Execution: code/template/build/deployment providers.
Distribution: messaging/contact providers.
Infrastructure: database, object storage, logging and scheduling.

## Integration Lifecycle
DISCOVER → CONFIGURE → VALIDATE → ENABLE → RUN → OBSERVE → ROTATE/DISABLE.

## Credential Rules
Credentials are server-side references. UI can show configured/invalid/expired status but never raw secrets.

## Failure Isolation
One provider failure must not corrupt core state. Adapters return normalized errors and retryability.

## V0
Prefer manual/human-triggered integration runs where automation is not reliable yet.