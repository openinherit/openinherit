# Additional Level 1 Error Examples

These examples supplement the [main error guide](./error-guide.md) with more real-world validation scenarios that developers commonly encounter.

---

### 11. `must match format "date"`

**What it means:** Date fields (such as `dateOfBirth`, `dateOfDeath`, and document dates) must be valid ISO 8601 dates (`YYYY-MM-DD`). Other formats — even common ones like `DD/MM/YYYY` or `MM-DD-YYYY` — will be rejected.

**Fix:**

```typescript
// Wrong — UK format, slashes, or abbreviated
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  roles: ["testator"],
  dateOfBirth: "15/03/1965",   // not ISO 8601
};

// Wrong — month name
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  roles: ["testator"],
  dateOfBirth: "15-Mar-1965",
};

// Correct — ISO 8601
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  roles: ["testator"],
  dateOfBirth: "1965-03-15",
};
```

---

### 12. `must match format "email"`

**What it means:** The `contact.email` field on a person must be a valid email address. INHERIT validates email format — it does not merely annotate it. Missing `@`, spaces, or malformed domains will fail.

**Fix:**

```typescript
// Wrong — missing @, or has spaces
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  roles: ["testator"],
  contact: { email: "james.ashford" },
};

// Correct — valid email address
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  roles: ["testator"],
  contact: { email: "james.ashford@example.com" },
};
```

---

### 13. `must match format "uuid"`

**What it means (non-id fields):** UUID format validation applies to all fields with `format: "uuid"`, not just entity `id` fields. For example, `bequest.beneficiaryId`, `executor.personId`, and `guardian.guardianPersonId` all require valid UUIDs. Plain strings or sequential numbers will fail even if the referenced entity exists.

**Fix:**

```typescript
// Wrong — arbitrary string used as a person reference
const bequest = {
  id: crypto.randomUUID(),
  beneficiaryId: "sarah-ashford",  // not a UUID
};

// Correct — use the actual UUID from the person entity
const bequest = {
  id: crypto.randomUUID(),
  beneficiaryId: "a1000002-0000-4000-a000-000000000002",
};
```

---

### 14. `must NOT have fewer than 1 items` (required arrays)

**What it means:** Several arrays in INHERIT have `minItems: 1` because they are essential to the document. The most common are `person.roles` (a person must have at least one role) and `relationship.partners` (a relationship requires at least two partners). An empty array `[]` will fail.

**Fix:**

```typescript
// Wrong — roles array is empty
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  familyName: "Ashford",
  roles: [],
};

// Correct — at least one role
const person = {
  id: crypto.randomUUID(),
  givenName: "James",
  familyName: "Ashford",
  roles: ["testator"],
};
```

```typescript
// Wrong — only one partner in a relationship
const relationship = {
  id: crypto.randomUUID(),
  partners: ["person-id-1"],  // minItems: 2
};

// Correct — relationships need two people
const relationship = {
  id: crypto.randomUUID(),
  partners: ["person-id-1", "person-id-2"],
};
```

---

### 15. `must match pattern "^[A-Z]{2}$"` (jurisdiction codes)

**What it means:** Country and subdivision codes must follow ISO standards exactly — 2 uppercase letters for countries, with subdivisions in the format `XX-YYY` (e.g., `GB-ENG`). Lowercase, 3-letter codes, or numeric codes will all fail.

**Fix:**

```typescript
// Wrong — lowercase
const jurisdiction = { country: "gb", subdivision: "eng" };

// Wrong — numeric
const jurisdiction = { country: "826" };

// Correct — ISO 3166-1 alpha-2
const jurisdiction = { country: "GB", subdivision: "GB-ENG" };
```

---

### 16. Conditional validation: `if/then` with missing required fields

**What it means:** INHERIT schemas use `if`/`then` to express conditional requirements. When a field value matches the `if` condition, additional fields become required via `then`. The AJV error message may reference the `then` block without making the triggering condition obvious.

**Example — specific bequest requires a beneficiary reference:**

```typescript
// Wrong — type "specific" triggers a conditional requiring beneficiaryId
const bequest = {
  id: crypto.randomUUID(),
  type: "specific",
  description: "My vintage Rolex",
  // missing: beneficiaryId
};

// Correct — specify who receives the item
const bequest = {
  id: crypto.randomUUID(),
  type: "specific",
  description: "My vintage Rolex",
  beneficiaryId: "a1000002-0000-4000-a000-000000000002",
};
```

**Debugging tip:** When you see an unexpected required-field error, check the schema file for `if`/`then` blocks to understand which condition triggered the requirement.
