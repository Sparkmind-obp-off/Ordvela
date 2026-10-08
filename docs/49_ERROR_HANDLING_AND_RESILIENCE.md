# ORDVELA — Error Handling & Resilience
Status: CANONICAL / V0

## Error Classes
VALIDATION, AUTHENTICATION, AUTHORIZATION, NOT_FOUND, CONFLICT, PROVIDER, RATE_LIMIT, TIMEOUT, INTERNAL.

## API Error Contract
Every failure returns stable code, safe message, retryable flag and request ID.

## UX
Errors explain what happened and the next safe action. Retryable work gets a Retry control. Failed external actions remain visibly failed until resolved.

## Provider Resilience
Timeouts, bounded retries, circuit protection where useful, normalized provider errors and fallback only when semantics remain valid.

## Data Integrity
Persist state transitions transactionally where possible. Never convert an unknown provider result into success.