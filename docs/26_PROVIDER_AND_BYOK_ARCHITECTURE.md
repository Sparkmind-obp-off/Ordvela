# ORDVELA INTELLIGENCE — Provider and BYOK Architecture
Status: V0 CANONICAL

## Principle
Core logic must not depend on one vendor.

## Adapter Contracts
SearchProvider, SourceProvider, ExtractionProvider, LLMProvider, DeploymentProvider, MessagingProvider.

## LLM Capabilities
classify, extract, summarize, score, recommend, generate_solution, generate_message.

## BYOK
Workspace credentials are securely stored server-side; raw secrets are never logged. Support rotation, revocation, provider attribution and usage accounting.

## Hosted Mode
Workspace → Provider Gateway → Selected Provider.

## Cost Control
Deduplicate, cache, budget-check, use economical models for routine classification/extraction and stronger models for high-value execution.

## Failure States
PENDING, RUNNING, SUCCEEDED, FAILED, RETRYABLE, CANCELLED.