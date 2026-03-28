# Changelog

All notable changes to the INHERIT standard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `valuation.json` — new entity for multiple valuations per asset/property/collection with comparables array (step 5)
- `lifetime-transfer.json` — new entity for gift/transfer tax calculations across 10 jurisdictions (step 6)
- 8 intangible asset sub-objects on `asset.json`: shareholding, businessInterest, pension, insurancePolicy, coOwnership, intellectualProperty, stockCompensation, debtReceivable (step 5.5)
- `urgency` and `urgencyReason` fields on `asset.json` — executor priority (step 8)
- `containedInAssetId` on `asset.json` — hierarchical asset nesting (#26)
- `insurance` object on `asset.json` — coverage details (#19)
- `purchasedFrom` on `asset.json` — provenance tracking (#34)
- `dataProvenance` and `importSources` on root schema — data origin tracking (step 4)
- Per-entity `dataProvenance` and `importSourceId` overrides on `asset.json` (step 4)
- `disposalStrategy`, `minimumAcceptableValue`, `preferredDisposalMethod`, `specialistDealerNotes` on `asset-collection.json` (step 7)
- `executionDate` on `estate.json` — will execution date (step 9)
- `administration` object on `estate.json` — full administration tracking with distributions, tax clearance (step 14)
- `valuations` and `lifetimeTransfers` arrays on root schema
- `localPropertyTypes`, `localTenureTypes`, `localGrantTypes` arrays on UK extension (step 11)
- `succession_certificate`, `certificate_of_inheritance`, `court_appointment` grant types on executor (step 12)
- 7 companion reference datasets: tax-thresholds, tax-rates, gift-exemptions, relief-rules, pension-types, form-requirements, local-term-mappings (step 3.5 + 13)

### Changed
- Estate `status` enum: `draft`/`active`/`locked`/`archived` replaced with `planning`/`confirmed`/`pre_probate`/`in_administration`/`distributed`/`closed` (step 14)
- `propertyType` slimmed from 15 UK-specific values to 10 territory-neutral universals (step 10)
- `tenureType` slimmed from 8 UK-specific values to 6 territory-neutral universals (step 10)
- `valuationConfidence` renamed `probate` to `official` (step 10)
- `solicitor_firm` renamed to `legal_practice` in dealer-interest (step 12)
- Renamed `islamic` extension to `islamic-succession` — references legal tradition, not personal religious belief
- Renamed `jewish` extension to `jewish-succession` — references legal tradition, not personal religious belief
- Renamed `india-hindu` extension to `hindu-succession` — references the Hindu Succession Act, not personal religious belief
- Each renamed extension now carries a `$comment` explaining the naming rationale
- Added `docs/legal/taxonomy-provenance.md` documenting taxonomy sources and licence decisions

## [1.1.0] — 2026-03-27

### Added
- `common/media.json` — new common type for media attachments (photographs, videos, document scans) with `viewType` enum for structured visual documentation
- `images` property on `asset.json` — replaces `photos`, now references `common/media.json` with full media support
- `images` property on `property.json` — photographs and videos of properties
- `images` property on `asset-collection.json` — overview media for collections
- `images` property on `document.json` — scans and photographs of physical documents
- `description` field on `asset.json` — structured description distinct from free-form notes
- `purchaseDate` field on `asset.json` — acquisition date for CGT, insurance, and provenance
- `originalPackaging` field on `asset.json` — packaging completeness enum (affects value 20-40%)
- `custodian` object on `asset.json` — third-party holder details (bank, storage, repairer, gallery)
- `conditionSystem` and `conditionGrade` fields on `asset.json` — domain-specific grading (Goldmine, Sheldon, GIA, etc.)
- `entityType` and `entityId` fields on `document.json` — contextual linking of documents to their subject entities

### Removed
- `$defs.Photo` from `asset.json` — replaced by `common/media.json`
- `photos` property from `asset.json` — replaced by `images`

- Companion estate design document (`docs/companion-estates.md`) — vocabulary, lifecycle, sync rules, decoupling semantics, malicious deletion protection (#10)
- `companionLinkStatus`, `linkedAt`, `decoupledAt` fields on `estate.json` — companion link lifecycle tracking (#10)
- `ownershipCategory` field on `asset.json` — joint/sole/partner-interest classification for companion estates (#10)
- `sharedWithCompanion` field on `person.json` — marks people shared between companion estates (#10)
- Canonical field ordering convention (`docs/canonical-ordering.md`) — advisory ordering for entities, root document, and entity arrays (#17)
- Asset location classes reference (`docs/asset-location-classes.md`) — maps asset categories to physical/financial/digital/intangible with `propertyId` guidance (#11)
- Enum reference (`docs/enum-reference.md`) — complete catalogue of every enum field across all v1 schemas (#4)
- Person roles reference (`docs/person-roles.md`) — all 10 roles with descriptions, related entities, and examples (#3)
- Error guide expansion — 5 new error scenarios: wrong date format, missing entity arrays, invalid UUID, decimal monetary amounts, unknown enum values (#5)
- Developer examples in `examples/` — 4 TypeScript examples (create-estate, validate-document, import-export, extract-entities) and 1 Python example (validate)
- 9 global example fixtures covering 7 jurisdictions (GB-ENG, GB-SCT, US-NY, SG, JP, IN-MH, AE) plus an intentionally invalid fixture for testing
- AI integration guide (`docs/ai-guide.md`) with extraction prompts, tool schemas, and guardrails
- Agent configuration files for Claude Code, OpenAI Codex, GitHub Copilot, and Cursor
- Error guide (`docs/error-guide.md`) — validation errors explained with fixes
- Migration guide (`docs/migration-guide.md`) — migrating from databases, spreadsheets, and other formats
- `ROADMAP.md` — v1.0 through v2.0 roadmap
- Swagger UI API explorer at `swagger/index.html` (served via GitHub Pages)
- README overhaul: npm badges, "What Next?" navigation, conformance testing guide, data handling statement, contributors section, learning resources
- TypeScript code blocks added to the primer alongside existing JSON examples
- 5 good-first-issue GitHub issues for community contributors
- Self-hosted scanner guide (`docs/self-hosted-scanner.md`) — run extraction on your own infrastructure
- `formattedAddress` field on `common/address.json` — preserves original address text alongside structured fields (#19)
- `schemaVersion` field on root schema — enables version detection and graceful degradation (#16)
- Versioning and compatibility policy (`docs/versioning.md`) — maturity levels, breaking change definitions, forward/backward compatibility guidance (#16)
- Concrete partnership expectations in `docs/partners/becoming-a-partner.md` — time commitment, exclusivity, marketing, consulting support
- Legal review status section in `docs/extension-guide.md` — Reviewed / Legislation-based / Community tiers
- Legal tech integration guide (`docs/legal-tech-integration.md`) — field mappings for Clio, LEAP, Actionstep, PracticePanther
- Concrete partnership expectations in `docs/partners/becoming-a-partner.md` — time commitment, exclusivity, marketing, consulting support
- Legal review status section in `docs/extension-guide.md` — Reviewed / Legislation-based / Community tiers
- Legal tech integration guide (`docs/legal-tech-integration.md`) — field mappings for Clio, LEAP, Actionstep, PracticePanther

## [1.0.0] — 2026-03-26

### Added
- 18 core entity schemas
- 5 common type schemas
- 13 jurisdiction/cultural extension schemas
- Extension manifests and registry
- OpenAPI 3.1 schema bundle with validate endpoint
- Language-agnostic test suite (33 test cases)
- SDK generation pipeline (TypeScript + API client)
- Governance, contributing, and security documentation
- Developer documentation (primer, maturity model, conformance levels, extension guide)
- Partner onboarding documentation
- Reference REST API spec (`reference-api.yaml`) — 109 endpoints covering CRUD, import/export, couples, validation
- Reference data (regulatory bodies, practitioner activities, data protection rules)
- CI pipelines (schema validation, OpenAPI lint, test suite, type generation)
- Issue and PR templates
- RFC-style proposal template
