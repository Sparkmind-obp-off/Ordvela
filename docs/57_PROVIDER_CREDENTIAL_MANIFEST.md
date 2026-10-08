# ORDVELA — Provider Credential Manifest

## Current runtime mapping — 2026-10-08
Production managed secrets: CREDENTIAL_MASTER_KEY and REGISTRATION_TOKEN. No secret values are committed. Public registration is disabled; invitations are secret-gated. Optional provider credentials are accepted only through Settings/authorized API and encrypted inside the workspace D1 provider record. The OPENAI_API_KEY/GROQ_API_KEY and broader discovery names below are architectural placeholders, not environment variables consumed automatically by this release.

Actual provider fields: Groq api_key + optional public model; OpenAI api_key (models validation only); Threads access_token (USER token, not app secret). Threads scopes: threads_basic + threads_keyword_search; public search requires Meta permission approval. See official https://developers.facebook.com/documentation/threads/get-started and https://developers.facebook.com/documentation/threads/keyword-search. App IDs/secrets were not used as user access tokens. Exposed credentials must be rotated, then entered in the secure provider form, never chat. Full OAuth callback/refresh is not yet implemented, so no redirect URI is advertised as working.

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
