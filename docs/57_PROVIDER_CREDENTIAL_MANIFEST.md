# ORDVELA — Provider Credential Manifest

## Current runtime mapping — 2026-10-08
Production managed secrets: CREDENTIAL_MASTER_KEY and REGISTRATION_TOKEN. No secret values are committed. Public registration is disabled; invitations are secret-gated. Optional provider credentials are accepted only through Settings/authorized API and encrypted inside the workspace D1 provider record. The OPENAI_API_KEY/GROQ_API_KEY and broader discovery names below are architectural placeholders, not environment variables consumed automatically by this release.

Actual provider fields: Groq api_key + optional public model; OpenAI api_key (models validation only); Threads access_token (USER token, not app secret); Facebook Pages access_token + page_id; Instagram access_token + ig_user_id. Threads scopes: threads_basic + threads_keyword_search; public search requires Meta permission approval. See official https://developers.facebook.com/documentation/threads/get-started and https://developers.facebook.com/documentation/threads/keyword-search. App IDs/secrets were not used as user access tokens. Exposed credentials must be rotated, then entered in the secure provider form, never chat. Full OAuth callback/refresh is not yet implemented, so no redirect URI is advertised as working.

## FIN Meta v0.3 credential contract and observed access

- Facebook Pages: Page access_token + numeric page_id; published feed only; Graph v26.0. Checklist pages_read_engagement and pages_read_user_content as applicable; app approval/Page role still required.
- Instagram Professional: Facebook Login access_token + numeric ig_user_id; authorized linked media/captions only, Graph v26.0. Checklist instagram_basic, pages_read_engagement, pages_show_list. Instagram Login tokens are a different unsupported auth surface here.
- Threads: genuine Threads USER access_token; v1.0 keyword endpoint; threads_basic + threads_keyword_search. A Facebook token, even if /me succeeds on Facebook, does not establish Threads access.
- Settings now has all three forms, a password-type empty token input and conditional required asset field. Exactly manifest fields accepted. Values encrypted together; registry never returns token/asset credential values; transport uses Authorization, not access_token URL parameters. Redirects are rejected.
- Latest uploaded candidates were actually tested privately. Three Facebook identity checks succeeded, all Threads checks failed with code 190, four Page feeds failed with code 10, and no linked IG asset returned. Local encrypted validation reproduced AUTH_ERROR/BLOCKED_PERMISSION then credentials were revoked. No successful production credential import/enable is claimed. See report 59.
- Root encryption/invitation secrets were not rotated/replaced by this increment; existing encrypted histories remain decryptable. Rotate the exposed external Meta tokens/App Secrets in Meta before routine operation; pick the intended Page/workspace explicitly.

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
- Threads access_token
- Facebook Pages access_token + page_id
- Instagram access_token + ig_user_id
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
