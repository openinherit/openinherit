# Error Guide

A developer-friendly reference for every validation error INHERIT can produce, organised by [conformance level](./conformance-levels.md). Each entry shows the AJV error message, what it means, and how to fix it.

---

## Level 1 Errors (Schema Validation)

Level 1 errors are produced by AJV when the document fails JSON Schema 2020-12 validation. These are structural problems — wrong types, missing fields, invalid values.

### 1. `must have required property 'id'`

**What it means:** Every INHERIT entity (person, asset, bequest, etc.) must have an `id` field containing a UUID.

**Fix:**

```typescript
// Wrong — missing id
const person = {
  givenName: "James",
  familyName: "Ashford",
  roles: ["testator"],
};

// Correct — add a UUID id
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  familyName: "Ashford",
  roles: ["testator"],
};
```

---

### 2. `must match format "uuid"`

**What it means:** The `id` field must be a valid v4 UUID, not a plain string or sequential number. INHERIT validates formats — it does not merely annotate them.

**Fix:**

```typescript
// Wrong — plain strings are not UUIDs
const person = { id: "1", givenName: "James" };
const person = { id: "my-person", givenName: "James" };

// Correct — use crypto.randomUUID()
const person = { id: crypto.randomUUID(), givenName: "James" };
// e.g. id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
```

---

### 3. `must be integer`

**What it means:** Monetary amounts in INHERIT use integer minor units (pennies/cents), not decimal values. This avoids floating-point rounding errors that plague financial calculations.

**Fix:**

```typescript
// Wrong — decimal amount
const bequest = {
  id: crypto.randomUUID(),
  amount: { amount: 50000.00, currency: "GBP" },
};

// Correct — integer minor units (50000.00 GBP = 5000000 pence)
const bequest = {
  id: crypto.randomUUID(),
  amount: { amount: 5000000, currency: "GBP" },
};
```

**Conversion rule:** multiply the human-readable amount by 100 (for currencies with 2 decimal places).

---

### 4. `must be equal to one of the allowed values`

**What it means:** The field is an enum — only specific values are permitted. Check the schema for the allowed list.

**Common example — person roles:**

```typescript
// Wrong — "heir" is not a valid INHERIT role
const person = {
  id: crypto.randomUUID(),
  givenName: "Sarah",
  familyName: "Ashford",
  roles: ["heir"],
};

// Correct — use a valid role from the enum
const person = {
  id: crypto.randomUUID(),
  givenName: "Sarah",
  familyName: "Ashford",
  roles: ["beneficiary"],
};
```

**Valid person roles:** See [Enum Reference](./enum-reference.md#person) for the complete list of valid roles and all other enum values across all schemas.

---

### 5. `must NOT have additional properties` / `must NOT have unevaluated properties`

**What it means:** INHERIT uses strict schemas with [`unevaluatedProperties: false`](https://www.learnjsonschema.com/2020-12/unevaluated/unevaluatedproperties/) on every entity root. Any field not defined in the schema is rejected. This is intentional — it catches typos and prevents data from silently being ignored.

**Fix:**

```typescript
// Wrong — "type" is not a field on property; the correct name is "propertyType"
const property = {
  id: crypto.randomUUID(),
  type: "residential",           // typo: should be propertyType
  address: { /* ... */ },
};

// Correct — use the exact field name from the schema
const property = {
  id: crypto.randomUUID(),
  propertyType: "residential",
  address: { /* ... */ },
};
```

**Debugging tip:** if you see this error, check for:
- Misspelt field names (e.g. `type` instead of `propertyType`)
- Fields from your internal data model that don't exist in INHERIT
- camelCase vs other casing (INHERIT uses camelCase throughout)

> **Learn more:** [Understanding unevaluatedProperties](https://www.learnjsonschema.com/2020-12/unevaluated/unevaluatedproperties/) on learnjsonschema.com explains how this keyword works with `allOf`, `$ref`, and schema composition.

---

### 6. `must match pattern "^[A-Z]{2}$"`

**What it means:** Country and jurisdiction codes must be exactly 2 uppercase letters, following ISO 3166-1 alpha-2.

**Fix:**

```typescript
// Wrong — lowercase, or 3-letter code
const estate = {
  jurisdiction: "gb",     // lowercase
};
const estate = {
  jurisdiction: "GBR",    // 3-letter ISO 3166-1 alpha-3
};

// Correct — 2 uppercase letters
const estate = {
  jurisdiction: "GB",
};
```

---

### 7. `must NOT have fewer than 1 items` / `must NOT have fewer than 2 items`

**What it means:** Some arrays have `minItems` constraints. An empty array (or one that's too short) will fail.

**Examples:**

```typescript
// Wrong — person.roles requires at least 1 item
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  familyName: "Ashford",
  roles: [],  // minItems: 1
};

// Correct — provide at least one role
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  familyName: "Ashford",
  roles: ["testator"],
};
```

```typescript
// Wrong — relationship.partners requires at least 2
const relationship = {
  id: crypto.randomUUID(),
  partners: ["one-person-id"],  // minItems: 2
};

// Correct — a relationship needs at least two partners
const relationship = {
  id: crypto.randomUUID(),
  partners: ["person-id-1", "person-id-2"],
};
```

---

### 8. Conditional validation failures (`if`/`then`)

**What it means:** INHERIT uses JSON Schema [`if`/`then`/`else`](https://www.learnjsonschema.com/2020-12/applicator/if/) for conditional requirements. When a field matches a condition, additional fields become required.

**Example — specific bequest requires a beneficiary:**

```typescript
// Wrong — type "specific" requires beneficiaryId or beneficiaryOrganisation
const bequest = {
  id: crypto.randomUUID(),
  bequestType: "specific",
  description: "My Rolex Submariner",
  // missing: who gets it?
};

// Correct — specify who receives it
const bequest = {
  id: crypto.randomUUID(),
  bequestType: "specific",
  description: "My Rolex Submariner",
  beneficiaryId: "person-uuid-here",
};
```

**Debugging tip:** conditional validation errors can be confusing because AJV reports failures against the `then` branch without always making the `if` condition obvious. Check the schema's `if`/`then` blocks to understand which conditions trigger which requirements.

> **Learn more:** [Understanding if/then/else](https://www.learnjsonschema.com/2020-12/applicator/if/) on learnjsonschema.com.

---

## Level 2 Errors (Referential Integrity)

Level 2 errors occur when cross-references within the document point to entities that don't exist. These are caught by the referential integrity checker, not by JSON Schema.

### 9. `Person "xyz" not found in people array`

**What it means:** A field that references a person (by UUID) points to an ID that doesn't exist in the `people` array. This applies to:

- `estate.testatorPersonId`
- `bequest.beneficiaryId`
- `executor.personId`
- `guardian.guardianPersonId`
- `guardian.childPersonId`
- Witness person IDs in attestations

**Fix:**

```typescript
const people = [
  { id: "aaaa-bbbb-cccc-dddd", givenName: "James", familyName: "Ashford", roles: ["testator"] },
];

// Wrong — references a person who doesn't exist
const estate = {
  testatorPersonId: "xxxx-yyyy-zzzz-0000",  // not in people array
};

// Correct — use an ID that exists in the people array
const estate = {
  testatorPersonId: "aaaa-bbbb-cccc-dddd",
};
```

**Debugging tip:** generate all your people first, store their IDs, then reference those IDs when building estates, bequests, executors, and guardians.

---

### 10. `Property "xyz" not found` / `Asset "xyz" not found`

**What it means:** A bequest or other entity references a property or asset by ID, but that ID doesn't exist in the `properties` or `assets` array.

**Fix:**

```typescript
const assets = [
  { id: "asset-uuid-1", assetType: "investment", description: "ISA portfolio" },
];

// Wrong — references a non-existent asset
const bequest = {
  id: crypto.randomUUID(),
  sourceAssetId: "asset-uuid-999",  // not in assets array
};

// Correct — reference an asset that exists
const bequest = {
  id: crypto.randomUUID(),
  sourceAssetId: "asset-uuid-1",
};
```

---

## Level 3 Errors (Jurisdiction Complete)

Level 3 validation is not yet automated. Extension-specific field requirements are documented per extension in `v1/extensions/`. Automated checking is planned for v1.1.

When Level 3 checking is available, it will verify that jurisdiction-required fields are populated — for example, that a UK England & Wales estate includes `nilRateBand` and `inheritanceTaxRate` in its extension data.

---

## Additional Resources

- [Comprehensive JSON Schema 2020-12 keyword reference](https://www.learnjsonschema.com/2020-12/) — full documentation for every keyword INHERIT uses
- [Understanding unevaluatedProperties](https://www.learnjsonschema.com/2020-12/unevaluated/unevaluatedproperties/) — used on every INHERIT entity to reject unknown fields
- [Understanding conditional validation (if/then/else)](https://www.learnjsonschema.com/2020-12/applicator/if/) — how INHERIT expresses conditional requirements
- [Understanding $ref (cross-schema references)](https://www.learnjsonschema.com/2020-12/core/ref/) — how INHERIT schemas reference shared definitions
- [INHERIT validation example](../examples/validate-document.ts) — working TypeScript code that implements Level 1 + Level 2 validation
- [Enum Reference](./enum-reference.md) — complete list of all valid enum values across all schemas
