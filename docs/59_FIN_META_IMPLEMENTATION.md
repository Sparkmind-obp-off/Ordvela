# ORDVELA FIN — Meta Demand Intelligence

Date: 2026-10-08
Runtime increment: 0.3.0
Status: IMPLEMENTED / REGRESSION VERIFIED / LIVE META ACCESS BLOCKED
Release deployment: LIVE on https://ordvela.pages.dev, BYOK Pages, runtime code commit `5ec9203`; verified immutable deployment https://245cd6a8.ordvela.pages.dev. Report 58 records production checks.

## 1. Audit and implementation

Existing repository `Sparkmind-obp-off/Ordvela`, branch `main`, retained. Upstream Meta changes through `d0aa82e` were audited before modification. No new brand, repository, custom domain or parallel architecture. ORDVELA is the master brand; Ordvela Intelligence is the capability.

The audit found unconditional credential decryption breaking uncredentialed HN/GitHub ingestion; stale Graph version hardcoding; invalid/NaN/fractional collection limits; insufficient permalink/timestamp checks; unpublished Page-feed exposure; missing Facebook/Instagram settings and FIN modes; and one opportunity being created for every collected post.

Implemented within existing adapters, registry, API, jobs, core and six-screen cockpit:

- HN/GitHub no longer decrypt nonexistent credentials. Public live HN regression rerun successfully.
- Isolated `META_GRAPH_VERSION = v26.0`. Threads remains the separately documented v1.0 API.
- Integer 1–25 Meta limit, enforced in API and adapter and applied locally to response arrays. One API page only; paging.next is never followed.
- Tokens in Authorization headers, never endpoint query strings. Worker-compatible `redirect: manual`; every 3xx rejected without fetching Location. An initial `redirect: error` attempt failed in workerd, was corrected, and the full golden path rerun.
- Exact official HTTPS host allowlists; userinfo/ports/untrusted hosts rejected. Instagram/Threads post paths validated. Tracking query parameters removed; necessary Facebook post IDs retained.
- Namespaced IDs, valid publication timestamps, preserved exact bounded raw text, normalized text, source metadata, retrieval timestamps and content hashes.
- Facebook accepts only `is_published === true` and nonempty messages. Unpublished or unknown-publication records never enter FIN.
- Separate safe AUTHENTICATION, PERMISSION, RATE_LIMIT, TIMEOUT and PROVIDER errors; no raw vendor errors or secret values returned/logged. Permission failures surface as BLOCKED_PERMISSION.
- Provider configuration accepts exactly manifest credential fields; token and numeric asset IDs are AES-GCM encrypted in workspace D1. Saving/rotation disables the provider, resets validation and requires successful validation before enabling. OWNER-only configuration/lifecycle; workspace isolation preserved.
- Password-type empty credential inputs plus required asset field for Facebook/Instagram. No stored secrets are populated or saved to browser storage.
- FIN lists discovery adapters with disabled unavailable-provider options, provider-specific query/reference/feed controls, bounded Meta limit, durable job results and latest-100 evidence review including qualification reasons and quotes.

## 2. Official capabilities and credentials

| Provider | Supported mode | Runtime credential fields | Official endpoint |
|---|---|---|---|
| Threads | Keyword search; public coverage depends on app approval | `access_token` (Threads USER token) | `https://graph.threads.com/v1.0/keyword_search` |
| Facebook Pages | Authorized published Page feed, not keyword search | `access_token` (Page token), `page_id` | `https://graph.facebook.com/v26.0/{page_id}/feed` |
| Instagram Professional | Authorized media/captions using Facebook Login, not keyword search | `access_token` (Facebook Login token), `ig_user_id` | `https://graph.facebook.com/v26.0/{ig_user_id}/media` |

Threads scopes: threads_basic and threads_keyword_search. Unapproved keyword-search access may be limited to the authenticated user's posts; endpoint success alone does not prove public-search approval. Official cap is 2,200 nonempty queries per rolling 24h per user across apps.

Facebook feed access requires the applicable Page permissions, roles and app access; checklist includes pages_read_engagement and pages_read_user_content for user-generated Page-feed content. A permission appearing granted in /me/permissions does not prove feed access or app review. Instagram Facebook Login checklist includes instagram_basic, pages_read_engagement and pages_show_list for authorized asset discovery; actual linked Professional-account access must be verified. Instagram Login is a different auth surface and is not silently treated as Facebook Login.

App IDs/App Secrets are not user/Page access tokens and are never inferred to be Page or IG User IDs. No OAuth exchange/refresh or publishing permissions are implemented or claimed.

## 3. Demand qualification without score replacement

Pipeline:

REAL SOURCE → COLLECT → NORMALIZE / DEDUP → PRESERVE SIGNAL → DEMAND GATE → OPPORTUNITY → EXISTING SCORE → HUMAN REVIEW

`meta-demand-gate-v1` applies to new Threads/Facebook/Instagram records. It requires an explicit supported English/Indonesian request plus software/tool/app/workflow/system context, rejects selected promotion/negated-request patterns, and stores its classification, reason, exact matched source quotes and `score_modified: false` in signal metadata.

Non-demand Meta posts are retained as signals with NO_QUALIFIED_DEMAND; no opportunity or score row is created. A qualified result is a DEMAND_HYPOTHESIS_REQUIRES_HUMAN_REVIEW, never a verified buyer. Gate reasons are NO_EXPLICIT_REQUEST, NO_SUPPORTED_SOLUTION_CONTEXT, PROMOTION_OR_NEGATED_REQUEST or EXPLICIT_REQUEST_AND_SUPPORTED_CONTEXT.

The existing `rules-v1.0` weights, extractor and historical scores are unchanged. Legacy HN/GitHub ingestion behavior is retained, not silently reclassified. The Meta gate is intentionally conservative and can have false positives/negatives; multilingual semantic classification, entity clustering and manual promotion of a rejected signal are not implemented. No old signals or scores are rewritten.

Deduplication covers signals without opportunities as well as qualified ones, by external ID or normalized-content fingerprint. Repeated non-demand posts do not grow the evidence store. Job results report accepted evidence, newly stored signals, duplicates, newly created opportunities, no-opportunity records and per-record gate explanations. Workspace budgets remain 60 jobs/hour, 500 opportunities, and an admission cap of 5,000 signals. No billing/zero-cost claims are inferred from operation counts.

## 4. Actual supplied-credential results

The latest uploaded material was privately parsed; only labels and safe statuses were printed. Three token candidates were tested read-only, not guessed from their labels/prefixes.

| Check | Observed result |
|---|---|
| Each candidate on Facebook /v26.0/me | HTTP 200, identity endpoint accessible |
| Each candidate on Threads /v1.0/me | HTTP 401, Meta error 190; not a usable Threads token |
| Authorized Facebook /me/accounts | Four Pages visible |
| Derived authorized Page token, bounded feed read for each Page | HTTP 400, Meta error 10 for all four; PERMISSION blocked |
| Linked instagram_business_account from authorized Pages | Zero linked accounts found; IG User ID not available on this selected auth surface |
| ORDVELA local and isolated production QA encrypted configure + validation job using supplied token | Threads AUTH_ERROR, enabled false |
| ORDVELA local and isolated production QA encrypted configure + validation job using each derived Page token | Facebook BLOCKED_PERMISSION, enabled false |
| Credential cleanup | All temporary local/production QA provider credentials revoked after checks; production QA workspace archived |
| Production operator credential import/enable | Not performed: no operator-selected Page/workspace and no passing Meta validation; isolated production QA validation only |
| Real Meta evidence / opportunities / scores created | 0 / 0 / 0 |

No valid IG asset was invented or App ID used as its substitute. These results do not establish that no Instagram account exists elsewhere, only that none was returned through the authorized Page linkage checked. Since Facebook identity succeeds but feed fails, this is not reported as an expired-token diagnosis. Exact missing app/asset permission must be resolved in Meta's console, not guessed.

## 5. Regression verification

- Build and TypeScript: PASS.
- Unit/contracts/D1/API fixtures: 37/37 PASS.
- Extended local real-source API golden path: recorded 320 assertions PASS.
- Desktop/mobile browser, generator, provider credential UI and FIN modes: 42 checks PASS, no unexpected page errors; 1440×1000 / 390×844.
- Full production golden path: 77 checks PASS; authenticated read-only production operator browser: 14 checks PASS; production health HTTP 200, v0.3.0, database ready. Separate production Meta QA reproduced one AUTH_ERROR and four BLOCKED_PERMISSION results, all disabled; credentials revoked and QA workspace archived.
- Synthetic Meta API proof: two preserved records, one demand-qualified opportunity and one non-demand signal; repeat ingestion adds zero signals. This is labelled contract evidence, not live Meta ingestion success.
- Credentials, untrusted URLs, invalid limits, unpublished posts, invalid timestamps/IDs, permission/auth/rate/network failures, redirect rejection, rotation/revocation and public-source regression covered.

No successful Meta ingestion is claimed merely because contract fixtures or compilation pass.

## 6. Operator next steps and boundaries

1. Rotate the exposed tokens/App Secrets in the official Meta console.
2. Obtain an actual Threads USER token with threads_basic / threads_keyword_search and verify approval/coverage.
3. Choose the intended authorized Facebook Page, fix read access/app review/Page role, then save its Page token and Page ID in Settings. Four Pages were visible; ORDVELA did not silently pick one for production.
4. Link/authorize an Instagram Professional account on the implemented Facebook Login surface and obtain its actual IG User ID, or separately commission an Instagram Login adapter with its own reviewed auth contract.
5. Configure → Validate → Enable only on successful checks → run limit 1–5 → inspect original evidence/gate reasoning → make a human decision.

External contact = NO. Posting/reply/DM = NO. Secret committed = NO (tracked files and dist scanned before release). No scraping, cookie/CAPTCHA bypass, private-account discovery, arbitrary credentialed URL fetch, automatic outreach or fabricated revenue. Execution/Daytona expansion is outside this increment.

Official references reviewed:
- https://developers.facebook.com/documentation/threads/keyword-search
- https://developers.facebook.com/docs/graph-api/reference/page/feed/
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/reference/ig-user/media/
- https://developers.facebook.com/docs/pages-api/getting-started/
