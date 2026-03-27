# AI Integration Guide

> The single source of truth for building AI systems that read, write, and validate INHERIT documents.

All agent wrapper files (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.cursor/rules`) point here.

---

## Section 1: Building with INHERIT

### What is INHERIT?

INHERIT is an open estate data interchange standard for structured estate planning information. It defines 20 core entity schemas, 7 common types (money, address, jurisdiction, temporal-rule, identifier, visibility, media), and 13 jurisdiction/cultural extensions — enabling estate planning data to move between software systems, legal professionals, and AI tools across 7 legal traditions (common law, civil law, mixed, religious, customary, socialist, and hybrid).

### The Minimum Viable Estate

The smallest valid INHERIT document requires:

1. The root envelope (`inherit`, `version`)
2. An `estate` object with `testatorPersonId`, `status`, `jurisdiction`, `createdAt`, `lastModifiedAt`
3. One person in `people` with role `testator`
4. All 15 entity arrays present (empty is valid)

```json
{
  "inherit": "https://openinherit.org/v1/schema.json",
  "version": 1,
  "exportedAt": "2026-03-27",
  "generator": {
    "name": "My App",
    "version": "1.0.0"
  },
  "estate": {
    "id": "e0000001-0000-4000-a000-000000000001",
    "testatorPersonId": "a1000001-0000-4000-a000-000000000001",
    "status": "draft",
    "jurisdiction": {
      "country": "GB",
      "subdivision": "GB-ENG",
      "legalSystem": "common_law",
      "name": "England & Wales"
    },
    "createdAt": "2026-03-27",
    "lastModifiedAt": "2026-03-27"
  },
  "people": [
    {
      "id": "a1000001-0000-4000-a000-000000000001",
      "givenName": "James",
      "familyName": "Ashford",
      "roles": ["testator"]
    }
  ],
  "kinships": [],
  "relationships": [],
  "properties": [],
  "assets": [],
  "liabilities": [],
  "bequests": [],
  "trusts": [],
  "executors": [],
  "guardians": [],
  "wishes": [],
  "documents": [],
  "nonprobateTransfers": [],
  "proxyAuthorisations": [],
  "dealerInterests": [],
  "extensions": []
}
```

See [`examples/fixtures/minimal-estate.json`](../examples/fixtures/minimal-estate.json) for the canonical fixture.

### Entity Relationships

Entities cross-reference each other by UUID. All referenced IDs must resolve to an entity in the corresponding array.

```
estate.testatorPersonId ──────────────► person.id
bequest.beneficiaryId ────────────────► person.id
bequest.sourceAssetId ────────────────► asset.id
executor.personId ────────────────────► person.id
guardian.personId ────────────────────► person.id
guardian.childPersonId ───────────────► person.id
kinship.fromPersonId ─────────────────► person.id
kinship.toPersonId ───────────────────► person.id
relationship.partners[].personId ─────► person.id
```

### Required vs Optional Fields

Every entity has required fields. Omitting them causes validation failure.

| Entity | Required Fields |
|--------|----------------|
| **person** | `id`, `givenName`, `roles` |
| **estate** | `id`, `testatorPersonId`, `status`, `jurisdiction`, `createdAt`, `lastModifiedAt` |
| **property** | `id`, `name` |
| **asset** | `id`, `name`, `category` |
| **bequest** | `id`, `bequestType` (+ `beneficiaryId` or `beneficiaryOrganisation` for most types) |
| **executor** | `id`, `personId`, `role` |
| **guardian** | `id`, `personId`, `childPersonId`, `role`, `appointmentType` |
| **liability** | `id`, `liabilityType`, `amount` |
| **wish** | `id`, `wishType`, `title` |
| **trust** | `id`, `name`, `trustType`, `trustees` (min 1), `beneficiaries` (min 1) |
| **document** | `id`, `type`, `title` |
| **nonprobateTransfer** | `id`, `transferType`, `passesOutsideEstate` |
| **kinship** | `id`, `kinshipType`, `fromPersonId`, `toPersonId` |
| **relationship** | `id`, `type`, `partners` (min 2) |
| **proxyAuthorisation** | `id`, `proxyPersonId`, `testatorPersonId`, `scope`, `consentRecord` |
| **dealerInterest** | `id`, `interestedParty`, `offerStatus`, `privacyLevel` |

### Common Mistakes

1. **Forgetting to include all 15 entity arrays** — even empty ones are required. The schema validates their presence.
2. **Using string amounts** (`"45000000"`) instead of integer (`45000000`) for money. All monetary amounts are integer minor units.
3. **Missing root envelope fields** — `inherit` and `version` are required at the document root.
4. **Using auto-increment IDs** instead of v4 UUIDs. Every `id` must be a valid UUID v4.
5. **Invalid enum values** — check the schema for allowed values (e.g. `status`, `type`, `role`). The schema rejects unknown values.
6. **Adding undeclared properties** — `unevaluatedProperties: false` rejects any field not defined in the schema.
7. **Wrong date format** — all dates must be ISO 8601: `YYYY-MM-DD`.

### Validation Patterns

Use AJV (Another JSON Validator) with 2020-12 support:

```typescript
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

// Load all schemas from the v1/ directory
function loadSchemas(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { loadSchemas(full); continue; }
    if (!entry.endsWith('.json')) continue;
    const schema = JSON.parse(readFileSync(full, 'utf-8'));
    if (schema.$id) {
      // Replace custom dialect with standard 2020-12
      if (schema.$schema === 'https://openinherit.org/v1/dialect.json') {
        schema.$schema = 'https://json-schema.org/draft/2020-12/schema';
      }
      ajv.addSchema(schema);
    }
  }
}

loadSchemas('./v1');
const validate = ajv.getSchema('https://openinherit.org/v1/schema.json');

// Validate a document
const doc = JSON.parse(readFileSync('my-estate.json', 'utf-8'));
if (validate && !validate(doc)) {
  console.error('Validation errors:', validate.errors);
} else {
  console.log('Valid INHERIT document.');
}
```

See [`examples/validate-document.ts`](../examples/validate-document.ts) for a complete runnable example.

### JSON Schema Keyword Reference

INHERIT uses JSON Schema 2020-12 with format assertion. For keyword-level documentation with common pitfalls and examples, see [learnjsonschema.com](https://www.learnjsonschema.com/2020-12/).

---

## Section 2: Extracting INHERIT Data from Documents

This section provides production-ready prompts and schemas for using AI to extract structured estate data from will text, scanned documents, or other unstructured sources.

### System Prompt

Use this system prompt verbatim when configuring an LLM for entity extraction:

```
You are an expert estate data analyst. Your task is to extract structured data from will and testament text according to the INHERIT v1 open estate data standard.

## Entity Types

Extract the following entity types:

**person** — Any individual mentioned. Include a "roles" array with one or more of:
- testator: the person making the will
- beneficiary: someone who receives a gift or share
- executor: appointed to administer the estate (also create an executor entity)
- guardian: appointed to care for children (also create a guardian entity)
- witness: signed the will as witness

**property** — Real estate: houses, land, flats. Include address, tenure (freehold/leasehold), estimated value if stated.

**asset** — Financial and personal assets: bank accounts, investments, vehicles, jewellery, furniture, business interests. Include institution name, account type, estimated value if stated.

**liability** — Debts and obligations: mortgages, loans, credit cards. Include creditor name, estimated amount if stated.

**bequest** — A gift or instruction. Types:
- specific: a named item to a named person
- pecuniary: a cash sum
- residuary: the remainder of the estate
- conditional: subject to a condition
- demonstrative: from a specified fund
- trust: into trust
- charitable: to a charity

**executor** — An appointed executor (always paired with a person entity for the same individual).

**guardian** — An appointed guardian (always paired with a person entity for the same individual).

**wish** — Non-binding preferences: funeral wishes, burial instructions, pet care, letters of wishes.

## Confidence Levels

- **high**: Explicitly stated in clear, unambiguous terms
- **medium**: Reasonably inferred from context
- **low**: Ambiguous, incomplete, or uncertain

## Source Locations

Provide page/paragraph references where possible (e.g. "Page 2, clause 3", "Opening paragraph").

## Monetary Amounts

Express all monetary amounts as integer minor units (pennies for GBP). Default currency is GBP (ISO 4217) unless another currency is stated. Example: £50,000 = { amount: 5000000, currency: "GBP" }.

## Important Rules

- Extract factual data only — do NOT interpret legal effect or give legal advice
- Do NOT infer beneficiary shares or entitlements beyond what is written
- Generate a short descriptive label for each entity
- If a name appears in multiple roles, create one person entity with all roles listed
- Record warnings for anything ambiguous, contradictory, or potentially significant
```

### Tool Schema

Use this `tool_use` schema when calling an LLM for extraction. The format is Anthropic tool_use; adapt for other providers as needed.

```json
{
  "name": "submit_extraction",
  "description": "Submit the structured extraction of entities from the will text",
  "input_schema": {
    "type": "object",
    "properties": {
      "entities": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "person", "property", "asset", "liability",
                "bequest", "executor", "guardian", "wish"
              ]
            },
            "data": { "type": "object", "additionalProperties": true },
            "confidence": { "type": "string", "enum": ["high", "medium", "low"] },
            "source": { "type": "string" },
            "label": { "type": "string" }
          },
          "required": ["type", "data", "confidence", "source", "label"]
        }
      },
      "warnings": { "type": "array", "items": { "type": "string" } },
      "jurisdiction": {
        "type": "object",
        "properties": {
          "country": { "type": "string" },
          "subdivision": { "type": "string" }
        },
        "required": ["country"]
      },
      "willType": {
        "type": "string",
        "enum": ["secular", "religious", "dual"]
      }
    },
    "required": ["entities", "warnings"]
  }
}
```

### Entity Types to Extract

| Entity Type | What to Look For | Example Text | Expected Extraction |
|-------------|-----------------|--------------|---------------------|
| **person** | Any named individual | "I, Margaret Chen, of 14 Elm Road..." | `{ givenName: "Margaret", familyName: "Chen", roles: ["testator"] }` |
| **property** | Real estate, land | "my freehold property at 14 Elm Road, Bristol" | `{ name: "14 Elm Road, Bristol", tenure: "freehold" }` |
| **asset** | Financial, personal items | "my Barclays savings account (sort code 20-45-67)" | `{ name: "Barclays savings account", category: "bank_account" }` |
| **liability** | Debts, mortgages | "the outstanding mortgage with Halifax" | `{ liabilityType: "mortgage", creditor: "Halifax" }` |
| **bequest** | Gifts, shares | "I give £50,000 to my son David" | `{ bequestType: "pecuniary", amount: { amount: 5000000, currency: "GBP" } }` |
| **executor** | Appointed administrators | "I appoint my wife Susan as executor" | `{ role: "primary" }` (+ person with executor role) |
| **guardian** | Child guardians | "I appoint my sister Jane as guardian of my children" | `{ role: "guardian", appointmentType: "primary" }` (+ person) |
| **wish** | Non-binding preferences | "I wish to be cremated" | `{ wishType: "funeral", title: "Cremation wish" }` |

### Confidence Scoring

| Level | When to Use | Example |
|-------|------------|---------|
| **high** | Explicitly stated in clear, unambiguous terms | "I give my house at 14 Elm Road to my daughter Sarah" |
| **medium** | Reasonably inferred from context | "my home" (address not stated but inferable from earlier in the document) |
| **low** | Ambiguous, incomplete, or uncertain | "my personal effects" (unclear what items are included) |

### Post-Extraction Assembly

After the LLM returns extracted entities, assemble a valid INHERIT document:

1. **Generate v4 UUIDs** for every entity's `id` field
2. **Resolve cross-references** — set `bequest.beneficiaryId` to the correct person's UUID, `executor.personId` to the person's UUID, etc.
3. **Set `estate.testatorPersonId`** to the UUID of the person with role `testator`
4. **Fill all 15 entity arrays** — place extracted entities in their arrays; use empty arrays for types with no extracted data
5. **Wrap in the root envelope:**
   ```json
   {
     "inherit": "https://openinherit.org/v1/schema.json",
     "version": 1,
     "exportedAt": "2026-03-27",
     "generator": { "name": "Your App", "version": "1.0.0" }
   }
   ```
6. **Validate** the assembled document against the schema (see [Validation Patterns](#validation-patterns))

See [`examples/extract-entities.ts`](../examples/extract-entities.ts) for a complete runnable example.

### Model Recommendations

- **Entity extraction:** Use `claude-sonnet-4-5` or any model supporting tool_use. The system prompt and tool schema above work across providers.
- **Building documents:** Any model that can follow JSON Schema constraints. Provide the schema inline or as a reference.
- **Validation:** Always use AJV or the web validator after generation. Do not rely on the LLM to self-validate — models hallucinate valid-looking but invalid JSON.

---

## Section 3: Guardrails

### What INHERIT Is NOT

- **Not legal advice.** INHERIT is a data format. It does not interpret wills, assess validity, or recommend actions.
- **Not a database schema.** It is an interchange format — your application's internal data model may differ.
- **Not a UI framework.** INHERIT defines data structure, not presentation.
- **Not a complete estate plan.** An INHERIT document captures structured data; it does not replace professional legal counsel.

### Generation Rules

When generating or modifying INHERIT documents programmatically or via AI:

1. Every `id` **MUST** be a valid v4 UUID
2. Every monetary amount **MUST** be an integer in minor units (pennies/cents)
3. Every date **MUST** be ISO 8601 format (`YYYY-MM-DD`)
4. Every person referenced anywhere **MUST** exist in the `people` array
5. The `estate` **MUST** have a `testatorPersonId` that matches a person with role `testator`
6. All 15 entity arrays **MUST** be present (empty arrays are valid)
7. `unevaluatedProperties: false` means no extra fields — the schema rejects undeclared properties

### Validation Strategy

| Task | Recommended Approach |
|------|---------------------|
| Entity extraction | Any model with tool_use support |
| Building documents | Any model that can follow JSON Schema constraints |
| **Validation** | **AJV or the web validator — never the LLM** |

LLMs are excellent at extraction and generation but unreliable at self-validation. Always validate the output with a deterministic JSON Schema validator.
