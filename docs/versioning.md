# Versioning and Compatibility

How INHERIT schemas change over time, and what that means for your implementation.

## Schema Version

Every INHERIT document may include a `schemaVersion` field in the root envelope:

```json
{
  "inherit": "https://openinherit.org/v1/schema.json",
  "version": 1,
  "schemaVersion": "1.0.0",
  ...
}
```

This tells consumers exactly which schema revision the document was created against. The field is optional for backwards compatibility, but all new documents should include it.

## Maturity Levels

Each INHERIT schema has a maturity level that determines what changes are permitted:

| Level | Meaning | What Can Change | What Cannot Change |
|-------|---------|----------------|--------------------|
| **Draft** | Experimental — may change without notice | Anything: fields, types, enums, required status | Nothing is guaranteed |
| **Candidate** | Stabilising — backwards-compatible changes only | New optional fields, new enum values, new descriptions | No removals, no type changes, no new required fields |
| **Stable** | Frozen — no changes until next major version | Descriptions, examples, `$comment` annotations only | Everything structural |

### Current Status (v1.0)

- **20 core entity schemas:** candidate maturity
- **7 common type schemas:** candidate maturity
- **13 extension schemas:** draft maturity

Promotion to stable requires two independent implementations using the schema in production.

## What Is a Breaking Change?

| Change | Breaking? | Maturity Allowed |
|--------|-----------|-----------------|
| Add an optional field | No | Draft, Candidate |
| Add a new enum value | No | Draft, Candidate |
| Add `description`, `examples`, `$comment` | No | Draft, Candidate, Stable |
| Remove a field | **Yes** | Draft only |
| Change a field's type | **Yes** | Draft only |
| Make an optional field required | **Yes** | Draft only |
| Remove an enum value | **Yes** | Draft only |
| Rename a field | **Yes** | Draft only |

## Forward and Backward Compatibility

### Can a v1.1 consumer read a v1.0 document?

**Yes.** New optional fields added in v1.1 will simply be absent. Consumers should treat missing optional fields as undefined/null.

### Can a v1.0 consumer read a v1.1 document?

**Yes, if schemas use `additionalProperties: false`.** Unknown fields will cause validation failures, but the data is still readable. Consumers should:
1. Validate with their version's schemas
2. Ignore unknown fields that fail validation (log a warning)
3. Process all known fields normally

### Recommendation for implementers

Use `additionalProperties: false` for strict validation, but implement a "lenient mode" that strips unknown fields before validation. This lets you import documents from newer versions without failing.

## The `schemaVersion` Field

When present, `schemaVersion` tells you:

- `"1.0.0"` — created with the original v1.0 schemas
- `"1.1.0"` — created with v1.1 schemas (may contain new optional fields)

If `schemaVersion` is missing, treat as `"1.0.0"`.

If `schemaVersion` is newer than your validator supports, validate in lenient mode (strip unknown fields, process what you can).

## Extension Compatibility

Extensions (jurisdiction-specific schemas) follow the same maturity model independently. An extension can be draft while the core schemas are candidate. The `extension.json` manifest includes:

- `inherit` — semver range of compatible core versions (e.g. `">=1.0.0 <2.0.0"`)
- `maturity` — the extension's own maturity level

## Changelog Convention

Each schema change is recorded in `CHANGELOG.md` with:

```markdown
## [Unreleased]

### Added
- `formattedAddress` field on common/address.json (optional, non-breaking) — #19
- `schemaVersion` field on root schema (optional, non-breaking) — #16
```
