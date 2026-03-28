# Sourcemeta JSON Schema CLI Integration — Design Specification

**Date:** 28 March 2026
**Author:** Richard Davies + Claude
**Status:** Approved
**Context:** Juan Cruz Viotti (author of *Unifying Business, Data, and Code*, O'Reilly 2024) recommended using the Sourcemeta JSON Schema CLI (`https://github.com/sourcemeta/jsonschema`) to lint schemas and write tests. INHERIT v1.3.0 has 45 schemas but only 5 have tests (33 test cases total). The bespoke AJV test runner works but doesn't catch schema anti-patterns. This spec integrates the Sourcemeta CLI as the primary schema quality tool.

**Reference:** `https://www.learnjsonschema.com/2020-12/` — companion documentation site for JSON Schema 2020-12.

---

## 1. Installation and Project Manifest

Install the CLI globally via npm:

```bash
npm install --global @sourcemeta/jsonschema
```

Create `jsonschema.json` at the spec repo root:

```json
{
  "title": "INHERIT v1 Schema",
  "description": "Open data standard for estate, inheritance, and catalogue data",
  "github": "openinherit/openinherit",
  "website": "https://openinherit.org",
  "defaultDialect": "https://json-schema.org/draft/2020-12/schema",
  "path": "./v1",
  "extension": [".json"],
  "ignore": ["./v1/context"]
}
```

The `resolve` field maps `https://openinherit.org/v1/` URIs to local `./v1/` paths so the CLI can resolve `$ref`s without HTTP. The `ignore` field excludes the JSON-LD context directory (not schemas).

---

## 2. Linting and Formatting

### 2a. Discovery phase

Run `jsonschema lint v1/` and `jsonschema metaschema v1/` against the current schemas as-is. Catalogue every warning.

### 2b. Triage

Classify each lint finding as:
- **Fix** — genuine anti-pattern, update the schema
- **Exclude** — intentional design choice, add to exclusion list

Exclusions are applied either globally (via `--exclude` in the package.json script) or per-subschema (via `x-lint-exclude` in the schema itself).

### 2c. Formatting

Run `jsonschema fmt v1/` with `--keep-ordering`. INHERIT's property ordering is semantically meaningful (fields grouped by domain, not alphabetical). Adopt 2-space indentation (already the convention).

### 2d. Package scripts

Add to `package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `lint:schema` | `jsonschema lint v1/` | Detect schema anti-patterns |
| `fmt:schema` | `jsonschema fmt --check v1/` | Verify consistent formatting |
| `metaschema` | `jsonschema metaschema v1/` | Validate schemas against their metaschema |

These sit alongside the existing `lint:openapi` and `validate` scripts.

---

## 3. Test Migration and Expansion

### 3a. Migrate existing 33 tests

Convert the 5 test files in `tests/v1/` from the current AJV format (array of suites with `schema.$ref`) to Sourcemeta format (`{ target, tests }` objects):

| Current file | New file |
|-------------|----------|
| `tests/v1/money/money.json` | `tests/v1/money/money.test.json` |
| `tests/v1/person/person.json` | `tests/v1/person/person.test.json` |
| `tests/v1/bequest/bequest.json` | `tests/v1/bequest/bequest.test.json` |
| `tests/v1/estate/estate.json` | `tests/v1/estate/estate.test.json` |
| `tests/v1/jurisdiction/jurisdiction.json` | `tests/v1/jurisdiction/jurisdiction.test.json` |

The `target` field uses relative paths to the schema (e.g. `../../../v1/person.json`). The `data` and `valid` fields carry over directly.

### 3b. Expand to cover all 32 core schemas

Write new test files for the remaining 18 entity schemas and 4 untested common types. Each test file follows the pattern:
- 2-3 valid cases (minimal, fully populated, edge case)
- 3-4 invalid cases (missing required fields, wrong types, invalid enum values)

Target schemas (32 total):
- **9 common types:** address, completeness, identifier, jurisdiction, media, money, tax-position, temporal-rule, visibility
- **23 entity schemas:** schema (root), estate, person, bequest, asset, asset-collection, asset-interest, attestation, catalogue, dealer-interest, document, executor, guardian, kinship, liability, lifetime-transfer, nonprobate-transfer, property, proxy-authorisation, relationship, trust, valuation, wish

### 3c. New v1.3.0 field coverage

Targeted tests for all new fields:
- `searchTerms`, `comparableSearchProfile`, `suggestedSubcategory` on asset
- `confidenceScores`, `valuationReliability`, `lastVerifiedAt`, `verifiedBy` on asset
- `confidenceScores` on person
- `matchScore`, `humanVerdict`, `rejectionReason` on valuation comparables
- `@context`, `legacyContacts` on root schema
- `catalogue.json` root schema (new, needs full coverage)

### 3d. Retire bespoke runner

Replace the `test` script in `package.json`:

| Before | After |
|--------|-------|
| `node scripts/run-tests.mjs` | `jsonschema test tests/ --resolve v1/` |

Delete `scripts/run-tests.mjs`. The old test files (`tests/v1/*/name.json` without `.test.` suffix) are replaced by the new Sourcemeta-format files.

---

## 4. What Stays, What Goes, What's New

| Component | Status | Reason |
|-----------|--------|--------|
| `scripts/run-tests.mjs` | **Retired** | Replaced by `jsonschema test` |
| `scripts/validate-schemas.mjs` | **Stays** | Checks extension manifests — things CLI doesn't cover |
| AJV fixture validation (build rules) | **Stays** | Validates full estate/catalogue documents against root schemas |
| `scripts/check-stale-counts.py` | **Stays** | Schema count auditing |
| `scripts/generate-stats.py` | **Stays** | Stats generation |
| `jsonschema.json` | **New** | Sourcemeta project manifest |
| `tests/v1/**/*.test.json` | **New** | Sourcemeta-format tests for 32 schemas |
| `lint:schema` / `fmt:schema` / `metaschema` | **New** | Package.json scripts |

---

## 5. Success Criteria

1. `jsonschema metaschema v1/` passes clean
2. `jsonschema lint v1/` passes clean (with intentional exclusions documented)
3. `jsonschema fmt --check v1/` passes clean
4. `jsonschema test tests/` passes — all 32 core schemas covered
5. Existing AJV fixture validation still passes (11/11 fixtures)
6. `pnpm test` runs `jsonschema test tests/` instead of the old runner

---

## 6. Files Created/Modified

### New files (spec repo):
- `jsonschema.json` — Sourcemeta project manifest
- `tests/v1/**/*.test.json` — ~32 test files in Sourcemeta format

### Modified files (spec repo):
- `package.json` — new scripts, `test` command updated
- `v1/*.json` — lint fixes (descriptions, formatting, anti-patterns)
- Existing test files renamed from `.json` to `.test.json` with format conversion

### Deleted files:
- `scripts/run-tests.mjs` — replaced by `jsonschema test`
- `tests/v1/*/name.json` (old format) — replaced by `.test.json` equivalents

---

## 7. What This Does NOT Change

- The AJV fixture validation in the build rules — full document validation is a different concern
- Extension schema validation (`validate-schemas.mjs`) — extension manifests have custom checks
- OpenAPI linting (`lint:openapi`) — separate toolchain
- The schema content itself (beyond lint fixes) — no structural changes
- The website or deployment process
