# ORDVELA Command Center — Decision Log

**Status:** Accepted decisions and implementation constraints  
**Date:** 2026-10-11

## DEC-001 — ORDVELA remains canonical
**Decision:** Keep `Sparkmind-obp-off/Ordvela` and the existing ORDVELA product as the canonical repository and product.  
**Reason:** Existing intelligence workflows, production deployment, data model, provider bridges, authorization, quotas, and approval controls are valuable assets.  
**Implication:** AI-Workspace is a reference implementation, not a replacement product or production source of truth.

## DEC-002 — Hybrid command center
**Decision:** Combine the intelligence dashboard, AI Workspace, and controlled agent execution in one application.  
**Reason:** Dashboard gives situational awareness; AI Workspace supports investigation and planning; agent runtime turns approved plans into controlled actions.  
**Implication:** Shared identity, workspace data, record references, provider gateway, quotas, and audit history.

## DEC-003 — Dashboard and AI Workspace remain distinct surfaces
**Decision:** Do not collapse the entire product into a chat UI or turn the dashboard into a decorative shell around AI.  
**Reason:** Structured operational visibility and conversational problem-solving solve different jobs.  
**Implication:** Global navigation exposes both surfaces, with contextual links between records and conversations.

## DEC-004 — Human-controlled execution
**Decision:** Use Plan → Validate → Preview → Approve → Execute → Verify → Record.  
**Reason:** Model outputs are untrusted and external/internal mutations can create security, cost, or reputational risk.  
**Implication:** Approval never triggers execution automatically; material plan changes invalidate approval.

## DEC-005 — Free-first provider strategy
**Decision:** Start with one real provider and prove the shared adapter before expanding.  
**Reason:** Avoid unnecessary complexity and paid usage before user value is demonstrated.  
**Implication:** Groq/Gemini are candidates; neither should be described as live until actual validation proves it.

## DEC-006 — Preserve production resources
**Decision:** Reuse current ORDVELA Cloudflare/D1 architecture where suitable; use additive migrations and feature flags.  
**Reason:** Minimize regression and avoid resource duplication.  
**Implication:** No production changes until checks pass and release is explicitly authorized.

## DEC-007 — No unapproved CI or paid infrastructure
**Decision:** Do not add GitHub Actions/CI or paid infrastructure without explicit user approval.  
**Reason:** Preserve the user's deployment and budget constraints.  
**Implication:** Document and use the existing validated workflow.

## DEC-008 — Truthful integration status
**Decision:** Distinguish discovered, configured, validated, enabled, live, blocked, and disabled states.  
**Reason:** Code presence, credentials, fixtures, and deployment do not prove operational provider capability.  
**Implication:** Status labels and reports must be supported by observed evidence.

## DEC-009 — Documentation precedes implementation expansion
**Decision:** Define product, UX, runtime, security, connector, roadmap, and acceptance contracts before broad implementation.  
**Reason:** Prevent incompatible assumptions and uncontrolled feature growth.  
**Implication:** These documents guide an audit-first incremental build; they do not imply code implementation is complete.
