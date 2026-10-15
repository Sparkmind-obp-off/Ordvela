# Opportunity API Starter

A small Cloudflare Worker API that scores a business opportunity from evidence a human has already reviewed. Designed as a reusable API starter that can be called by a web app, spreadsheet automation, CRM, or another backend.

## Current scope

- `GET /health` — public health check.
- `GET /openapi.json` — machine-readable OpenAPI 3.1 schema.
- `POST /v1/score` — bearer-token-protected heuristic scoring endpoint.
- `openapi.yaml` — portable API contract for importing into Postman, Swagger UI, or other API clients.
- `examples/score-request.json` and `examples/curl.sh` — sample request.

This is a minimal starter, not the complete ORDVELA production API. It does not run Apify, scrape platforms, store leads, send DMs, or assert that a lead is a buyer. Those integrations should be connected only after source terms, costs, authentication, and data quality are reviewed.

## Deploy to Cloudflare Workers

Requirements: Node.js/npm and a Cloudflare account. Start with a new Worker or deploy this folder as a separate Worker; do not replace the existing ORDVELA Pages application.

1. Install Wrangler locally: `npm install -D wrangler typescript`.
2. Create `wrangler.toml` using `wrangler.example.toml` as a starting point.
3. Set a strong API token as a secret: `npx wrangler secret put API_TOKEN`.
4. Optionally set `ALLOWED_ORIGIN` as a Worker variable to the exact frontend origin. The default is `*`; restrict it for browser-facing deployments.
5. Deploy: `npx wrangler deploy`.
6. Check `GET https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/health`.

Never commit API tokens or put them in frontend JavaScript. Apply Cloudflare rate limiting before public launch; this starter does not include persistent per-key quotas or billing.

## Call the API

```bash
curl -X POST "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/v1/score" \
  -H "Authorization: Bearer $OPPORTUNITY_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data @examples/score-request.json
```

Example response:

```json
{
  "businessName": "Contoh usaha",
  "sourceUrl": "https://example.com",
  "score": 60,
  "priority": "high",
  "reasons": [
    "No website observed: a simple web presence may be useful.",
    "No digital catalog observed: a mobile-friendly catalog may be useful.",
    "1 public pain signal(s) supplied for human review."
  ],
  "disclaimer": "Heuristic triage only. Verify source evidence and contact permission; this is not a claim that the business will buy."
}
```

Scores are a transparent triage heuristic: missing website +20, missing catalog +20, each public pain signal +10 (up to 3), recent buying intent +30, contact channel available +10, capped at 100. Priority is high >=60, medium >=30, otherwise low. This is a starting rule, not a validated prediction model.

## Request fields

| Field | Type | Required | Meaning |
|---|---|---:|---|
| businessName | string | yes | Public business name, max 160 chars |
| sourceUrl | URL string | no | Original public evidence or business page |
| hasWebsite | boolean | no | Whether a website was observed |
| hasDigitalCatalog | boolean | no | Whether a digital catalog was observed |
| publicPainSignals | integer 0–3 | no | Number of public problem signals reviewed |
| recentBuyingIntent | boolean | no | Human-reviewed recent intent signal |
| contactChannelAvailable | boolean | no | A legitimate business contact channel is available |
| notes | string | no | Short human note; max 1,000 chars |

## Security and responsible use

- Use public business information and only collect data for a legitimate purpose.
- Do not scrape private accounts or bypass access controls.
- Do not use this API for bulk unsolicited messaging. Contact prospects individually, follow each platform's rules, and honor opt-outs.
- Treat the score as a prioritization hint. Review original evidence and recency before acting.
- Configure a strong token, origin restrictions, rate limits, and monitoring before offering a public API.
- No API key, Apify token, or customer data belongs in this repository.

## Roadmap (not yet implemented)

1. Durable D1 lead records with workspace isolation.
2. Apify connector with approved Actor registry, explicit spend caps, and provenance.
3. Community-post signal ingestion with platform-specific policy gates.
4. API key management, per-customer quotas, usage metering, and billing.
5. Human-reviewed message drafts; no automatic sending by default.
6. Contract tests, security review, and monitored production deployment.
