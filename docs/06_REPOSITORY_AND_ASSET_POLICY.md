# ORDVELA — Repository and Asset Policy

## Source of Truth

The `Sparkmind-obp-off/Ordvela` repository is the working source of truth for Ordvela brand decisions, research, architecture, implementation prompts, and decision history.

## Naming

- Repository: `Ordvela`
- Master brand: `ORDVELA` for brand-facing uppercase treatment; `Ordvela` for normal prose and filenames.
- Avoid accidental variants such as `OrdVela`, `OrdvelaAI`, or `OrdvelaTech` unless explicitly approved for a specific technical purpose.

## Documentation Rules

Every significant brand decision should be documented before implementation.

Documents should distinguish:

- facts/evidence
- assumptions
- decisions
- unresolved questions
- verification status

## Credentials and Secrets

Never commit:

- API keys
- passwords
- OAuth secrets
- private tokens
- registrar credentials
- social-account credentials
- private legal documents containing sensitive personal data

Use environment variables or approved secret-management mechanisms.

## External Assets

Before purchasing domains, registering trademarks, or reserving paid assets, confirm the current verification status and record the transaction decision.

## Change Control

Material brand changes should be recorded in `docs/09_DECISION_LOG.md` with date, rationale, evidence, and affected assets.

## Git Hygiene

Use focused commits. Example prefixes:

- `docs:` documentation
- `brand:` identity/strategy
- `chore:` repository maintenance
- `feat:` product capability
- `fix:` defect correction

Avoid committing generated credentials, local environment files, build artifacts, or temporary research dumps unless intentionally documented.