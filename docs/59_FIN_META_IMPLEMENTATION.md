# ORDVela FIN — Meta Demand Intelligence Implementation

Date: 2026-10-08
Status: IMPLEMENTED / CREDENTIAL-DEPENDENT

## Scope

FIN (Find Intelligence) is the demand-discovery layer of ORDVela:

REAL SOURCE → SIGNAL → NORMALIZED EVIDENCE → DEMAND EXTRACTION → OPPORTUNITY → SCORE → OPERATOR REVIEW

Meta is implemented as three independent discovery adapters:

- Threads — keyword search
- Facebook Pages — Page feed ingestion
- Instagram — professional-account media/captions ingestion

They share the same normalized evidence contract and opportunity engine. They do not write directly into the opportunity model.

## Provider boundary

Meta credentials stay encrypted in the workspace provider record.

Required configuration:

- Threads: `access_token`
- Facebook Pages: `access_token`, `page_id`
- Instagram: `access_token`, `ig_user_id`

No App Secret is accepted as an access token. No credential is logged, returned or stored in source.

Provider lifecycle remains:

CONFIGURE → VALIDATE → HEALTHY → ENABLE → INGEST

A provider cannot be enabled until validation succeeds.

## Collection boundary

### Threads

Keyword search is used for demand discovery. The returned record is mapped to:

`threads:<id>`

with permalink, author, timestamp and exact source text.

Public-search availability remains dependent on the Meta permissions/approval attached to the operator app. A successful authenticated-user query must not be interpreted as independent public coverage.

### Facebook Pages

FIN reads authorized Page feed records through the official Graph API surface configured by the provider adapter.

Each accepted record must contain an official HTTPS permalink. Posts without usable demand text are ignored.

External ID:

`facebook:<post-id>`

### Instagram

FIN reads authorized professional-account media/caption records through the official Graph API surface configured by the provider adapter.

Each accepted record must contain an official HTTPS permalink and textual caption.

External ID:

`instagram:<media-id>`

## What FIN does not do

- No scraping.
- No session-cookie extraction.
- No CAPTCHA or access-control bypass.
- No private-account discovery.
- No automatic posting, replying or outreach.
- No assumption that an App ID/App Secret equals user/page access.
- No fabricated buying intent.

## Evidence contract

All Meta records enter the same pipeline:

COLLECT → DEDUPLICATE → NORMALIZE → EXTRACT DEMAND → SCORE → OPPORTUNITY STORE

Raw text remains evidence. Derived fields remain explainable and versioned. Provider-specific response objects never become core opportunity fields.

## Current live boundary

The adapter code is implemented and production-safe to configure, but live Meta ingestion is credential/permission dependent.

Therefore:

- Threads: ADAPTER / NOT_CONFIGURED until authorized USER token is supplied and validated.
- Facebook: ADAPTER / NOT_CONFIGURED until valid Page access token + Page ID are supplied and validated.
- Instagram: ADAPTER / NOT_CONFIGURED until valid professional-account access token + IG User ID are supplied and validated.

The system must report the real provider state rather than claiming live coverage.

## Next FIN gate

1. Securely configure the Meta credentials through Settings → Providers.
2. Validate each provider independently.
3. Enable only providers whose validation succeeds.
4. Run controlled ingestion with small limits.
5. Inspect normalized evidence and opportunity quality.
6. Compare signal quality across Threads, Facebook and Instagram.
7. Only after evidence quality is proven, expand FIN to additional sources.

Execution/Daytona is deliberately outside this gate.
