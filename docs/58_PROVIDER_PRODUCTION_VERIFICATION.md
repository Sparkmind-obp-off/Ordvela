# ORDVELA — Provider Operating Layer & Production Verification
Date: 2026-10-08
Historical release below: 0.2.0 / V1 LIVE / V2 SELECTED PROVIDERS
Supersedes the deployment blocker in report 54 and earlier phase snapshots.

## FIN v0.3 verification addendum
Current FIN implementation and real supplied-token proof: report 59. Eleven implemented adapters/built-ins and seven planned entries; HN/GitHub credential regression repaired; Meta bounds, published filtering, safe transport/errors, settings UI and distinct demand qualification implemented. Local results: 37 tests, 320 API assertions and 42 browser checks PASS; build/typecheck PASS. Actual Meta: Facebook identity accessible but four Page feeds permission-blocked (10); all supplied candidates rejected by Threads (190); no linked IG asset returned. No successful real Meta evidence/opportunities/scores: 0/0/0. Temporary local encrypted QA credentials revoked; no operator production Meta import/enable. BYOK v0.3 LIVE: code commit `5ec9203`, https://245cd6a8.ordvela.pages.dev and stable https://ordvela.pages.dev. Production health HTTP 200, DB ready, v0.3.0. Production golden path 77 checks PASS; authenticated operator browser 14 checks PASS, zero page errors. Separate isolated production Meta QA: supplied Threads token AUTH_ERROR, four derived Page tokens BLOCKED_PERMISSION, all disabled. Encrypted credentials revoked, QA workspace archived; no Meta evidence/opportunity created and no operator credentials installed. npm audit: zero vulnerabilities; secret scan: zero supplied/runtime secret matches across tracked files and dist. Local API assertion counts depend on polling: recorded 320, final run 312, both PASS. No external contact, posting, reply or DM. Runtime roots and history retained. No secret/root rotation or DB schema change in this increment.

## Apify v0.4 production verification
Detailed implementation and actual Actor/build/pricing matrix: report 61. Existing BYOK stable https://ordvela.pages.dev and final diagnostics deployment https://9ee897d9.ordvela.pages.dev. Production health 0.4.0, D1 ready; additive migration 0003 applied after private backup. Managed APIFY_API_TOKEN validated read-only through deployed provider job; operator provider HEALTHY/ENABLED, not authorization to spend. Eight disabled/unreviewed Actor metadata bindings; zero paid runs, zero live Apify evidence/opportunities and zero terms approvals. YouTube candidate requires 1024 MB, exceeding fixed 256 MB policy; gate correctly returns DOCUMENTATION_REQUIRED. Reddit candidate BLOCKED_COMPLIANCE. Other seven source profiles remain metadata-only. No readiness fabricated from Store discovery or mock output.

Local: 51 tests, 312 API assertions and 48 browser checks PASS; typecheck/build PASS. Production: initial 77/final 79 golden-path checks (polling-dependent), 14 authenticated desktop/mobile browser checks after Actor population, 107 Apify setup checks and 67 final resource checks PASS. QA contact/revenue simulated only; QA archived/demo revoked. Secret scan 115 current files/dist, zero matches; earlier 181 history blobs, zero matches. No external contact/post/reply/DM. GitHub push blocked by rejected authentication despite setup tool success; commits saved locally, restore authorization before pushing. No alternate repository or project created.

## Historical v0.2 verification (not latest Meta proof)
The counts, token-absence observation, immutable URLs and rollback below describe the earlier v0.2 run, not the newest upload. Any upstream-added Facebook/Instagram statements below are superseded by the actually tested report 59.

## IMPLEMENTED
- Existing V0 revenue loop preserved, not replaced. Remote GitHub additions through `7f2c85f` audited and fast-forwarded before implementation.
- Central versioned Provider Registry in `src/providers.ts`: 18 entries, nine implemented adapters/built-ins and nine honest documentation-required entries. Capabilities, auth/credential names, official setup/docs links, scopes, rate-limit guidance, configuration, health/errors, validation/check timestamps, enabled state and usage are exposed without secret values.
- D1 provider lifecycle: configure/rotate disables credentialed adapter; validate/health use durable jobs; enabling requires healthy validation in the last 24h; disable blocks future ingestion; revoke removes ciphertext; config revision guards prevent old checks re-enabling rotated credentials. Existing uncredentialed HN/GitHub defaults preserved. API enforces OWNER for credential/lifecycle changes.
- Provider Generator emits six inspectable persisted artifacts: manifest, write-only credential schema, bounded adapter scaffold, explicit fixture placeholder, scaffold contract tests, setup documentation. Missing official implementation remains DOCUMENTATION_REQUIRED. No generated code is executed, arbitrary host is fetched, or provider automatically activated.
- Normalized evidence contracts include provenance, namespaced IDs, timestamps, raw reference, hash, body/title and explicit unknown language/engagement values. Source-specific metadata is separated from core opportunity fields.
- Groq adapter: models and requested-model validation, JSON assessment, exact evidence span references, constrained template, mandatory human-review hypothesis label, usage tokens, persistent assessments and job attribution. Evidence sharing requires explicit operator confirmation. Historical scores are untouched.
- Threads adapter: officially documented keyword endpoint, scopes/checklist, safe source mapping and deterministic fixtures. No posting/reply/send API implemented. No App Secret masquerading as user token. Facebook Pages and Instagram professional-account discovery adapters are also implemented with strict normalized evidence/permalink checks; live use remains credential/permission dependent.
- Production D1 provisioned with real UUID; both migrations applied. Pages BYOK project `ordvela` deployed on main. Fresh encryption root and registration invitation secret configured as Cloudflare secrets; exposed user credentials not installed. Public registration disabled; private operator account provisioned and private onboarding file kept outside git.
- Password change endpoint revokes all sessions. Soft workspace archive preserves history, cancels queued jobs and removes public demo access through workspace checks; exact name and OWNER confirmation required.
- Five real HN starter candidates ingested through the production API into ORDVELA operator workspace. None selected/contacted; zero genuine revenue recorded. Human review is required to qualify them.

## PARTIAL
- Generator is an implementation-structure generator, not autonomous creation of verified vendor integration code. Fixtures are explicit placeholders unless an actual reviewed adapter provides fixtures.
- OpenAI adapter only validates credentials/models. No OpenAI key or generation execution supplied/proven.
- Groq was tested live outside persisted production credential storage; it is NOT_CONFIGURED for the production operator until a newly rotated key is saved, validated and enabled. Initial available-model inspection showed the old Llama default was unavailable; default switched to officially documented and actually available `openai/gpt-oss-20b`.
- A live response initially paraphrased a quote; it was correctly rejected. The protocol now selects source span IDs, and the adapter materializes exact original quotes. Subsequent live assessment passed; it does not claim that all model conclusions are facts.
- Jobs remain request-driven durable work, not independently running queues or cron. AI daily recorded-token limit is a coarse bound, not concurrent credit reservation/billing.
- Customer solutions remain constrained prototypes, not unrestricted bespoke applications. Safe immutable demo publication is inside the ORDVELA app, not provisioning a separate customer application.
- Full OAuth authorization callbacks, refresh/reauthorization, account recovery/email verification/MFA, automated retention/load testing and external alerting remain incomplete.

## BLOCKED
- Threads user access token was not present in supplied app-ID/app-secret material. `threads_basic` and `threads_keyword_search` access/approval have not been demonstrated. App Secret rotation is required after chat exposure. Threads remains NOT_CONFIGURED, not live-validated.
- Groq supplied credential/model access and an actual grounded assessment passed via Node fetch, but the exposed key was intentionally not persisted to production. Rotate and securely configure a new key before enabling production AI. An initial Python HTTP request returned 403; the actual runtime-compatible Node adapter/model calls subsequently returned 200 and passed. No false AUTH_ERROR claim remains.
- Broad third-party providers need specific official API selection, credentials, access plan and permissions; no speculative APIs implemented.

## DOCUMENTED ONLY
Reddit, Web/Search, X, Jobs/Freelance, Email, WhatsApp and independent Cloudflare Workers job scheduling remain registry/checklist entries, not live connectors. Facebook Pages and Instagram now have runtime adapters but remain NOT_CONFIGURED until valid Meta credentials/permissions are supplied. Automated outreach, billing/credits, full customer-app deployment, unrestricted autonomous coding, automatic score retraining and enterprise controls are deliberately deferred. CI execution remains unimplemented; tests were actually executed in sandbox and production smoke environments.

## Exact observed verification
| Check | Result |
|---|---|
| TypeScript | PASS |
| Production bundle | PASS, ~107 kB uncompressed |
| Unit/contracts/D1/lifecycle | 27/27 PASS |
| Extended API golden path | 245 assertions PASS in recorded run |
| Desktop/mobile browser golden path + generator UI | 30 checks PASS, zero unexpected browser errors |
| Production golden-path smoke | 77 checks PASS |
| Production authenticated read-only operator browser | 14 checks PASS; 1440×1000 and 390×844 |
| npm audit | 0 vulnerabilities |
| Remote initial migration | 26 commands successful |
| Remote provider migration | 16 commands successful |
| Production health | HTTP 200; DB ready; production; v0.2.0 |
| Session safety | HttpOnly + Secure + SameSite=Strict verified |
| Unauthenticated protected API | HTTP 401 |
| Registration without invitation | HTTP 403 |
| Live Groq model validation | PASS for openai/gpt-oss-20b |
| Live grounded assessment | PASS; 1 exact quote; 264 input / 159 output tokens in recorded call |
| Compatible production rollback | PASS; previous revision health 200 |
| Restore current deployment | PASS; v0.2.0 health 200, no schema downgrade |

Polling-dependent assertion totals can increase with network latency. No production readiness claim is inferred merely from build success.

## Golden path and data boundary
Public original demand for deterministic proof: https://news.ycombinator.com/item?id=36717102, published 2023-07-13. It is genuine historical demand, not verified current buying intent.

Production smoke exercised ingestion → immutable evidence → normalized opportunity → historical score → selected opportunity → blueprint → build → validation → public sandboxed artifact → evidence-based draft → approval gate → QA manual-contact record → simulated reply/qualification/proposal/win → QA minor-unit revenue → feedback. It never contacted the source author or sent any external message. The isolated QA workspace was soft archived at the end; its public demo returns 404. QA records are retained as history and are not the operator workspace's commercial results.

The operator workspace contains five actual source candidates only. No fabricated customer contacts or revenue were placed there.

## Official source references used
- HN API: https://hn.algolia.com/api
- GitHub issues: https://docs.github.com/en/rest/issues/issues#get-an-issue
- Groq reference: https://console.groq.com/docs/api-reference
- Groq models/auth: https://console.groq.com/docs/models
- Threads get started: https://developers.facebook.com/documentation/threads/get-started
- Threads keyword/scopes: https://developers.facebook.com/documentation/threads/keyword-search
- Cloudflare rollback: https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/deployments/methods/rollback/

Current Meta docs use `https://graph.threads.com/v1.0/keyword_search` and explicitly state that unapproved keyword-search apps search only authenticated-user posts. Do not claim public permission approval from a successful restricted-user query. Official user cap: 2,200 nonempty keyword queries per rolling 24h across apps.

## Production / rollback
Stable URL: https://ordvela.pages.dev
Verified code deployment: https://a8d3de15.ordvela.pages.dev (code commit `403f72e`). Earlier compatible code deployment: https://f7f71b14.ordvela.pages.dev (`9d33b9a`). Deployment history contains actual immutable versions; final documentation commit may redeploy the same runtime bundle.

Rollback was exercised from current to the previous compatible reviewed production deployment using the official Pages rollback API, health verified, then the current revision restored. Commercial history/schema were not rolled back or deleted. Future schema changes require D1 backup and append-only compatible migrations.

## Security / operator access
No third-party credentials, encryption roots, invitation secrets, passwords or sessions in source/client/log output. Uploaded files were inspected without echoing values. Encryption roots are generated independently for local/production. Private access file is ignored and delivered through authenticated file sharing, not pasted secrets. Operator should change the temporary password immediately in Settings. Rotate exposed Meta/Groq keys before configuration. Never put App Secret into Threads `access_token` input.

## Next highest-value action
Change the operator temporary password; rotate the exposed Groq key and save it securely in Settings → Providers → Groq → Validate → Enable. For Threads, separately obtain an authorized USER access token with the documented permissions and confirm the Meta access scope. No further D1 slot is required.
