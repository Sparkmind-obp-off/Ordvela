# Manhunter — Provider & BYOK Architecture

Status: V0 SPEC
Date: 2026-10-08

## Principle
Provider-independent core, provider-specific adapters.

## Adapter Categories
SearchProvider, ExtractionProvider, LLMProvider, DeploymentProvider and MessagingProvider.

## LLM Capability Contract
Core requests capabilities, not vendor-specific calls:
classify, extract, summarize, score, recommend, generate_solution and generate_message.

## BYOK
A workspace may configure its own provider credential where appropriate.

Requirements:
- encrypted/secure secret storage
- server-side access only
- no raw keys in logs
- redacted provider errors
- key rotation/revocation
- provider and usage tracking without exposing secrets

## Hosted Provider
Future managed mode:
Workspace → Ordvela Provider Gateway → Selected Provider

Usage must be metered.

## Cost Control
Check workspace allowance and operation budget before expensive operations. Prefer caching, deduplication and cheap models for extraction/classification; reserve stronger models for high-value execution.

## Failure States
PENDING, RUNNING, SUCCEEDED, FAILED, RETRYABLE, CANCELLED.
