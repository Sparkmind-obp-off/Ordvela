export interface Env {
  API_TOKEN: string;
  ALLOWED_ORIGIN?: string;
}

type ScoreRequest = {
  businessName: string;
  sourceUrl?: string;
  hasWebsite?: boolean;
  hasDigitalCatalog?: boolean;
  publicPainSignals?: number;
  recentBuyingIntent?: boolean;
  contactChannelAvailable?: boolean;
  notes?: string;
};

const json = (data: unknown, status = 200, origin = "*") =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "Authorization,Content-Type",
      "x-content-type-options": "nosniff",
    },
  });

function scoreLead(input: ScoreRequest) {
  const reasons: string[] = [];
  let score = 0;

  if (input.hasWebsite === false) {
    score += 20;
    reasons.push("No website observed: a simple web presence may be useful.");
  }
  if (input.hasDigitalCatalog === false) {
    score += 20;
    reasons.push("No digital catalog observed: a mobile-friendly catalog may be useful.");
  }
  const pain = Math.max(0, Math.min(3, Math.floor(input.publicPainSignals ?? 0)));
  score += pain * 10;
  if (pain) reasons.push(`${pain} public pain signal(s) supplied for human review.`);
  if (input.recentBuyingIntent) {
    score += 30;
    reasons.push("Recent buying intent was flagged; verify the original public evidence.");
  }
  if (input.contactChannelAvailable) {
    score += 10;
    reasons.push("A business contact channel is available.");
  }

  score = Math.min(100, score);
  const priority = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  return {
    businessName: input.businessName.trim(),
    sourceUrl: input.sourceUrl ?? null,
    score,
    priority,
    reasons,
    disclaimer: "Heuristic triage only. Verify source evidence and contact permission; this is not a claim that the business will buy.",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN || "*";
    if (request.method === "OPTIONS") return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "Authorization,Content-Type",
        "access-control-max-age": "86400",
      },
    });

    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "opportunity-api-starter", version: "0.1.0" }, 200, origin);
    }

    if (url.pathname === "/openapi.json" && request.method === "GET") {
      return json({
        openapi: "3.1.0",
        info: { title: "Opportunity API Starter", version: "0.1.0" },
        paths: {
          "/health": { get: { summary: "Health check", responses: { "200": { description: "Healthy" } } } },
          "/v1/score": { post: {
            summary: "Score one business opportunity",
            security: [{ bearerAuth: [] }],
            requestBody: { required: true, content: { "application/json": { schema: { "$ref": "#/components/schemas/ScoreRequest" } } } },
            responses: { "200": { description: "Scored opportunity" }, "400": { description: "Invalid input" }, "401": { description: "Unauthorized" } }
          } }
        },
        components: {
          securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
          schemas: {
            ScoreRequest: {
              type: "object", required: ["businessName"],
              properties: {
                businessName: { type: "string", minLength: 1, maxLength: 160 },
                sourceUrl: { type: "string", format: "uri", maxLength: 2048 },
                hasWebsite: { type: "boolean" },
                hasDigitalCatalog: { type: "boolean" },
                publicPainSignals: { type: "integer", minimum: 0, maximum: 3 },
                recentBuyingIntent: { type: "boolean" },
                contactChannelAvailable: { type: "boolean" },
                notes: { type: "string", maxLength: 1000 }
              }
            }
          }
        }
      }, 200, origin);
    }

    if (url.pathname === "/v1/score" && request.method === "POST") {
      if (!env.API_TOKEN) return json({ error: "server_not_configured" }, 503, origin);
      const auth = request.headers.get("authorization") || "";
      if (auth !== `Bearer ${env.API_TOKEN}`) return json({ error: "unauthorized" }, 401, origin);

      let body: ScoreRequest;
      try { body = await request.json() as ScoreRequest; }
      catch { return json({ error: "invalid_json" }, 400, origin); }

      if (!body || typeof body.businessName !== "string" ||
          !body.businessName.trim() || body.businessName.length > 160) {
        return json({ error: "businessName_required_max_160_chars" }, 400, origin);
      }
      if (body.sourceUrl && (body.sourceUrl.length > 2048 || !/^https?:\/\//i.test(body.sourceUrl))) {
        return json({ error: "sourceUrl_must_be_http_url" }, 400, origin);
      }
      if (body.notes && body.notes.length > 1000) return json({ error: "notes_too_long" }, 400, origin);
      if (body.publicPainSignals !== undefined &&
          (!Number.isInteger(body.publicPainSignals) || body.publicPainSignals < 0 || body.publicPainSignals > 3)) {
        return json({ error: "publicPainSignals_must_be_integer_0_to_3" }, 400, origin);
      }
      return json(scoreLead(body), 200, origin);
    }

    return json({ error: "not_found", available: ["/health", "/openapi.json", "POST /v1/score"] }, 404, origin);
  },
};
