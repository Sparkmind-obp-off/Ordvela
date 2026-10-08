# ORDVELA INTELLIGENCE — Source Adapter Specification
Status: V0 CANONICAL

## Contract
Each adapter provides source identity, status, fetch window, pagination/cursor, stable external ID where available, canonical URL, timestamp, public author/account, raw text and metadata.

## Initial Sources
Web search, Reddit, jobs/freelance demand, Threads, X, Instagram and Facebook.

## Rules
Preserve raw evidence. Normalize separately. Deduplicate before opportunity creation. Namespace external IDs by provider. Record capture time. Never claim certainty beyond source evidence.

## Boundary
Provider/platform availability and policy vary. Adapters must fail explicitly when a source cannot be supplied safely or technically. Source-specific logic must not leak into core scoring.