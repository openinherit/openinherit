# INHERIT — Open Estate Data Interchange Standard

[![Licence: Apache 2.0](https://img.shields.io/badge/licence-Apache%202.0-blue.svg)](LICENSE)
[![CI: Schema Validation](https://github.com/openinherit/openinherit/actions/workflows/validate-schemas.yml/badge.svg)](https://github.com/openinherit/openinherit/actions/workflows/validate-schemas.yml)
[![CI: Tests](https://github.com/openinherit/openinherit/actions/workflows/run-tests.yml/badge.svg)](https://github.com/openinherit/openinherit/actions/workflows/run-tests.yml)
[![npm: @openinherit/schema](https://img.shields.io/npm/v/@openinherit/schema)](https://www.npmjs.com/package/@openinherit/schema)
[![npm: @openinherit/sdk](https://img.shields.io/npm/v/@openinherit/sdk)](https://www.npmjs.com/package/@openinherit/sdk)

> **"Clarity changes families."**

When people understand what they can do with their assets — what the rules actually are, what happens if they do nothing, what their options look like in plain language — they make better decisions. They have conversations they've been avoiding. They give things away while they're alive to see the joy. They stop worrying about whether they've done it wrong, because they can see that they haven't.

Estate planning is one of the most avoided topics in family life. Not because people don't care, but because the information is buried in legal language, fragmented across jurisdictions, and tangled in myths about what you're "allowed" to do. The result is silence — and silence breeds anxiety, conflict, and regret.

INHERIT exists to break that silence with structured, trustworthy information. Not legal advice. Not a replacement for professionals — the opposite. When people can see their options clearly before they sit down with an estate planner, they arrive with ideas, with questions, and with confidence. The meeting becomes a genuine conversation between two informed people, not a one-sided explanation where the client nods along hoping they understood.

If competitors adopt INHERIT, that's mission success — not market loss. More clarity in the world is the point.

---

## What Is INHERIT?

INHERIT is an open data standard for estate planning information. It provides a common JSON format for representing people, assets, liabilities, bequests, trusts, executors, and all the other entities that make up an estate plan — across common law, civil law, Islamic, Jewish, Hindu, Japanese, and African customary legal traditions.

Every INHERIT document is a **data product** with four facets:

| Facet | What It Is | How INHERIT Delivers It |
|-------|-----------|------------------------|
| **Data** | The estate information itself | The JSON document — people, assets, bequests, etc. |
| **Structure** | How the information is formatted | JSON Schema 2020-12 with format assertion |
| **Meaning** | What each field means | `$comment` annotations, `description` fields, the [primer](docs/primer.md) |
| **Context** | Who created it, when, why, governance | `exportedBy`, `generator`, `exportedAt` in schema.json; `extension.json` manifests with `lastVerified`, `dataProvenance`, `responsibleOrganisation` |

---

## Quick Start

### Validate a document

```bash
git clone https://github.com/openinherit/openinherit.git
cd openinherit
pnpm install
pnpm test
```

### Generate TypeScript types

```bash
pnpm run generate
```

This produces TypeScript types and API client stubs in `generated/typescript/`.

### Install via npm

```bash
# Schema files (JSON Schema, JSON-LD context, reference data)
pnpm add @openinherit/schema

# TypeScript types and API client
pnpm add @openinherit/sdk
```

**Using the schema package:**

```javascript
// Import a JSON Schema file
import estate from '@openinherit/schema/v1/estate.json' with { type: 'json' };

// Import reference data
import activities from '@openinherit/schema/reference-data/practitioner-activities.json' with { type: 'json' };
```

**Using the SDK:**

```typescript
import { type Estate, type Person } from '@openinherit/sdk';
import { createEstate, listEstates } from '@openinherit/sdk/reference';
```

---

## What Next?

- **New to INHERIT?** Read the [Primer](docs/primer.md)
- **Want code examples?** See [examples/](examples/) — TypeScript and Python
- **Building with AI?** Read the [AI Integration Guide](docs/ai-guide.md)
- **Hit a validation error?** See the [Error Guide](docs/error-guide.md)
- **Exploring the API?** Visit the [Swagger API Explorer](https://openinherit.github.io/openinherit/swagger/)
- **Global examples?** See [examples/fixtures/](examples/fixtures/) — 9 estates across 7 jurisdictions
- **What's coming next?** See the [Roadmap](ROADMAP.md)

---

## Schema Overview

### Core Entities (18)

| Schema | Description |
|--------|-------------|
| `schema.json` | Root document envelope — the top-level INHERIT document |
| `estate.json` | The estate itself — links all entities together |
| `person.json` | Any person referenced in the estate (testator, beneficiary, executor, etc.) |
| `relationship.json` | Relationship between two people (spouse, parent, child, etc.) |
| `kinship.json` | Family group structure |
| `property.json` | Real property (land, buildings) |
| `asset.json` | Non-property assets (bank accounts, investments, vehicles, etc.) |
| `liability.json` | Debts, mortgages, loans |
| `bequest.json` | A gift in a will — specific, general, residuary, demonstrative, or class |
| `trust.json` | Trust arrangements |
| `executor.json` | Named executor or administrator |
| `guardian.json` | Guardian appointment for minor children |
| `wish.json` | Non-binding wishes (funeral, organ donation, pet care, etc.) |
| `document.json` | Legal documents (wills, codicils, powers of attorney) |
| `attestation.json` | Witness attestation of a document |
| `proxy-authorisation.json` | Power of attorney or deputyship |
| `dealer-interest.json` | Professional interest in the estate (solicitor, financial adviser, etc.) |
| `nonprobate-transfer.json` | Assets that pass outside the will (pensions, life insurance, joint tenancy) |

### Common Types (5)

| Schema | Description |
|--------|-------------|
| `common/money.json` | Monetary amounts (integer pennies + currency) |
| `common/address.json` | Postal addresses |
| `common/jurisdiction.json` | ISO 3166-2 jurisdiction codes |
| `common/identifier.json` | External identifiers (NI number, passport, etc.) |
| `common/temporal-rule.json` | Time-bound legislation rules |

### Extensions (13)

| Extension | Jurisdiction | Legal System |
|-----------|-------------|-------------|
| `uk-england-wales` | GB-ENG | Common law |
| `us-estate` | US (federal + state) | Common law |
| `canada` | CA (federal + provincial) | Common law / Civil law (QC) |
| `australia-nz` | AU / NZ | Common law |
| `eu-succession` | EU member states | Civil law |
| `japan` | JP | Civil law |
| `prc-china` | CN | Civil law (socialist) |
| `singapore-malaysia` | SG / MY | Mixed |
| `latin-america` | LATAM | Civil law |
| `islamic-succession` | Multiple | Islamic succession law |
| `jewish-succession` | Multiple | Jewish succession law |
| `hindu-succession` | IN | Hindu succession law |
| `africa-customary` | Multiple | Customary |

---

## Conformance Levels

| Level | Name | What It Means |
|-------|------|--------------|
| 1 | **Schema Valid** | Document passes JSON Schema 2020-12 validation |
| 2 | **Referentially Intact** | All cross-references resolve (e.g. executor's `personId` matches a person) |
| 3 | **Jurisdiction Complete** | All jurisdiction-required fields are populated per the active extension |

---

## Conformance Testing

If you are building an INHERIT implementation, use the example fixtures in `examples/fixtures/` as conformance tests. Your application should be able to:

1. Import each fixture without errors
2. Re-export it without data loss
3. Pass Level 1 and Level 2 validation on the output

---

## Extension Ecosystem

Extensions add jurisdiction-specific and cultural fields to core schemas. Each extension lives in its own subdirectory with an `extension.json` manifest describing its maintainers, legal sources, and compatibility range.

| Tier | Where It Lives | Who Maintains It |
|------|---------------|-----------------|
| **Core** | This repo, tested in CI | Testate Technologies + jurisdiction partners |
| **Community** | Third-party repos following the template | External maintainers |
| **Pending** | Staging area in this repo | Being evaluated for promotion |

See the [Extension Guide](docs/extension-guide.md) for how to create and maintain extensions.

---

## Data Handling

INHERIT is a data interchange format. It defines the structure of estate planning documents — it does not transmit, store, or process personal data. Applications that use INHERIT are responsible for their own data handling, encryption, access control, and regulatory compliance.

The INHERIT JSON format is designed to be stored, transmitted, and processed by your own systems under your own data protection policies.

---

## Documentation

- [Primer](docs/primer.md) — narrative walkthrough for newcomers
- [Maturity Model](docs/maturity-model.md) — per-schema maturity levels (draft / candidate / stable)
- [Conformance Levels](docs/conformance-levels.md) — three-level validation model
- [Extension Guide](docs/extension-guide.md) — how to author and maintain extensions
- [Becoming a Partner](docs/partners/becoming-a-partner.md) — jurisdiction partnership programme
- [Governance](GOVERNANCE.md) — how the standard evolves
- [Contributing](CONTRIBUTING.md) — how to contribute
- [AI Integration Guide](docs/ai-guide.md) — building with AI, extraction prompts, guardrails
- [Error Guide](docs/error-guide.md) — validation errors explained with fixes
- [Migration Guide](docs/migration-guide.md) — migrating from databases, spreadsheets, other formats
- [Roadmap](ROADMAP.md) — what's coming next

A formal W3C-style specification document is planned after the standard achieves two independent implementations. See the [Roadmap](ROADMAP.md).

---

## Contributors Welcome

We welcome contributions from anyone. See [CONTRIBUTING.md](CONTRIBUTING.md).

Looking for a first contribution? Check the issues labelled [`good-first-issue`](https://github.com/openinherit/openinherit/labels/good-first-issue).

---

## Licensing

| Component | Licence |
|-----------|---------|
| Schemas + spec text | [Apache 2.0](LICENSE) — includes patent grant |
| Test fixtures + examples | [CC0](LICENSE-EXAMPLES) — zero friction |

---

## Influenced By

INHERIT's design draws from established open standards and data engineering practice:

| Standard / Source | What We Took |
|-------------------|-------------|
| [OpenAPI](https://www.openapis.org/) (OAI) | Repo structure, `proposals/` directory, Apache 2.0 licence |
| [FHIR](https://hl7.org/fhir/) (HL7) | Per-resource maturity levels, conformance testing, two-implementation rule |
| [CloudEvents](https://cloudevents.io/) (CNCF) | `specversion` in envelope, SDK-per-language model |
| [OCDS](https://standard.open-contracting.org/) (Open Contracting) | Extension template repo, `extension.json` manifests, extension registry |
| [JSON Schema](https://json-schema.org/) | Language-agnostic test suite format, immutable schemas, dialect system |
| [Schema.org](https://schema.org/) | Additive-only within version, pending-to-core promotion path |
| [W3C](https://www.w3.org/) | Two-implementation requirement before stable |
| Itelman & Viotti, *Unifying Business, Data, and Code* (O'Reilly, 2024) | Four-facet data product model, schema immutability, custom vocabulary roadmap |

For comprehensive JSON Schema 2020-12 keyword documentation with common pitfalls and examples, see [learnjsonschema.com](https://www.learnjsonschema.com/2020-12/).
