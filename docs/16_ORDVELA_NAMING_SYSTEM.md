# ORDVELA NAMING SYSTEM

**Date:** 2026-09-17  
**Status:** LOCKED FOR EXECUTION  
**Master Brand:** ORDVELA

---

## 1. Purpose

This document defines the canonical naming system for the ORDVELA ecosystem so new products, systems, modules, repositories, APIs, URLs, and public-facing assets remain coherent as the ecosystem expands.

The goal is not to create more names. The goal is to create a **repeatable naming grammar** that prevents unnecessary brand fragmentation.

Core principle:

> **One master brand. Few meaningful families. Clear product names. No unnecessary sub-brands.**

---

## 2. Canonical Master Brand

### 2.1 Master brand

Canonical formal spelling:

`ORDVELA`

Formal documentation uses uppercase `ORDVELA` when referring to the master brand itself.

Public product/family presentation may use title case:

`Ordvela Systems`  
`Ordvela Intelligence`  
`Ordvela Studio`  
`Ordvela Labs`

### 2.2 Spelling lock

The following are not alternate spellings:

- ORDVELA — canonical
- Ordvela — presentation form

Do not introduce:

- Ordvella
- Ordvela AI
- OrdVela
- Ordevela
- arbitrary stylizations that create a second spelling

---

## 3. Brand Architecture Naming Grammar

The canonical hierarchy is:

```text
ORDVELA
└── Family
    └── Product / System
        └── Module / Feature
```

Current families:

| Family | Role | Naming form |
|---|---|---|
| Systems | Software and operational business systems | `Ordvela Systems` |
| Intelligence | AI, research, discovery, decision systems | `Ordvela Intelligence` |
| Studio | Implementation, services, design, delivery | `Ordvela Studio` |
| Labs | Experiments, R&D, prototypes | `Ordvela Labs` |

Reserved families:

| Family | Use only when |
|---|---|
| Platform | A genuine multi-product platform exists |
| API | A reusable external API product exists |
| Marketplace | A functioning marketplace/network exists |

Reserved families are not default labels for ordinary products.

---

## 4. Product Naming Grammar

Preferred public grammar:

```text
Ordvela [Family] — [Product Name]
```

Examples:

```text
Ordvela Systems — Runner OS
Ordvela Intelligence — Demand Intelligence
Ordvela Studio — Implementation Services
Ordvela Labs — Experimental Agent Runtime
```

When context already establishes the family, the shorter product form may be used:

```text
Runner OS
Demand Intelligence
```

The ORDVELA relationship must remain discoverable through the parent page, repository, metadata, documentation, or other canonical identity.

---

## 5. Product Name Rules

A product name should be:

1. **Short** — preferably 1–3 meaningful words.
2. **Pronounceable** — understandable when spoken aloud.
3. **Durable** — not tied to a temporary implementation detail.
4. **Functional or conceptually meaningful** — the name should communicate the product's role or operating concept.
5. **Distinct within ORDVELA** — avoid sibling products with confusingly similar names.
6. **Expandable** — the name should survive future feature growth.
7. **Searchable** — perform collision checks before locking a public name.

Do not create an invented standalone brand merely because a product needs a name.

A standalone invented name requires an explicit naming decision and must pass the New Product Naming Gate below.

---

## 6. When to Use a Standalone Product Brand

Use a standalone product brand only when at least one of these conditions is true:

- the product has a distinct commercial identity;
- the product is intended to become independently recognizable;
- the product has a materially different audience or distribution model;
- the product may become a major platform or business line;
- the product name itself creates durable market value.

Otherwise prefer a descriptive ORDVELA product name.

Bad pattern:

```text
ORDVELA → random invented brand → product → module
```

Preferred pattern:

```text
ORDVELA → family → clear product → module
```

---

## 7. Module and Feature Naming

Modules and features should normally use descriptive names rather than new brands.

Examples:

```text
Demand Intelligence
Opportunity Database
Opportunity Scoring
Action Engine
Voice Input
Connector Layer
Execution Layer
Audit Log
```

Do not turn every feature into a capitalized sub-brand.

A feature becomes a product only when it independently satisfies the product criteria.

---

## 8. Internal Codename vs Public Name

Internal codenames are allowed for development, experiments, and temporary work.

Example:

```text
Internal codename: Project Northstar
Public name: Ordvela Intelligence — Demand Intelligence
```

Rules:

- internal codenames must not be presented as public brands accidentally;
- public documentation must use the canonical public name;
- codenames may be retired without affecting the public architecture;
- repository names should normally follow the public identity once the product is locked.

---

## 9. Repository Naming

Canonical repository pattern:

```text
ordvela-[product-slug]
```

Examples:

```text
ordvela-demand-intelligence
ordvela-runner-os
ordvela-opportunity-engine
```

For the master brand repository itself:

```text
Ordvela
```

Repository slugs should be:

- lowercase;
- hyphen-separated;
- concise;
- stable;
- free of unnecessary version numbers.

Avoid:

```text
ordvela-final
ordvela-v2
ordvela-new
ordvela-ai-super-system
```

Versioning belongs in releases, branches, or product versions—not repository names.

---

## 10. Package and API Naming

Software package names should follow the repository/product identity where practical.

Preferred pattern:

```text
@ordvela/[package]
ordvela-[package]
```

API naming should be descriptive and versioned at the API boundary rather than encoded into the master brand.

Preferred conceptual pattern:

```text
api.ordvela.[domain]/v1/...
```

Exact domain and DNS decisions are defined in the Domain Strategy document, not here.

---

## 11. URL and Slug Naming

Canonical URL slugs:

- lowercase;
- hyphen-separated;
- no unnecessary punctuation;
- no camelCase;
- no arbitrary abbreviations.

Examples:

```text
/demand-intelligence
/opportunity-database
/runner-os
/studio
/labs
```

The public URL should describe the resource, not the internal implementation.

---

## 12. Social and Public Handle Naming

Preferred hierarchy:

1. exact ORDVELA identity;
2. ORDVELA + family;
3. ORDVELA + product;
4. platform-specific fallback that remains recognizable as ORDVELA.

Avoid unrelated handles that create the appearance of a separate company.

Do not use `AI`, `Tech`, `Digital`, or similar generic suffixes merely to force handle availability unless there is a concrete product/organizational reason.

---

## 13. Naming Anti-Patterns

The following patterns are prohibited unless explicitly approved through a naming gate:

### 13.1 Brand explosion

```text
Every feature gets a new brand.
```

### 13.2 Descriptor stacking

```text
ORDVELA AI Intelligent Business Automation Platform Systems
```

Prefer a short product identity plus a clear description.

### 13.3 Generic master-brand variants

Do not create competing master identities such as:

```text
Ordvela Tech
Ordvela Digital
Ordvela AI
Ordvela Systems Group
```

These may be descriptive phrases in copy where appropriate, but they are not automatically new brand layers.

### 13.4 Temporary implementation names

Do not lock names based on:

- framework choice;
- database choice;
- vendor;
- temporary API provider;
- temporary architecture;
- prototype number.

### 13.5 Premature platform naming

Do not call a product `Ordvela Platform` until it genuinely functions as a platform.

---

## 14. Current Strategic System Mapping

The current operating model is:

```text
Demand Intelligence
        ↓
Opportunity Database
        ↓
Scoring
        ↓
Action
        ↓
Revenue / Delivery
```

Naming alignment:

```text
ORDVELA
│
├── Ordvela Intelligence
│   └── Demand Intelligence
│
├── Ordvela Systems
│   ├── Opportunity Database
│   ├── Scoring Engine
│   ├── Action / Execution Systems
│   └── Runner OS
│
├── Ordvela Studio
│   └── Client implementation and delivery
│
└── Ordvela Labs
    └── Experimental technologies
```

This mapping is an architectural naming reference, not a requirement to create a separate product for every line.

---

## 15. Legacy Project Migration Rule

Existing projects should not be renamed mechanically.

Migration occurs only when the project's current identity, ownership, purpose, and future role are understood.

General rule:

| Legacy role | ORDVELA destination |
|---|---|
| Production software/business system | Ordvela Systems |
| AI/research/discovery/decision capability | Ordvela Intelligence |
| Client implementation/service | Ordvela Studio |
| Experimental/R&D work | Ordvela Labs |
| No active strategic role | Archive |

A legacy project may keep its existing product name when that name has genuine user-facing value. The ORDVELA relationship can be added as the parent brand without forcing an unnecessary rename.

---

## 16. New Product Naming Gate

Before a new public name is locked, answer:

### Identity
- What exactly is being named?
- Is it a product, family, module, feature, or internal codename?
- Why does it need a distinct name?

### Architecture
- Which ORDVELA family owns it?
- Does the name create unnecessary brand fragmentation?
- Could an existing product name already cover the role?

### Language
- Is it pronounceable?
- Is spelling unambiguous?
- Does it create unwanted associations in the intended market?

### Market
- Are there material commercial/name collisions?
- Is the domain/handle strategy feasible?
- Is there a relevant trademark conflict requiring review?

### Durability
- Will the name remain accurate after the product expands?
- Does it depend on a temporary technology or implementation?

### Decision

A name is locked only when the answers are documented and no material blocker remains.

---

## 17. Naming Decision Record

Every locked product name should record:

```text
Name:
ORDVELA family:
Product role:
Public description:
Repository:
Canonical slug:
Naming rationale:
Collision screening:
Status:
Date locked:
```

This creates an auditable naming history and prevents future re-litigation of settled decisions without new evidence.

---

## 18. Acceptance Criteria

The ORDVELA Naming System is considered complete when:

- [x] ORDVELA is the single master brand.
- [x] Core families have canonical names.
- [x] Reserved families have explicit gates.
- [x] Product naming grammar is defined.
- [x] Module/feature naming rules are defined.
- [x] Repository naming rules are defined.
- [x] Package/API naming conventions are defined.
- [x] URL/slug rules are defined.
- [x] Social naming hierarchy is defined.
- [x] Anti-patterns are documented.
- [x] Legacy migration principles are defined.
- [x] New Product Naming Gate is defined.
- [x] Naming decisions have an auditable record format.

---

## 19. Next Sequence

```text
BRAND LOCK              ✅
        ↓
BRAND ARCHITECTURE      ✅
        ↓
NAMING SYSTEM           ✅
        ↓
DOMAIN STRATEGY         → NEXT
        ↓
GITHUB IDENTITY
        ↓
VISUAL DIRECTION
        ↓
IMPLEMENTATION
```

**Naming System status: LOCKED FOR EXECUTION.**
