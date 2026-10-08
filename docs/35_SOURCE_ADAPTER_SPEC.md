# ORDVELA INTELLIGENCE — Source Adapter Specification
Status: V0 CANONICAL

## Adapter contract
Each source adapter should provide:
- source identity
- availability/status
- fetch window
- pagination/cursor
- stable external ID where available
- canonical URL
- timestamp
- author/account when public
- raw text
- metadata

## Initial source families
- Web search
- Reddit
- jobs/freelance demand
- Threads
- X
- Instagram
- Facebook

Availability and platform policy vary. Adapters must fail explicitly when a provider cannot legally or technically supply a source.

## Ingestion rules
- preserve raw evidence
- normalize text separately
- deduplicate before opportunity creation
- namespace external IDs by provider
- record capture time
- never claim certainty beyond source evidence

## Provider independence
No source-specific logic may leak into core scoring or opportunity state.
