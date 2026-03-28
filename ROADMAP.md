# INHERIT Roadmap

## Current: v1.1.0 (March 2026)

*Published to npm as `@openinherit/schema@1.1.0` and `@openinherit/sdk@1.1.0`.*

### Core Standard
- 22 core entity schemas (20 original + valuation + lifetime-transfer)
- 7 common type schemas (money, address, jurisdiction, temporal-rule, identifier, visibility, media)
- 13 jurisdiction/cultural extensions (all draft)
- OpenAPI 3.1 schema bundle + 109-endpoint Reference REST API
- `schemaVersion` field on root document for version detection
- Versioning and compatibility policy (draft/candidate/stable maturity levels)

### Schema Quality
- Human-readable `description` on every field across all 29 core + common schemas
- `examples` with internationally diverse values on every property
- `$comment` explaining every enum value in plain language
- `formattedAddress` on addresses (structured + display string)

### Companion Estates
- Companion estate design document with vocabulary and lifecycle
- Ownership categories: joint, sole_partner_interest, sole_no_partner_interest, sole
- Companion link lifecycle: invited → active → decoupling → decoupled
- Shared people, sync rules, decoupling semantics, malicious deletion protection

### Developer Experience
- 4 TypeScript examples + 1 Python example + 1 Go example
- 10 global estate fixtures (8 jurisdictions including Korea)
- AI integration guide with extraction prompts and guardrails
- Agent configuration files (Claude Code, OpenAI Codex, GitHub Copilot, Cursor)
- Swagger UI API explorer on GitHub Pages
- Will-to-INHERIT scanner with live entity streaming at openinherit.org
- WillWriter Pro demonstration tool at openinherit.org

### Documentation
- Primer with TypeScript code examples
- Error guide (15 scenarios with AJV messages and fixes)
- Migration guide (databases, spreadsheets, other formats)
- Enum reference (complete catalogue of all enum fields)
- Person roles reference (all 10 roles with examples)
- Asset location classes (physical/financial/digital/intangible mapping)
- Canonical field ordering convention
- Self-hosted scanner guide
- Legal tech integration guide (Clio, LEAP, Actionstep, PracticePanther)
- Partnership details with concrete expectations

### Schema.org Alignment (new in v1.1)
- Renamed bare `type` fields to qualified names: `bequestType`, `liabilityType`, `wishType`, `kinshipType`, `transferType`, `trustType`
- Standardised cross-reference naming (`guardian.personId` matches `executor.personId`)
- `common/media.json` with `viewType` enum (overview, identification, condition, provenance, serial_number, etc.)
- Images on assets, properties, and collections (replaces minimal Photo type)
- Asset enrichments: `description`, `purchaseDate`, `originalPackaging`, `custodian`, `conditionSystem`, `conditionGrade`
- Document entity linking via `entityType` + `entityId`

## Next: v1.2 (target Q3 2026)

- Promote first schemas to stable (requires two independent implementations — MFI is the first)
- Level 3 conformance validation (extension-specific field checking)
- SchemaStore listing for IDE autocompletion
- First external contributor PRs
- Communication/provenance trail entity design ([#13](https://github.com/openinherit/openinherit/issues/13))
- Formal W3C-style specification document (normative prose)

## Future: v1.2+

- Reference REST API implementation (working server, not just spec)
- Multi-language OCR for will scanner
- Community extension template repository
- Additional jurisdiction extensions beyond the 13 launch jurisdictions
- Digital asset entity refinements based on MFI implementation feedback

## Long Term: v2.0

- Custom INHERIT vocabulary (formal JSON Schema vocabulary, not annotation-only)
- Breaking changes to draft schemas based on multi-implementation feedback
- Multi-version support policy
- Formal test suite for conformance certification

## How to Influence the Roadmap

File an issue or proposal on [GitHub](https://github.com/openinherit/openinherit/issues). All roadmap decisions are discussed publicly and reviewed by the steering committee.

Partnership firms get a steering committee seat — see [Becoming a Partner](docs/partners/becoming-a-partner.md).
