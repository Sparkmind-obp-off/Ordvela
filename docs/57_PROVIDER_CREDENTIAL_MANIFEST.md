# ORDVELA — Provider Credential Manifest

## Credential Handling Rule

Never ask the operator to paste secrets into GitHub, source files, documentation, chat or a public prompt.

Genspark should render a setup checklist and direct the operator to enter secrets into the intended secure runtime/provider configuration surface.

## Setup Checklist

For each provider show:
- provider
- official developer console
- official API docs
- auth type
- client/app ID if required
- client secret if required
- API key if required
- access/refresh token if required
- account/page/user identifier if required
- scopes/permissions
- redirect URI if OAuth
- webhook secret if applicable
- API base URL
- environment
- rate limit
- cost/quota

## ORDVELA Runtime Secrets

Core:
- CREDENTIAL_MASTER_KEY — required for encrypted BYOK storage in production.

Optional AI:
- OPENAI_API_KEY
- GROQ_API_KEY

Discovery examples:
- REDDIT_CLIENT_ID
- REDDIT_CLIENT_SECRET
- REDDIT_REFRESH_TOKEN or approved OAuth credential
- X_CLIENT_ID
- X_CLIENT_SECRET
- X_ACCESS_TOKEN
- Threads/Meta credentials as officially required
- Facebook/Instagram/Meta credentials as officially required

These names are configuration placeholders. Genspark must confirm current official authentication requirements before implementation.

## Ownership

- Repository owner: Sparkmind-obp-off/Ordvela
- Production secret owner: operator-controlled deployment account/runtime
- Provider account owner: operator's own provider/developer account
- Application credentials: created in the operator's official developer console
- Genspark: implementation agent, not secret owner

## UI Requirement

Settings → Providers must show provider name, purpose, configured state, required credentials, official setup instructions, validation action, last validation, health state, and rotate/revoke action.

Never show the actual secret value after saving.

Missing credential = NOT_CONFIGURED.
Not implemented = PLANNED.
Official API unavailable = UNAVAILABLE.
