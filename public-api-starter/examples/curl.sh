#!/usr/bin/env sh
set -eu
: "${OPPORTUNITY_API_URL:?Set OPPORTUNITY_API_URL, e.g. https://your-worker.workers.dev}"
: "${OPPORTUNITY_API_TOKEN:?Set OPPORTUNITY_API_TOKEN to the server-issued token}"

curl --fail-with-body --silent --show-error \
  -X POST "${OPPORTUNITY_API_URL%/}/v1/score" \
  -H "Authorization: Bearer ${OPPORTUNITY_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data @examples/score-request.json
