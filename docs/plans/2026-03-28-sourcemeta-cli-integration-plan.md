# Sourcemeta JSON Schema CLI Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the Sourcemeta JSON Schema CLI as the primary schema quality tool — linting, formatting, metaschema validation, and testing — replacing the bespoke AJV test runner and covering all 32 core schemas.

**Architecture:** Create a `dialect.json` metaschema (with `format-assertion` enabled) so the CLI can resolve INHERIT's custom `$schema`. Create a `jsonschema.json` project manifest. Migrate 33 existing tests to Sourcemeta format, expand to 32 schemas, fix lint violations (including adding missing `title` keywords and `$comment` specification links), add package.json scripts.

**Informed by:** Juan Cruz Viotti & Ron Itelman, *Unifying Business, Data, and Code* (O'Reilly, 2024) — Chapter 12 (four facets of a data product: Data, Structure, Meaning, Context) and Chapter 13 (extending JSON Schema). Also https://www.learnjsonschema.com/2020-12/.

**Tech Stack:** Sourcemeta JSON Schema CLI v14.17.0, JSON Schema 2020-12, pnpm.

**Spec:** `docs/specs/2026-03-28-sourcemeta-cli-integration-design.md`

**Repo:** `/home/richardd/projects/openinherit` (aliased as $SPEC)

**Key discovery from prototyping:**
- All INHERIT schemas use `$schema: "https://openinherit.org/v1/dialect.json"` but `dialect.json` doesn't exist as a file. The CLI needs it to resolve metaschemas. Task 1 creates it.
- `v1/context/` contains non-schema JSON files (JSON-LD). The CLI chokes on these when `--resolve v1/` is used. Must resolve `v1/common/` and individual entity schemas separately, or use the `jsonschema.json` manifest's `ignore` field.
- Lint findings (prototyped): 909 `description_trailing_period`, 264 `enum_with_type`, 31 `top_level_examples`, 29 `invalid_external_ref`, 24 `empty_object_as_true`, 8 `const_with_type`, 6 `unnecessary_allof_wrapper`, 2 `simple_properties_identifiers`, 1 `oneof_to_anyof_disjoint_types`.
- Test `target` paths are relative to the test file location. From `tests/v1/money/money.test.json`, use `../../../v1/common/money.json`.

---

## Phase 1: CLI Infrastructure

### Task 1: Create dialect.json

Every INHERIT schema references `$schema: "https://openinherit.org/v1/dialect.json"` but this file has never existed. The Sourcemeta CLI needs it to resolve metaschemas.

**Design decision — `format-assertion` vocabulary:** JSON Schema 2020-12 treats `format` as annotation-only by default. INHERIT uses `format: "uuid"`, `format: "email"`, `format: "date-time"`, and `format: "uri"` extensively, and the existing AJV runner has `validateFormats: true`. To make format validation part of the spec (not just an AJV configuration choice), the dialect declares `format-assertion: true`. This means any compliant implementation MUST validate format keywords. Per learnjsonschema.com: "To enforce format validation, your custom metaschema must explicitly opt in."

**Files:**
- Create: `$SPEC/v1/dialect.json`

- [ ] **Step 1: Create dialect.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://openinherit.org/v1/dialect.json",
  "$vocabulary": {
    "https://json-schema.org/draft/2020-12/vocab/core": true,
    "https://json-schema.org/draft/2020-12/vocab/applicator": true,
    "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
    "https://json-schema.org/draft/2020-12/vocab/validation": true,
    "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
    "https://json-schema.org/draft/2020-12/vocab/format-assertion": true,
    "https://json-schema.org/draft/2020-12/vocab/content": true
  },
  "title": "INHERIT v1 Dialect",
  "description": "Custom metaschema for the INHERIT v1 schema suite. Extends JSON Schema 2020-12 with format-assertion enabled — format keywords (uuid, email, date-time, uri) are validated, not just annotated. Exists so that the Sourcemeta CLI and other schema-aware tooling can resolve the $schema reference.",
  "allOf": [
    { "$ref": "https://json-schema.org/draft/2020-12/schema" }
  ]
}
```

Note: the key change from a vanilla 2020-12 dialect is `format-assertion` instead of `format-annotation`. This makes `format` a validation keyword, matching INHERIT's existing AJV behaviour (`validateFormats: true`).

- [ ] **Step 2: Verify the CLI can now resolve metaschemas**

```bash
cd $SPEC && jsonschema metaschema v1/common/money.json --resolve v1/dialect.json --resolve v1/common/
```

Expected: no output (clean pass).

- [ ] **Step 3: Mirror sync and commit**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
git add v1/dialect.json packages/schema/v1/dialect.json
git commit -m "feat: add dialect.json metaschema — enables Sourcemeta CLI tooling"
```

---

### Task 2: Create jsonschema.json manifest and package scripts

**Files:**
- Create: `$SPEC/jsonschema.json`
- Modify: `$SPEC/package.json`

- [ ] **Step 1: Create jsonschema.json**

```json
{
  "title": "INHERIT v1 Schema",
  "description": "Open data standard for estate, inheritance, and catalogue data",
  "github": "openinherit/openinherit",
  "website": "https://openinherit.org",
  "defaultDialect": "https://openinherit.org/v1/dialect.json",
  "path": "./v1",
  "extension": [".json"],
  "ignore": ["./v1/context"]
}
```

- [ ] **Step 2: Test that the CLI uses the manifest**

```bash
cd $SPEC && jsonschema metaschema v1/common/money.json
```

If the manifest is picked up, this should work without `--resolve` flags. If it still fails (the manifest feature is experimental), we fall back to explicit `--resolve` flags in package scripts. Test and note the result.

- [ ] **Step 3: Add package.json scripts**

Add these scripts (adjust `--resolve` flags based on Step 2 results):

If the manifest works (no `--resolve` needed):
```json
{
  "lint:schema": "jsonschema lint v1/*.json v1/common/*.json",
  "fmt:schema": "jsonschema fmt --check --keep-ordering v1/*.json v1/common/*.json",
  "metaschema": "jsonschema metaschema v1/*.json v1/common/*.json"
}
```

If the manifest does NOT handle resolve (fallback):
```json
{
  "lint:schema": "jsonschema lint v1/*.json v1/common/*.json --resolve v1/dialect.json --resolve v1/common/",
  "fmt:schema": "jsonschema fmt --check --keep-ordering v1/*.json v1/common/*.json",
  "metaschema": "jsonschema metaschema v1/*.json v1/common/*.json --resolve v1/dialect.json --resolve v1/common/"
}
```

- [ ] **Step 4: Verify all three commands run**

```bash
cd $SPEC && pnpm run metaschema
cd $SPEC && pnpm run fmt:schema
cd $SPEC && pnpm run lint:schema
```

`metaschema` and `fmt:schema` should pass (or report fixable issues). `lint:schema` will report violations — that's expected, we fix them in Task 3.

- [ ] **Step 5: Commit**

```bash
cd $SPEC && git add jsonschema.json package.json
git commit -m "feat: add Sourcemeta CLI manifest and schema quality scripts"
```

---

## Phase 2: Lint Triage and Fixes

### Task 3: Fix lint violations and improve schema annotations

The lint discovery run found these violation counts:

| Rule | Count | Action |
|------|-------|--------|
| `description_trailing_period` | 909 | **Fix** — `--fix` auto-removes trailing periods |
| `enum_with_type` | 264 | **Fix** — `--fix` removes redundant `type` alongside `enum` |
| `top_level_examples` | 31 | **Exclude** — INHERIT uses separate fixture files, not inline examples on root schemas |
| `top_level_title` | ? | **Fix** — add `title` to any schema missing it (see Step 1b below) |
| `invalid_external_ref` | 29 | **Fix** — caused by incomplete `--resolve`; once dialect.json and all schemas are resolvable, these should disappear. Any remaining are genuine broken refs to fix. |
| `empty_object_as_true` | 24 | **Exclude** — these are `"^x-inherit-": {}` pattern properties. The `{}` is intentional (accept anything for extension properties). Suppress with `x-lint-exclude`. |
| `const_with_type` | 8 | **Fix** — `--fix` removes redundant `type` alongside `const` |
| `unnecessary_allof_wrapper` | 6 | **Fix** — `--fix` unwraps single-element `allOf` |
| `simple_properties_identifiers` | 2 | **Investigate** — check which property names are flagged, decide if rename is appropriate |
| `oneof_to_anyof_disjoint_types` | 1 | **Fix** — simplify to `anyOf` if types are disjoint |

**Additional improvements from Itelman & Viotti, Chapter 12:**

The *meaning* facet of a data product requires every schema to carry annotation metadata — `title`, `description`, and `examples`. Chapter 12 recommends: "Use a noun for `title`, similar to how you would name a class in an object-oriented programming language." It also demonstrates using `$comment` to link to external specifications (ISO standards, IETF RFCs) that define the concepts a schema models. These annotations help both humans and AI agents understand the schema's intent.

**Files:**
- Modify: All `$SPEC/v1/*.json` and `$SPEC/v1/common/*.json`

- [ ] **Step 1: Run --fix for auto-fixable rules**

```bash
cd $SPEC && jsonschema lint v1/*.json v1/common/*.json \
  --resolve v1/dialect.json --resolve v1/common/ \
  --fix --format
```

This auto-fixes: `description_trailing_period`, `enum_with_type`, `const_with_type`, `unnecessary_allof_wrapper`, `oneof_to_anyof_disjoint_types`.

- [ ] **Step 2: Verify the auto-fix didn't break anything**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
```

All 33 existing tests must still pass. Also run the AJV fixture validation:

```bash
cd $SPEC && node -e "
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');
const ajv = new Ajv({strict: false, allErrors: true});
addFormats(ajv);
function loadDir(dir) { for (const f of fs.readdirSync(dir)) { const full = path.join(dir, f); if (fs.statSync(full).isDirectory()) loadDir(full); else if (f.endsWith('.json') && f !== 'extension.json') { try { const s = JSON.parse(fs.readFileSync(full, 'utf8')); if (s.\$id) ajv.addSchema(s); } catch {} } } }
loadDir('v1');
for (const f of fs.readdirSync('examples/fixtures').filter(x=>x.endsWith('.json') && x !== 'catalogue-only.json')) {
  const data = JSON.parse(fs.readFileSync(path.join('examples/fixtures',f),'utf8'));
  const validate = ajv.getSchema('https://openinherit.org/v1/schema.json');
  const valid = validate(data);
  console.log(valid ? 'PASS: '+f : 'FAIL: '+f+' — '+validate.errors.slice(0,3).map(e=>e.instancePath+' '+e.message).join('; '));
}
const catData = JSON.parse(fs.readFileSync('examples/fixtures/catalogue-only.json','utf8'));
const catValidate = ajv.getSchema('https://openinherit.org/v1/catalogue.json');
if (catValidate) {
  const valid = catValidate(catData);
  console.log(valid ? 'PASS: catalogue-only.json' : 'FAIL: catalogue-only.json — '+catValidate.errors.slice(0,3).map(e=>e.instancePath+' '+e.message).join('; '));
}
"
```

All 11 fixtures must pass.

- [ ] **Step 3: Handle empty_object_as_true exclusions**

The `"^x-inherit-": {}` pattern properties appear across ~24 schemas. Add `x-lint-exclude` to each `patternProperties` block. Use a script:

```bash
cd $SPEC && python3 -c "
import json, os, glob

for path in sorted(glob.glob('v1/*.json') + glob.glob('v1/common/*.json')):
    with open(path) as f:
        s = json.load(f)
    changed = False
    pp = s.get('patternProperties', {})
    if '^x-inherit-' in pp and pp['^x-inherit-'] == {}:
        pp['^x-inherit-'] = {
            'x-lint-exclude': ['empty_object_as_true']
        }
        changed = True
    if changed:
        with open(path, 'w') as f:
            json.dump(s, f, indent=2)
            f.write('\n')
        print(f'FIXED: {path}')
"
```

- [ ] **Step 4: Investigate simple_properties_identifiers**

```bash
cd $SPEC && jsonschema lint v1/*.json v1/common/*.json \
  --resolve v1/dialect.json --resolve v1/common/ \
  --only simple_properties_identifiers 2>&1
```

Check which property names are flagged. If they are intentional (e.g. camelCase matching Schema.org conventions), exclude them. If they are genuine naming issues, fix them.

- [ ] **Step 5: Add missing `title` to any schema that lacks it**

Per Itelman & Viotti Ch.12: every schema should have a `title` — "a preferably short description about the purpose of the instance described by the schema." Use a noun, like a class name.

```bash
cd $SPEC && python3 -c "
import json, os, glob

for path in sorted(glob.glob('v1/*.json') + glob.glob('v1/common/*.json')):
    with open(path) as f:
        s = json.load(f)
    if 'title' not in s:
        print(f'MISSING title: {path}')
"
```

For each schema missing `title`, add one. Examples:
- `money.json` → `"title": "Money"` (already has it)
- `address.json` → `"title": "Address"`
- `asset-interest.json` → `"title": "Asset Interest"`

Use the entity name as a noun. Do NOT exclude `top_level_title` — fix the schemas instead.

- [ ] **Step 6: Add `$comment` specification links to standards-referencing schemas**

Per Itelman & Viotti Ch.12: use `$comment` to link to the external specification that defines a concept. This helps developers and AI agents understand what standard a schema implements.

Add `$comment` to schemas and fields that reference well-known standards:

```bash
cd $SPEC && python3 -c "
# Standards to link via \$comment
standards = {
    'v1/common/money.json': 'https://www.iso.org/iso-4217-currency-codes.html',  # check if already present
    'v1/common/jurisdiction.json': 'https://www.iso.org/iso-3166-country-codes.html',
    'v1/common/address.json': 'https://schema.org/PostalAddress',
}
import json
for path, url in standards.items():
    s = json.load(open(path))
    has_comment = '\$comment' in s
    print(f'{path}: \$comment={\"exists\" if has_comment else \"MISSING\"} (should link to {url})')
"
```

For each schema missing a `$comment` link, add one at the root level. If the schema already has a `$comment`, append the URL or leave it if already adequate. Only add `$comment` where there is a clear external standard — do not invent links.

- [ ] **Step 7: Run lint again — verify clean (with expected exclusions)**

```bash
cd $SPEC && jsonschema lint v1/*.json v1/common/*.json \
  --resolve v1/dialect.json --resolve v1/common/ \
  --exclude top_level_examples
```

Expected: zero violations. The `top_level_examples` rule is excluded globally because INHERIT uses separate fixture files. The `top_level_title` rule should now pass (all schemas have `title`).

- [ ] **Step 8: Update the lint:schema script to include the global exclusion**

Update the `lint:schema` script in package.json to add `--exclude top_level_examples`.

- [ ] **Step 9: Mirror sync, verify tests + fixtures, commit**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
cd $SPEC && git add -A
git commit -m "fix: resolve all Sourcemeta lint violations — trailing periods, redundant types, titles, $comment links"
```

---

## Phase 3: Migrate Existing Tests

### Task 4: Convert 5 existing test files to Sourcemeta format

The current AJV format wraps tests in an array of suite objects:
```json
[{ "description": "...", "schema": { "$ref": "..." }, "tests": [...] }]
```

The Sourcemeta format uses:
```json
{ "target": "relative/path/to/schema.json", "tests": [...] }
```

The `tests` array items are identical (`description`, `data`, `valid`), so only the wrapper changes.

**Files:**
- Modify: `$SPEC/tests/v1/money/money.json` → rename to `money.test.json`
- Modify: `$SPEC/tests/v1/person/person.json` → rename to `person.test.json`
- Modify: `$SPEC/tests/v1/bequest/bequest.json` → rename to `bequest.test.json`
- Modify: `$SPEC/tests/v1/estate/estate.json` → rename to `estate.test.json`
- Modify: `$SPEC/tests/v1/jurisdiction/jurisdiction.json` → rename to `jurisdiction.test.json`

- [ ] **Step 1: Convert all 5 test files**

```bash
cd $SPEC && python3 -c "
import json, os

conversions = {
    'tests/v1/money/money.json': {
        'target': '../../../v1/common/money.json',
        'schema_ref': 'https://openinherit.org/v1/common/money.json'
    },
    'tests/v1/person/person.json': {
        'target': '../../../v1/person.json',
        'schema_ref': 'https://openinherit.org/v1/person.json'
    },
    'tests/v1/bequest/bequest.json': {
        'target': '../../../v1/bequest.json',
        'schema_ref': 'https://openinherit.org/v1/bequest.json'
    },
    'tests/v1/estate/estate.json': {
        'target': '../../../v1/estate.json',
        'schema_ref': 'https://openinherit.org/v1/estate.json'
    },
    'tests/v1/jurisdiction/jurisdiction.json': {
        'target': '../../../v1/common/jurisdiction.json',
        'schema_ref': 'https://openinherit.org/v1/common/jurisdiction.json'
    }
}

for old_path, info in conversions.items():
    with open(old_path) as f:
        old = json.load(f)

    # Old format is an array of suite objects; take the first suite's tests
    tests = old[0]['tests']

    new = {
        'target': info['target'],
        'tests': tests
    }

    new_path = old_path.replace('.json', '.test.json')
    with open(new_path, 'w') as f:
        json.dump(new, f, indent=2)
        f.write('\n')

    os.remove(old_path)
    print(f'Converted: {old_path} -> {new_path} ({len(tests)} tests)')
"
```

- [ ] **Step 2: Verify the converted tests pass with Sourcemeta CLI**

```bash
cd $SPEC && jsonschema test tests/ --resolve v1/dialect.json --resolve v1/ --extension .test.json
```

Expected: `PASS 33/33` across 5 test files.

- [ ] **Step 3: Update the test script in package.json**

Replace the `test` script:

```json
"test": "jsonschema test tests/ --resolve v1/dialect.json --resolve v1/ --extension .test.json"
```

- [ ] **Step 4: Verify pnpm test works**

```bash
cd $SPEC && pnpm test
```

Expected: same 33 tests pass.

- [ ] **Step 5: Commit**

```bash
cd $SPEC && git add -A
git commit -m "feat: migrate 33 tests to Sourcemeta format — retire bespoke AJV runner"
```

---

## Phase 4: Expand Test Coverage

### Task 5: Tests for common types (4 new test files)

Write tests for the 4 common types that don't have tests yet: `address`, `completeness`, `identifier`, `media`. (`money` and `jurisdiction` already have tests; `tax-position`, `temporal-rule`, and `visibility` are complex/minimal types — cover in Task 7.)

**Files:**
- Create: `$SPEC/tests/v1/address/address.test.json`
- Create: `$SPEC/tests/v1/completeness/completeness.test.json`
- Create: `$SPEC/tests/v1/identifier/identifier.test.json`
- Create: `$SPEC/tests/v1/media/media.test.json`

- [ ] **Step 1: Read the schemas**

```bash
cd $SPEC && for s in address completeness identifier media; do
  echo "=== $s ==="
  python3 -c "import json; s=json.load(open('v1/common/$s.json')); print('required:', s.get('required',[])); print('properties:', list(s.get('properties',{}).keys()))"
done
```

- [ ] **Step 2: Create address.test.json**

```json
{
  "target": "../../../v1/common/address.json",
  "tests": [
    {
      "description": "valid address with all fields",
      "valid": true,
      "data": {
        "formattedAddress": "42 Priory Road, London NW6 3RJ, United Kingdom",
        "streetAddress": "42 Priory Road",
        "addressLocality": "London",
        "addressRegion": "Greater London",
        "postalCode": "NW6 3RJ",
        "addressCountry": "GB"
      }
    },
    {
      "description": "valid minimal address — no required fields, empty is valid",
      "valid": true,
      "data": {}
    },
    {
      "description": "valid address with formattedAddress only",
      "valid": true,
      "data": {
        "formattedAddress": "1-2-3 Chiyoda, Tokyo 100-0001, Japan"
      }
    },
    {
      "description": "invalid — streetAddress must be string",
      "valid": false,
      "data": {
        "streetAddress": 42
      }
    },
    {
      "description": "invalid — addressCountry must be string",
      "valid": false,
      "data": {
        "addressCountry": 123
      }
    }
  ]
}
```

- [ ] **Step 3: Create completeness.test.json**

Read `v1/common/completeness.json` to understand the required fields (`score`, `maxScore`, `checklist`) and the checklist item structure, then write:

```json
{
  "target": "../../../v1/common/completeness.json",
  "tests": [
    {
      "description": "valid completeness with required fields",
      "valid": true,
      "data": {
        "score": 65,
        "maxScore": 100,
        "checklist": [
          {
            "category": "assets_and_valuations",
            "item": "Items catalogued",
            "weight": 10,
            "status": "complete"
          }
        ]
      }
    },
    {
      "description": "valid completeness with all optional fields",
      "valid": true,
      "data": {
        "score": 80,
        "maxScore": 100,
        "jurisdiction": { "country": "GB" },
        "estateStatus": "pre_probate",
        "calculatedAt": "2026-03-28T12:00:00Z",
        "checklist": [
          {
            "category": "assets_and_valuations",
            "item": "Items catalogued",
            "weight": 10,
            "status": "complete"
          },
          {
            "category": "pension_and_insurance",
            "item": "Insurance documented",
            "weight": 5,
            "status": "incomplete",
            "details": "No insurance docs attached"
          }
        ]
      }
    },
    {
      "description": "invalid — missing score",
      "valid": false,
      "data": {
        "maxScore": 100,
        "checklist": []
      }
    },
    {
      "description": "invalid — missing checklist",
      "valid": false,
      "data": {
        "score": 50,
        "maxScore": 100
      }
    }
  ]
}
```

- [ ] **Step 4: Create identifier.test.json**

```json
{
  "target": "../../../v1/common/identifier.json",
  "tests": [
    {
      "description": "valid identifier with value only (minimum required)",
      "valid": true,
      "data": {
        "value": "R3456"
      }
    },
    {
      "description": "valid identifier with all fields",
      "valid": true,
      "data": {
        "system": "https://hornby.com/catalogue",
        "value": "R3456",
        "type": "catalogue_number"
      }
    },
    {
      "description": "invalid — missing required value",
      "valid": false,
      "data": {
        "system": "https://hornby.com/catalogue"
      }
    },
    {
      "description": "invalid — value must be string",
      "valid": false,
      "data": {
        "value": 12345
      }
    }
  ]
}
```

- [ ] **Step 5: Create media.test.json**

```json
{
  "target": "../../../v1/common/media.json",
  "tests": [
    {
      "description": "valid media with url only (minimum required)",
      "valid": true,
      "data": {
        "url": "https://example.com/photo.jpg"
      }
    },
    {
      "description": "valid media with all fields",
      "valid": true,
      "data": {
        "url": "https://example.com/photo.jpg",
        "caption": "Front view of Hornby R3456",
        "mediaType": "image/jpeg",
        "viewType": "front",
        "takenAt": "2026-03-28"
      }
    },
    {
      "description": "invalid — missing required url",
      "valid": false,
      "data": {
        "caption": "A photo"
      }
    },
    {
      "description": "invalid — url must be string",
      "valid": false,
      "data": {
        "url": 12345
      }
    }
  ]
}
```

- [ ] **Step 6: Run all tests**

```bash
cd $SPEC && jsonschema test tests/ --resolve v1/dialect.json --resolve v1/ --extension .test.json
```

Expected: 33 existing + ~17 new = ~50 tests, all pass.

- [ ] **Step 7: Commit**

```bash
cd $SPEC && git add tests/
git commit -m "test: add Sourcemeta tests for address, completeness, identifier, media"
```

---

### Task 6: Tests for entity schemas (batch 1 — 9 schemas)

Write tests for: `asset`, `asset-collection`, `asset-interest`, `document`, `executor`, `guardian`, `valuation`, `wish`, `catalogue`.

**Files:**
- Create: `$SPEC/tests/v1/asset/asset.test.json`
- Create: `$SPEC/tests/v1/asset-collection/asset-collection.test.json`
- Create: `$SPEC/tests/v1/asset-interest/asset-interest.test.json`
- Create: `$SPEC/tests/v1/document/document.test.json`
- Create: `$SPEC/tests/v1/executor/executor.test.json`
- Create: `$SPEC/tests/v1/guardian/guardian.test.json`
- Create: `$SPEC/tests/v1/valuation/valuation.test.json`
- Create: `$SPEC/tests/v1/wish/wish.test.json`
- Create: `$SPEC/tests/v1/catalogue/catalogue.test.json`

- [ ] **Step 1: Read all 9 schemas to understand required fields and types**

```bash
cd $SPEC && for s in asset asset-collection asset-interest document executor guardian valuation wish catalogue; do
  echo "=== $s ==="
  python3 -c "
import json
s = json.load(open('v1/$s.json'))
print('required:', s.get('required', []))
props = s.get('properties', {})
for k, v in list(props.items())[:8]:
    t = v.get('type', v.get('enum', v.get('\$ref', '???')))
    print(f'  {k}: {t}')
"
done
```

- [ ] **Step 2: Create test files**

For each schema, write a test file following this pattern:
- 1 valid minimal test (required fields only, using valid UUIDs and enum values)
- 1 valid fully-populated test (all optional fields filled)
- 2-3 invalid tests (missing required fields, wrong types, invalid enum values)

The `target` path is `../../../v1/{schema-name}.json` for entity schemas.

**Key test data for each:**

**asset.test.json** — required: `id`, `name`, `category`. Must test v1.3.0 fields: `searchTerms`, `comparableSearchProfile`, `confidenceScores`, `valuationReliability`, `lastVerifiedAt`, `verifiedBy`, `suggestedSubcategory`. Include a valid test with all new fields populated and an invalid test with `confidenceScores` containing a value > 100.

**asset-collection.test.json** — required: `id`, `estateId`, `name`.

**asset-interest.test.json** — required: `id`, `estateId`, `personId`, `interestLevel`.

**document.test.json** — required: `id`, `type`, `title`.

**executor.test.json** — required: `id`, `personId`, `role`.

**guardian.test.json** — required: `id`, `personId`, `childPersonId`, `role`, `appointmentType`.

**valuation.test.json** — required: `id`, `entityType`, `entityId`, `valuedAmount`, `valuationDate`. Must test v1.3.0 fields on comparables: `matchScore`, `humanVerdict`, `rejectionReason`.

**wish.test.json** — required: `id`, `wishType`, `title`.

**catalogue.test.json** — required: `inherit`, `version`, `assets`. Must test `legacyContacts` and v1.3.0 agent fields on embedded assets.

- [ ] **Step 3: Run all tests**

```bash
cd $SPEC && jsonschema test tests/ --resolve v1/dialect.json --resolve v1/ --extension .test.json
```

All tests must pass.

- [ ] **Step 4: Commit**

```bash
cd $SPEC && git add tests/
git commit -m "test: add Sourcemeta tests for asset, asset-collection, asset-interest, document, executor, guardian, valuation, wish, catalogue"
```

---

### Task 7: Tests for entity schemas (batch 2 — 9 schemas)

Write tests for: `kinship`, `liability`, `lifetime-transfer`, `nonprobate-transfer`, `property`, `proxy-authorisation`, `relationship`, `trust`, `dealer-interest`.

Also cover the remaining 3 common types: `tax-position`, `temporal-rule`, `visibility`.

**Files:**
- Create: `$SPEC/tests/v1/kinship/kinship.test.json`
- Create: `$SPEC/tests/v1/liability/liability.test.json`
- Create: `$SPEC/tests/v1/lifetime-transfer/lifetime-transfer.test.json`
- Create: `$SPEC/tests/v1/nonprobate-transfer/nonprobate-transfer.test.json`
- Create: `$SPEC/tests/v1/property/property.test.json`
- Create: `$SPEC/tests/v1/proxy-authorisation/proxy-authorisation.test.json`
- Create: `$SPEC/tests/v1/relationship/relationship.test.json`
- Create: `$SPEC/tests/v1/trust/trust.test.json`
- Create: `$SPEC/tests/v1/dealer-interest/dealer-interest.test.json`
- Create: `$SPEC/tests/v1/tax-position/tax-position.test.json`
- Create: `$SPEC/tests/v1/temporal-rule/temporal-rule.test.json`
- Create: `$SPEC/tests/v1/visibility/visibility.test.json`

- [ ] **Step 1: Read all schemas to understand required fields**

```bash
cd $SPEC && for s in kinship liability lifetime-transfer nonprobate-transfer property proxy-authorisation relationship trust dealer-interest; do
  echo "=== $s ==="
  python3 -c "
import json
s = json.load(open('v1/$s.json'))
print('required:', s.get('required', []))
props = s.get('properties', {})
for k, v in list(props.items())[:6]:
    t = v.get('type', v.get('enum', v.get('\$ref', '???')))
    print(f'  {k}: {t}')
"
done

for s in tax-position temporal-rule visibility; do
  echo "=== common/$s ==="
  python3 -c "
import json
s = json.load(open('v1/common/$s.json'))
print('required:', s.get('required', []))
props = s.get('properties', {})
for k, v in list(props.items())[:6]:
    t = v.get('type', v.get('enum', v.get('\$ref', '???')))
    print(f'  {k}: {t}')
"
done
```

- [ ] **Step 2: Create test files**

Same pattern as Task 6: minimal valid, fully populated valid, 2-3 invalid cases per schema.

**Key required fields:**
- **kinship** — `id`, `kinshipType`, `fromPersonId`, `toPersonId`
- **liability** — `id`, `liabilityType`, `amount`
- **lifetime-transfer** — `id`, `transferDate`, `donorPersonId`, `transferType`
- **nonprobate-transfer** — `id`, `transferType`, `passesOutsideEstate`
- **property** — `id`, `name`
- **proxy-authorisation** — `id`, `proxyPersonId`, `testatorPersonId`, `scope`, `consentRecord`
- **relationship** — `id`, `type`, `partners`
- **trust** — `id`, `name`, `trustType`, `trustees`, `beneficiaries`
- **dealer-interest** — `id`, `interestedParty`, `offerStatus`, `privacyLevel`
- **tax-position** — `jurisdiction`, `calculatedAt`, `grossEstateValue`, `disclaimer`
- **temporal-rule** — `value`, `effectiveFrom`, `status`
- **visibility** — no required fields (test empty object is valid)

- [ ] **Step 3: Run all tests**

```bash
cd $SPEC && jsonschema test tests/ --resolve v1/dialect.json --resolve v1/ --extension .test.json
```

All tests must pass. Count should be ~100+ across 32 test files.

- [ ] **Step 4: Commit**

```bash
cd $SPEC && git add tests/
git commit -m "test: add Sourcemeta tests for remaining entities and common types — full 32-schema coverage"
```

---

### Task 8: Tests for root schema (schema.json)

The root schema is the most complex — 35 properties, 18 required arrays. It needs its own test file with careful attention to the deeply nested structure.

**Files:**
- Modify: `$SPEC/tests/v1/estate/estate.test.json` — already exists, covers `estate.json`
- Create: `$SPEC/tests/v1/schema/schema.test.json` — covers the root `schema.json`

- [ ] **Step 1: Read schema.json required fields**

```bash
cd $SPEC && python3 -c "
import json
s = json.load(open('v1/schema.json'))
print('required:', s['required'])
print('total properties:', len(s['properties']))
"
```

- [ ] **Step 2: Create schema.test.json**

The root schema requires: `inherit`, `version`, `estate`, `people`, `kinships`, `relationships`, `properties`, `assets`, `liabilities`, `bequests`, `trusts`, `executors`, `guardians`, `wishes`, `documents`, `nonprobateTransfers`, `proxyAuthorisations`, `dealerInterests`.

Write tests:
- Valid minimal (all required arrays empty, valid estate with minimum fields, valid `inherit` const, valid `version` const)
- Valid with `@context` and `legacyContacts` (v1.3.0 fields)
- Invalid — missing `inherit`
- Invalid — wrong `inherit` value (not the const)
- Invalid — missing `estate`
- Invalid — `legacyContacts` item missing required `accessLevel`

- [ ] **Step 3: Run all tests**

```bash
cd $SPEC && jsonschema test tests/ --resolve v1/dialect.json --resolve v1/ --extension .test.json
```

- [ ] **Step 4: Commit**

```bash
cd $SPEC && git add tests/
git commit -m "test: add Sourcemeta tests for root schema.json — legacyContacts, @context"
```

---

## Phase 5: Retire Old Runner, Final Validation

### Task 9: Delete old test runner and final verification

**Files:**
- Delete: `$SPEC/scripts/run-tests.mjs`

- [ ] **Step 1: Delete run-tests.mjs**

```bash
cd $SPEC && rm scripts/run-tests.mjs
```

- [ ] **Step 2: Run full verification suite**

```bash
cd $SPEC && echo "=== Metaschema ===" && pnpm run metaschema
cd $SPEC && echo "=== Lint ===" && pnpm run lint:schema
cd $SPEC && echo "=== Format ===" && pnpm run fmt:schema
cd $SPEC && echo "=== Tests ===" && pnpm test
cd $SPEC && echo "=== Fixture validation ===" && node -e "
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');
const ajv = new Ajv({strict: false, allErrors: true});
addFormats(ajv);
function loadDir(dir) { for (const f of fs.readdirSync(dir)) { const full = path.join(dir, f); if (fs.statSync(full).isDirectory()) loadDir(full); else if (f.endsWith('.json') && f !== 'extension.json') { try { const s = JSON.parse(fs.readFileSync(full, 'utf8')); if (s.\$id) ajv.addSchema(s); } catch {} } } }
loadDir('v1');
for (const f of fs.readdirSync('examples/fixtures').filter(x=>x.endsWith('.json') && x !== 'catalogue-only.json')) {
  const data = JSON.parse(fs.readFileSync(path.join('examples/fixtures',f),'utf8'));
  const validate = ajv.getSchema('https://openinherit.org/v1/schema.json');
  const valid = validate(data);
  console.log(valid ? 'PASS: '+f : 'FAIL: '+f+' — '+validate.errors.slice(0,3).map(e=>e.instancePath+' '+e.message).join('; '));
}
const catData = JSON.parse(fs.readFileSync('examples/fixtures/catalogue-only.json','utf8'));
const catValidate = ajv.getSchema('https://openinherit.org/v1/catalogue.json');
if (catValidate) {
  const valid = catValidate(catData);
  console.log(valid ? 'PASS: catalogue-only.json' : 'FAIL: catalogue-only.json — '+catValidate.errors.slice(0,3).map(e=>e.instancePath+' '+e.message).join('; '));
}
"
```

All must pass:
- Metaschema: clean
- Lint: clean (with `top_level_examples` excluded)
- Format: clean
- Tests: all ~100+ pass across 32 test files
- Fixtures: 11/11 pass

- [ ] **Step 3: Print test count summary**

```bash
cd $SPEC && jsonschema test tests/ --resolve v1/dialect.json --resolve v1/ --extension .test.json 2>&1 | tail -5
echo "---"
echo "Test files: $(find tests/v1 -name '*.test.json' | wc -l)"
echo "Schemas covered: $(find tests/v1 -name '*.test.json' | wc -l)"
```

- [ ] **Step 4: Mirror sync, commit, push**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && git add -A
git commit -m "feat: Sourcemeta CLI integration complete — 32 schemas tested, linted, formatted

Replaces bespoke AJV test runner with Sourcemeta JSON Schema CLI v14.17.0.
$(jsonschema test tests/ --resolve v1/dialect.json --resolve v1/ --extension .test.json 2>&1 | tail -1)
Lint: clean (top_level_examples excluded)
Format: clean (--keep-ordering)
Metaschema: clean"
git push origin main
```

---
