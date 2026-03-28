# AI-Native INHERIT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make INHERIT the most AI-friendly estate data standard — full JSON-LD linked data, agent decomposition fields, per-field confidence scores, multi-agent orchestration protocol, catalogue-only profile for living collectors, and cultural sensitivity audit.

**Architecture:** Schema changes to v1/asset.json, v1/valuation.json, v1/person.json, v1/schema.json. New root schema v1/catalogue.json. New JSON-LD context file. Five new reference data files. Cultural sensitivity doc committed and audited. All changes are additive — no breaking changes to existing documents.

**Tech Stack:** JSON Schema 2020-12, JSON-LD 1.1, Node.js (ajv for validation), pnpm test runner.

**Spec:** `docs/specs/2026-03-28-ai-native-inherit-design.md`

**Repos:**
- Spec: `/home/richardd/projects/openinherit` (aliased as $SPEC)
- Website: `/home/richardd/projects/openinheritorg` (aliased as $WEB)
- Submodule: `$WEB/content/spec`

**Build rules (mandatory after every task that touches v1/):**
```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
cd $SPEC && node -e "
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');
const ajv = new Ajv({strict: false, allErrors: true});
addFormats(ajv);
function loadDir(dir) { for (const f of fs.readdirSync(dir)) { const full = path.join(dir, f); if (fs.statSync(full).isDirectory()) loadDir(full); else if (f.endsWith('.json') && f !== 'extension.json') { try { const s = JSON.parse(fs.readFileSync(full, 'utf8')); if (s.\$id) ajv.addSchema(s); } catch {} } } }
loadDir('v1');
for (const f of fs.readdirSync('examples/fixtures').filter(x=>x.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join('examples/fixtures',f),'utf8'));
  const validate = ajv.getSchema('https://openinherit.org/v1/schema.json');
  const valid = validate(data);
  console.log(valid ? 'PASS: '+f : 'FAIL: '+f+' — '+validate.errors.slice(0,3).map(e=>e.instancePath+' '+e.message).join('; '));
}
"
```

---

## Phase 1: Schema Changes (asset.json, valuation.json, person.json, schema.json)

### Task 1: Agent Decomposition Fields on asset.json

**Files:**
- Modify: `$SPEC/v1/asset.json`

- [ ] **Step 1: Add searchTerms field**

After the `dataProvenance` field (near end of properties), add:

```json
"searchTerms": {
  "type": "array",
  "items": { "type": "string" },
  "description": "Keywords for marketplace search — AI-generated or human-curated. Memoization: once derived, cached here so subsequent agents reuse them instantly rather than re-deriving.",
  "examples": [["Hornby R3456", "Class 66 OO gauge", "EWS livery locomotive"]]
},
```

- [ ] **Step 2: Add comparableSearchProfile field**

```json
"comparableSearchProfile": {
  "type": "object",
  "description": "Structured search instructions for comparable-finding agents. Acts as agent memory — the item teaches future agents how to find its peers.",
  "properties": {
    "platforms": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Marketplaces and platforms to search.",
      "examples": [["ebay", "catawiki", "rails_of_sheffield", "hattons"]]
    },
    "searchQuery": {
      "type": "string",
      "description": "Natural-language query an agent should use.",
      "examples": ["Hornby R3456 Class 66 OO gauge boxed"]
    },
    "filters": {
      "type": "object",
      "description": "Key-value filters to narrow results. Agents map to platform-specific parameters.",
      "additionalProperties": { "type": "string" },
      "examples": [{"condition": "good+", "packaging": "with_box", "gauge": "OO"}]
    },
    "excludePlatforms": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Platforms explicitly excluded."
    },
    "lastSearchedAt": {
      "type": "string",
      "format": "date-time",
      "description": "When an agent last executed this search profile."
    },
    "searchFrequency": {
      "type": "string",
      "enum": ["once", "weekly", "monthly", "on_demand"],
      "$comment": "once: search once and cache. weekly: re-search weekly for price trends. monthly: monthly refresh. on_demand: only when explicitly triggered.",
      "description": "How often this item should be re-searched."
    }
  },
  "additionalProperties": false
},
```

- [ ] **Step 3: Add suggestedSubcategory field**

```json
"suggestedSubcategory": {
  "type": "string",
  "description": "AI-suggested subcategory refinement, kept separate from the human-set subcategory. Accepted when the user confirms. Provenance: always AI-generated."
},
```

- [ ] **Step 4: Run build rules**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
```

Expected: 33/33 tests pass (new fields are optional, no fixture changes needed yet).

- [ ] **Step 5: Commit**

```bash
cd $SPEC && git add v1/asset.json packages/schema/v1/asset.json
git commit -m "feat: add agent decomposition fields — searchTerms, comparableSearchProfile, suggestedSubcategory"
```

---

### Task 2: Confidence and Provenance Fields on asset.json

**Files:**
- Modify: `$SPEC/v1/asset.json`

- [ ] **Step 1: Add confidenceScores field**

```json
"confidenceScores": {
  "type": "object",
  "description": "Per-field confidence scores (0-100) from AI extraction. Allows agents and humans to see which fields are trusted vs need verification. Only present on AI-extracted entities.",
  "additionalProperties": {
    "type": "integer",
    "minimum": 0,
    "maximum": 100
  },
  "examples": [{"brand": 95, "model": 88, "category": 92, "subcategory": 65, "estimatedValue": 40}]
},
```

- [ ] **Step 2: Add valuationReliability field**

```json
"valuationReliability": {
  "type": "integer",
  "minimum": 0,
  "maximum": 100,
  "description": "Numeric reliability score (0-100) for the current valuation. Computed from: recency, method, corroborating comparables, variance between estimates. Companion to the categorical valuationConfidence enum — the enum captures source, this number captures trustworthiness now. Agents use this to prioritize which assets need re-valuation."
},
```

- [ ] **Step 3: Add lastVerifiedAt and verifiedBy fields**

```json
"lastVerifiedAt": {
  "type": "string",
  "format": "date-time",
  "description": "When this entity's data was last verified by a human or authoritative source. Agents use this to decide whether to trust existing values or re-derive them."
},
"verifiedBy": {
  "type": "string",
  "description": "Who or what verified this entity — a person's name, a tool, or 'owner'.",
  "examples": ["James Ashford", "INHERIT Scanner v2", "Rails of Sheffield (dealer)"]
},
```

- [ ] **Step 4: Run build rules, commit**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
cd $SPEC && git add v1/asset.json packages/schema/v1/asset.json
git commit -m "feat: add confidence/provenance — confidenceScores, valuationReliability, lastVerifiedAt, verifiedBy"
```

---

### Task 3: Enhanced Descriptions on asset.json

**Files:**
- Modify: `$SPEC/v1/asset.json`

- [ ] **Step 1: Enhance condition description**

Find the `condition` field and replace its `description` with:

```
"Physical condition of the asset. Affects resale value — dealers use this to price items. Pair with conditionSystem and conditionGrade for domain-specific grading. Use 'not_applicable' for financial assets where condition is meaningless."
```

- [ ] **Step 2: Enhance brand description**

Replace `brand` field description with:

```
"The manufacturer or brand name. AI agents should use this as a primary search dimension when finding comparables. Free text — implementations should offer category-aware suggestions from category-guidance.json, but any value is valid."
```

- [ ] **Step 3: Enhance model description**

Replace `model` field description with:

```
"The specific model, product line, or range name. Combined with brand and identifiers, this is the primary key for marketplace search. AI agents construct search queries from brand + model + subcategory."
```

- [ ] **Step 4: Enhance images description**

Replace `images` field description with:

```
"Photographs, videos, and document scans. Vision-capable AI agents use these to identify items, assess condition, and find visual matches on marketplaces. Use viewType from media.json to categorize each media item."
```

- [ ] **Step 5: Run build rules, commit**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
cd $SPEC && git add v1/asset.json packages/schema/v1/asset.json
git commit -m "feat: enhance asset field descriptions with AI agent guidance"
```

---

### Task 4: Valuation Comparable Extensions

**Files:**
- Modify: `$SPEC/v1/valuation.json`

- [ ] **Step 1: Read the current Comparable $def**

```bash
cd $SPEC && python3 -c "
import json
v = json.load(open('v1/valuation.json'))
comp = v['\$defs']['Comparable']
print(json.dumps(comp, indent=2)[:2000])
"
```

- [ ] **Step 2: Add matchScore to Comparable $def**

Add to the Comparable properties object:

```json
"matchScore": {
  "type": "integer",
  "minimum": 0,
  "maximum": 100,
  "description": "Numeric match confidence (0-100). Companion to the matchConfidence categorical enum. Agents use this for filtering and ranking — 'show me everything above 70' is quantitative reasoning that categorical enums don't support."
},
```

- [ ] **Step 3: Add humanVerdict and rejectionReason to Comparable $def**

```json
"humanVerdict": {
  "type": "string",
  "enum": ["accepted", "rejected", "adjusted", "not_reviewed"],
  "$comment": "accepted: human confirmed this is a good comparable. rejected: human said this is not comparable. adjusted: human accepted but modified the match. not_reviewed: no human has reviewed this yet.",
  "description": "Human feedback on this comparable. Creates the learning feedback loop — agents learn which comparables humans accept, improving future searches."
},
"rejectionReason": {
  "type": "string",
  "description": "Why this comparable was rejected. Feeds back into agent learning — future searches avoid this type of mismatch.",
  "examples": ["Wrong gauge — this is HO not OO", "Repainted model, not original livery"]
},
```

- [ ] **Step 4: Enhance comparables array description on valuation**

Find the `comparables` property on the main valuation properties and update its description to:

```
"Comparable items found on marketplaces — used to support the valuation. Agent-generated comparables should include matchScore for quantitative filtering and will accumulate humanVerdict feedback over time."
```

- [ ] **Step 5: Run build rules, commit**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
cd $SPEC && git add v1/valuation.json packages/schema/v1/valuation.json
git commit -m "feat: add matchScore, humanVerdict, rejectionReason on valuation comparables"
```

---

### Task 5: Confidence Scores on person.json

**Files:**
- Modify: `$SPEC/v1/person.json`

- [ ] **Step 1: Add confidenceScores to person.json**

Add the same `confidenceScores` object as on asset.json (identical schema). Place it after the `preferredChannel` field:

```json
"confidenceScores": {
  "type": "object",
  "description": "Per-field confidence scores (0-100) from AI extraction. Only present on AI-extracted people.",
  "additionalProperties": {
    "type": "integer",
    "minimum": 0,
    "maximum": 100
  },
  "examples": [{"givenName": 98, "familyName": 95, "roles": 85, "dateOfBirth": 30}]
},
```

- [ ] **Step 2: Run build rules, commit**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
cd $SPEC && git add v1/person.json packages/schema/v1/person.json
git commit -m "feat: add confidenceScores to person entity for AI extraction"
```

---

### Task 6: Root Schema — @context and legacyContacts

**Files:**
- Modify: `$SPEC/v1/schema.json`

- [ ] **Step 1: Add @context property**

Add before the `inherit` property (as the first property in the object):

```json
"@context": {
  "type": "string",
  "format": "uri",
  "description": "JSON-LD context URI. When present, this document can be processed by any JSON-LD processor as linked data. Maps INHERIT fields to Schema.org, FIBO, Wikidata, and GS1 vocabularies.",
  "examples": ["https://openinherit.org/v1/context/inherit-v1.jsonld"]
},
```

- [ ] **Step 2: Add legacyContacts array**

Add after `conformance` and before `extensions`:

```json
"legacyContacts": {
  "type": "array",
  "description": "People nominated to receive access to the estate data or catalogue when the account owner dies or becomes incapacitated. This is a digital inheritance concept, not a legal role — legacy contacts are notified and given access, not granted legal authority. The 'Please open when I have passed away' letter is generated by the application, not stored here.",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid",
        "description": "Unique identifier for this legacy contact."
      },
      "personId": {
        "type": "string",
        "format": "uuid",
        "description": "Reference to a Person.id, if the legacy contact is also in the people array."
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "description": "Display name — required because catalogue-only documents may not have a people array.",
        "examples": ["Paul Frith", "Sarah Davies"]
      },
      "relationship": {
        "type": "string",
        "description": "Relationship to the catalogue/estate owner.",
        "examples": ["son", "daughter", "partner", "friend", "solicitor"]
      },
      "email": {
        "type": "string",
        "format": "email",
        "description": "Email address for notification."
      },
      "phone": {
        "type": "string",
        "description": "Phone number."
      },
      "notificationMethod": {
        "type": "string",
        "enum": ["email", "phone", "post", "in_person"],
        "$comment": "email: send notification by email. phone: call or text. post: physical letter. in_person: notify face to face.",
        "description": "How to notify this person."
      },
      "accessLevel": {
        "type": "string",
        "enum": ["full", "read_only", "collection_only", "financial_only"],
        "$comment": "full: complete access to all data. read_only: can view but not modify. collection_only: can only see asset collections and items. financial_only: can only see financial information.",
        "description": "What level of access this person should receive."
      },
      "letterGenerated": {
        "type": "boolean",
        "description": "Whether the 'Please open when I have passed away' letter has been generated for this contact."
      },
      "letterGeneratedAt": {
        "type": "string",
        "format": "date-time",
        "description": "When the letter was last generated."
      },
      "letterDeliveryMethod": {
        "type": "string",
        "enum": ["printed", "digital", "both"],
        "description": "How the letter was or should be delivered."
      },
      "notes": {
        "type": "string",
        "description": "Additional notes about this legacy contact."
      }
    },
    "required": ["id", "name", "accessLevel"],
    "additionalProperties": false
  }
},
```

- [ ] **Step 3: Verify legacyContacts is NOT in the required array**

```bash
cd $SPEC && python3 -c "
import json
s = json.load(open('v1/schema.json'))
print('legacyContacts in required:', 'legacyContacts' in s.get('required', []))
print('@context in required:', '@context' in s.get('required', []))
"
```

Both must say False.

- [ ] **Step 4: Run build rules, commit**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
cd $SPEC && pnpm test
cd $SPEC && git add v1/schema.json packages/schema/v1/schema.json
git commit -m "feat: add @context (JSON-LD) and legacyContacts (#34) to root schema"
```

---

### Task 7: Catalogue-Only Root Schema

**Files:**
- Create: `$SPEC/v1/catalogue.json`

- [ ] **Step 1: Create v1/catalogue.json**

```json
{
  "$schema": "https://openinherit.org/v1/dialect.json",
  "$id": "https://openinherit.org/v1/catalogue.json",
  "title": "INHERIT v1 Catalogue Schema",
  "description": "Lightweight root schema for catalogue-only documents — living collectors cataloguing items without the full estate envelope. Assets, collections, valuations, and legacy contacts. Upgrade path: wrap in a full estate document (schema.json) when needed.",
  "type": "object",
  "properties": {
    "@context": {
      "type": "string",
      "format": "uri",
      "description": "JSON-LD context URI.",
      "examples": ["https://openinherit.org/v1/context/inherit-v1.jsonld"]
    },
    "inherit": {
      "type": "string",
      "const": "https://openinherit.org/v1/catalogue.json",
      "description": "Schema identifier — must be the catalogue schema URI."
    },
    "version": {
      "type": "integer",
      "const": 1,
      "description": "Major version number."
    },
    "schemaVersion": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "examples": ["1.3.0"]
    },
    "exportedAt": {
      "type": "string",
      "format": "date"
    },
    "exportedBy": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      },
      "additionalProperties": false
    },
    "generator": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "version": { "type": "string" },
        "url": { "type": "string" }
      },
      "required": ["name"],
      "additionalProperties": false
    },
    "assets": {
      "type": "array",
      "items": { "$ref": "asset.json" },
      "description": "The catalogued items."
    },
    "assetCollections": {
      "type": "array",
      "items": { "$ref": "asset-collection.json" },
      "description": "Named groupings of assets."
    },
    "valuations": {
      "type": "array",
      "items": { "$ref": "valuation.json" },
      "description": "Valuations of items and collections."
    },
    "legacyContacts": {
      "type": "array",
      "description": "People to notify and grant access when the owner dies. The 'Please open when I have passed away' letter recipients.",
      "items": {
        "$ref": "schema.json#/properties/legacyContacts/items"
      }
    },
    "dataProvenance": {
      "type": "string",
      "enum": ["manual_entry", "ai_extracted", "ocr_scanned", "imported", "migrated", "system_generated"],
      "description": "Default data provenance for entities in this catalogue."
    },
    "importSources": {
      "type": "array",
      "description": "Systems data was imported from.",
      "items": {
        "$ref": "schema.json#/properties/importSources/items"
      }
    },
    "completeness": {
      "$ref": "common/completeness.json"
    },
    "recommendedActions": {
      "type": "array",
      "items": {
        "$ref": "schema.json#/properties/recommendedActions/items"
      }
    },
    "conformance": {
      "$ref": "schema.json#/properties/conformance"
    }
  },
  "required": ["inherit", "version", "assets"],
  "patternProperties": {
    "^x-inherit-": {}
  },
  "unevaluatedProperties": false
}
```

- [ ] **Step 2: Copy to packages/schema/v1/**

```bash
cp $SPEC/v1/catalogue.json $SPEC/packages/schema/v1/
```

- [ ] **Step 3: Validate the schema parses**

```bash
cd $SPEC && node -e "const s = JSON.parse(require('fs').readFileSync('v1/catalogue.json','utf8')); console.log('OK:', s.title, '—', Object.keys(s.properties).length, 'properties')"
```

- [ ] **Step 4: Commit**

```bash
cd $SPEC && git add v1/catalogue.json packages/schema/v1/catalogue.json
git commit -m "feat: add catalogue-only root schema (#34) — lightweight profile for living collectors"
```

---

### Task 8: Update Fixtures

**Files:**
- Modify: All 10 files in `$SPEC/examples/fixtures/`
- Create: `$SPEC/examples/fixtures/catalogue-only.json`

- [ ] **Step 1: Add @context to all 10 fixtures**

```bash
cd $SPEC && python3 -c "
import json, os
for f in sorted(os.listdir('examples/fixtures')):
    if not f.endswith('.json'): continue
    path = f'examples/fixtures/{f}'
    d = json.load(open(path))
    if '@context' not in d:
        # Insert at the beginning
        new = {'@context': 'https://openinherit.org/v1/context/inherit-v1.jsonld'}
        new.update(d)
        with open(path, 'w') as fh:
            json.dump(new, fh, indent=2)
            fh.write('\n')
        print(f'ADDED @context: {f}')
    else:
        print(f'OK: {f}')
"
```

- [ ] **Step 2: Add searchTerms and comparableSearchProfile to English family estate**

Open `examples/fixtures/english-family-estate.json`, find an asset (e.g. the savings account or any physical asset), and add:

```json
"searchTerms": ["Barclays savings account", "UK bank account"],
"comparableSearchProfile": {
  "platforms": ["barclays", "moneysupermarket"],
  "searchQuery": "Barclays savings account interest rates",
  "filters": {},
  "searchFrequency": "on_demand"
}
```

For at least one physical asset (if any), add richer search terms.

- [ ] **Step 3: Create catalogue-only.json fixture**

Create `examples/fixtures/catalogue-only.json` — Bill Frith's model railway catalogue:

```json
{
  "@context": "https://openinherit.org/v1/context/inherit-v1.jsonld",
  "inherit": "https://openinherit.org/v1/catalogue.json",
  "version": 1,
  "schemaVersion": "1.3.0",
  "exportedAt": "2026-03-28",
  "generator": {
    "name": "LegacyLists",
    "version": "1.0.0",
    "url": "https://www.legacylists.com"
  },
  "assets": [
    {
      "id": "a0000001-0000-4000-b000-000000000001",
      "name": "Hornby R3456 Class 66 EWS Livery",
      "category": "collectibles",
      "subcategory": "model_railways",
      "description": "OO gauge Hornby R3456 Class 66 locomotive in EWS livery, DCC fitted, with original box and instructions.",
      "brand": "Hornby",
      "model": "R3456",
      "condition": "excellent",
      "conditionSystem": "bsc",
      "conditionGrade": "Near Mint",
      "originalPackaging": "complete",
      "estimatedValue": { "amount": 12500, "currency": "GBP" },
      "purchasedFrom": "Rails of Sheffield",
      "purchaseDate": "2019-06-15",
      "searchTerms": ["Hornby R3456", "Class 66 OO gauge", "EWS livery locomotive", "DCC fitted"],
      "comparableSearchProfile": {
        "platforms": ["ebay", "hattons", "rails_of_sheffield", "catawiki"],
        "searchQuery": "Hornby R3456 Class 66 EWS OO gauge boxed",
        "filters": {"condition": "excellent", "packaging": "with_box", "gauge": "OO"},
        "searchFrequency": "monthly"
      },
      "identifiers": [{"system": "https://hornby.com/catalogue", "value": "R3456", "type": "catalogue_number"}],
      "dataProvenance": "imported"
    },
    {
      "id": "a0000001-0000-4000-b000-000000000002",
      "name": "Bachmann 32-225 Class 45 Peak BR Blue",
      "category": "collectibles",
      "subcategory": "model_railways",
      "description": "OO gauge Bachmann 32-225 Class 45 Peak in BR Blue livery.",
      "brand": "Bachmann",
      "model": "32-225",
      "condition": "good",
      "originalPackaging": "box_only",
      "estimatedValue": { "amount": 8500, "currency": "GBP" },
      "purchasedFrom": "Hattons of Liverpool",
      "purchaseDate": "2021-03-10",
      "searchTerms": ["Bachmann 32-225", "Class 45 Peak", "BR Blue OO gauge"],
      "dataProvenance": "imported"
    },
    {
      "id": "a0000001-0000-4000-b000-000000000003",
      "name": "Hornby R4527 GWR Centenary Coach Pack",
      "category": "collectibles",
      "subcategory": "model_railways",
      "description": "OO gauge Hornby R4527 GWR Centenary coach pack, 3 coaches in chocolate and cream livery.",
      "brand": "Hornby",
      "model": "R4527",
      "condition": "excellent",
      "originalPackaging": "complete",
      "estimatedValue": { "amount": 9500, "currency": "GBP" },
      "purchasedFrom": "eBay - vintage-trains-uk",
      "purchaseDate": "2022-11-20",
      "searchTerms": ["Hornby R4527", "GWR Centenary coach", "OO gauge coach pack"],
      "dataProvenance": "imported"
    },
    {
      "id": "a0000001-0000-4000-b000-000000000004",
      "name": "Heljan 2601 Class 26 BR Green",
      "category": "collectibles",
      "subcategory": "model_railways",
      "description": "OO gauge Heljan 2601 Class 26 in BR Green livery with small yellow warning panel.",
      "brand": "Heljan",
      "model": "2601",
      "condition": "good",
      "originalPackaging": "complete",
      "estimatedValue": { "amount": 11000, "currency": "GBP" },
      "purchasedFrom": "Kempton Park Model Show",
      "purchaseDate": "2020-07-04",
      "dataProvenance": "imported"
    },
    {
      "id": "a0000001-0000-4000-b000-000000000005",
      "name": "Dapol 4D-006-021 Class 73 Pullman Grey",
      "category": "collectibles",
      "subcategory": "model_railways",
      "description": "OO gauge Dapol 4D-006-021 Class 73 in Pullman grey and blue livery.",
      "brand": "Dapol",
      "model": "4D-006-021",
      "condition": "excellent",
      "originalPackaging": "complete",
      "estimatedValue": { "amount": 14000, "currency": "GBP" },
      "purchasedFrom": "Rails of Sheffield",
      "purchaseDate": "2023-01-12",
      "searchTerms": ["Dapol 4D-006-021", "Class 73 Pullman", "OO gauge"],
      "comparableSearchProfile": {
        "platforms": ["ebay", "rails_of_sheffield"],
        "searchQuery": "Dapol Class 73 Pullman OO gauge",
        "filters": {"condition": "excellent"},
        "searchFrequency": "monthly"
      },
      "dataProvenance": "imported"
    }
  ],
  "assetCollections": [
    {
      "id": "c0000001-0000-4000-b000-000000000001",
      "estateId": "00000000-0000-0000-0000-000000000000",
      "name": "Bill's OO Gauge Collection",
      "description": "OO gauge model railway collection started in 1985. Mostly Hornby with Bachmann, Heljan, and Dapol. Layout stored in the loft at Oakfield Road, Flint Mountain.",
      "category": "model_railways",
      "estimatedValue": { "amount": 5550000, "currency": "GBP" },
      "valuationSource": "self_estimated",
      "valuationDate": "2026-03-28",
      "disposalWishes": "Keep the collection together if possible. Contact Dave at Manchester Model Railway Club — he knows the right dealers. Do not sell on eBay individually.",
      "disposalStrategy": "dealer_bids",
      "specialistDealerNotes": "Rails of Sheffield (01onal@railsofsheffield.com) — largest UK model railway dealer. Hattons of Liverpool — strong on Bachmann and Hornby. Avoid eBay 'lot sellers' — they undervalue specialist items."
    }
  ],
  "valuations": [],
  "legacyContacts": [
    {
      "id": "l0000001-0000-4000-b000-000000000001",
      "name": "Paul Frith",
      "relationship": "son",
      "email": "paul.frith@example.com",
      "notificationMethod": "email",
      "accessLevel": "full",
      "letterGenerated": true,
      "letterGeneratedAt": "2026-03-28T10:00:00Z",
      "letterDeliveryMethod": "printed",
      "notes": "Letter is in the sideboard drawer in the living room."
    }
  ],
  "dataProvenance": "imported",
  "completeness": {
    "score": 65,
    "maxScore": 100,
    "checklist": [
      {"category": "assets_and_valuations", "item": "Items catalogued", "weight": 10, "status": "complete"},
      {"category": "assets_and_valuations", "item": "Professional valuations", "weight": 8, "status": "incomplete", "details": "Self-estimated only — consider dealer valuation"},
      {"category": "pension_and_insurance", "item": "Insurance documented", "weight": 5, "status": "incomplete"}
    ]
  },
  "recommendedActions": [
    {
      "id": "act-001",
      "category": "valuation",
      "priority": "high",
      "title": "Get dealer valuation for the collection",
      "description": "The collection is self-estimated at £555. A specialist dealer valuation would provide a more accurate figure for insurance and for Paul.",
      "status": "pending",
      "triggeredBy": "Collection valuationSource is self_estimated"
    },
    {
      "id": "act-002",
      "category": "completeness",
      "priority": "medium",
      "title": "Add photographs of key items",
      "description": "No images are attached to any items. Photographs significantly increase dealer confidence and comparable matching accuracy.",
      "status": "pending",
      "triggeredBy": "Zero images across all assets"
    }
  ],
  "conformance": {
    "level": "level_1",
    "validatedAt": "2026-03-28T12:00:00Z",
    "validatedBy": "LegacyLists",
    "schemaVersion": "1.3.0"
  }
}
```

- [ ] **Step 4: Validate all fixtures (including new catalogue fixture)**

The catalogue fixture validates against catalogue.json, not schema.json. Validate the 10 estate fixtures against schema.json as usual, then validate the catalogue separately:

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
// Estate fixtures
for (const f of fs.readdirSync('examples/fixtures').filter(x=>x.endsWith('.json') && x !== 'catalogue-only.json')) {
  const data = JSON.parse(fs.readFileSync(path.join('examples/fixtures',f),'utf8'));
  const validate = ajv.getSchema('https://openinherit.org/v1/schema.json');
  const valid = validate(data);
  console.log(valid ? 'PASS: '+f : 'FAIL: '+f+' — '+validate.errors.slice(0,3).map(e=>e.instancePath+' '+e.message).join('; '));
}
// Catalogue fixture
const catData = JSON.parse(fs.readFileSync('examples/fixtures/catalogue-only.json','utf8'));
const catValidate = ajv.getSchema('https://openinherit.org/v1/catalogue.json');
if (catValidate) {
  const valid = catValidate(catData);
  console.log(valid ? 'PASS: catalogue-only.json' : 'FAIL: catalogue-only.json — '+catValidate.errors.slice(0,3).map(e=>e.instancePath+' '+e.message).join('; '));
} else {
  console.log('WARN: catalogue.json schema not found — validate manually');
}
"
```

- [ ] **Step 5: Commit**

```bash
cd $SPEC && git add examples/fixtures/
git commit -m "feat: update fixtures — @context on all 10, searchTerms on London, Bill Frith catalogue fixture"
```

---

## Phase 2: Reference Data and JSON-LD Context

### Task 9: JSON-LD Context File

**Files:**
- Create: `$SPEC/v1/context/inherit-v1.jsonld`

- [ ] **Step 1: Create the JSON-LD context**

Create `v1/context/inherit-v1.jsonld` with Schema.org + FIBO + Wikidata + GS1 mappings. Array-to-type mappings (computed @type), field-to-property mappings. See spec section 2 for full content.

- [ ] **Step 2: Validate it's valid JSON**

```bash
cd $SPEC && node -e "JSON.parse(require('fs').readFileSync('v1/context/inherit-v1.jsonld','utf8')); console.log('VALID')"
```

- [ ] **Step 3: Commit**

```bash
cd $SPEC && git add v1/context/inherit-v1.jsonld
git commit -m "feat: add JSON-LD context — Schema.org, FIBO, Wikidata, GS1 linked data"
```

---

### Task 10: Enum Descriptions Reference Data

**Files:**
- Create: `$SPEC/reference-data/enum-descriptions.json`

- [ ] **Step 1: Create the file**

Cover at minimum: `asset.category` (all 16 values with agentHint and searchable flag), `asset.condition`, `estate.status`, `valuation.valuationPurpose`, `bequest.bequestType`. Each value gets: label, description, agentHint. Include `_disclaimer` as first key.

- [ ] **Step 2: Validate**

```bash
cd $SPEC && python3 -c "import json; d=json.load(open('reference-data/enum-descriptions.json')); print('OK:', len(d.get('enums',{})), 'enum types'); print('Disclaimer:', bool(d.get('_disclaimer')))"
```

- [ ] **Step 3: Commit**

```bash
cd $SPEC && git add reference-data/enum-descriptions.json
git commit -m "feat: add structured enum descriptions with AI agent hints"
```

---

### Task 11: Agent Task Definitions and Output Schema

**Files:**
- Create: `$SPEC/reference-data/agent-task-definitions.json`
- Create: `$SPEC/reference-data/agent-output-schema.json`

- [ ] **Step 1: Create agent-task-definitions.json**

5 task types: find_comparables, estimate_value, identify_item, find_dealers, verify_authenticity. Each with description, input, output, platforms. Include `_disclaimer`.

- [ ] **Step 2: Create agent-output-schema.json**

Standardized output: agentId, taskType, executedAt, inputEntityId, confidence, results, searchesPerformed, tokensUsed, errors. Include `_disclaimer`.

- [ ] **Step 3: Validate both**

```bash
cd $SPEC && for f in reference-data/agent-task-definitions.json reference-data/agent-output-schema.json; do
  python3 -c "import json; d=json.load(open('$f')); print(f'$f: OK, disclaimer={bool(d.get(\"_disclaimer\"))}')"
done
```

- [ ] **Step 4: Commit**

```bash
cd $SPEC && git add reference-data/agent-task-definitions.json reference-data/agent-output-schema.json
git commit -m "feat: add multi-agent orchestration protocol — task definitions + output schema"
```

---

## Phase 3: Cultural Sensitivity

### Task 12: Commit and Audit Cultural Sensitivity

**Files:**
- Create: `$SPEC/docs/cultural-sensitivity.md`
- Modify: `$SPEC/README.md`

- [ ] **Step 1: Copy the cultural sensitivity document**

Copy from `/mnt/c/Users/Richard/Downloads/cultural-sensitivity.md` to `$SPEC/docs/cultural-sensitivity.md`.

- [ ] **Step 2: Audit extension naming**

```bash
cd $SPEC && ls -d v1/extensions/islamic-succession v1/extensions/jewish-succession v1/extensions/hindu-succession 2>&1
```

All three must exist with the correct names.

- [ ] **Step 3: Audit extension fields**

```bash
cd $SPEC && python3 -c "
import json
checks = {
    'v1/extensions/islamic-succession/islamic-succession.json': ['school'],
    'v1/extensions/jewish-succession/jewish-succession.json': ['denomination'],
    'v1/extensions/hindu-succession/hindu-succession.json': ['applicableLaw', 'school']
}
for f, fields in checks.items():
    d = json.load(open(f))
    props = list(d.get('properties', {}).keys())
    for field in fields:
        print(f'{f}: {field} = {\"FOUND\" if field in props else \"MISSING\"} ')
"
```

All must say FOUND.

- [ ] **Step 4: Audit example name diversity across fixtures**

```bash
cd $SPEC && python3 -c "
import json, os, collections
names = []
for f in sorted(os.listdir('examples/fixtures')):
    if not f.endswith('.json'): continue
    d = json.load(open(f'examples/fixtures/{f}'))
    for p in d.get('people', []):
        gn = p.get('givenName', '')
        fn = p.get('familyName', '')
        if gn or fn:
            names.append(f'{gn} {fn}'.strip())
print(f'Total names across fixtures: {len(names)}')
print(f'Unique names: {len(set(names))}')
for n in sorted(set(names)):
    print(f'  {n}')
"
```

Review the output for: diversity across cultures, no stereotypes, plausible names.

- [ ] **Step 5: Add link to README**

Add a line to README.md in the appropriate section:

```markdown
- **[Cultural Sensitivity](docs/cultural-sensitivity.md)** — how INHERIT models legal systems, not religious beliefs
```

- [ ] **Step 6: Commit**

```bash
cd $SPEC && git add docs/cultural-sensitivity.md README.md
git commit -m "docs: add cultural sensitivity statement — audit confirms extensions match claims"
```

---

## Phase 4: CHANGELOG, Version Bump, Final Validation

### Task 13: CHANGELOG and Version

**Files:**
- Modify: `$SPEC/CHANGELOG.md`
- Modify: `$SPEC/packages/schema/package.json`
- Modify: `$SPEC/packages/sdk/package.json`

- [ ] **Step 1: Update CHANGELOG**

Add under `## [Unreleased]` at the top:

```markdown
### Added (AI-Native + #34)
- JSON-LD context file (`v1/context/inherit-v1.jsonld`) — Schema.org, FIBO, Wikidata, GS1 linked data
- `@context` optional property on root schema — enables JSON-LD processing
- `legacyContacts` array on root schema (#34) — digital inheritance for living collectors
- `v1/catalogue.json` — catalogue-only root schema for living collectors (#34)
- Agent decomposition: `searchTerms`, `comparableSearchProfile`, `suggestedSubcategory` on assets
- Per-field `confidenceScores` on assets and people — AI extraction confidence 0-100
- `valuationReliability` on assets — numeric trustworthiness companion to categorical enum
- `lastVerifiedAt` and `verifiedBy` on assets — verification tracking
- `matchScore` on valuation comparables — numeric 0-100 companion to matchConfidence enum
- `humanVerdict` and `rejectionReason` on valuation comparables — agent feedback loop
- `reference-data/enum-descriptions.json` — structured enum descriptions with agent hints
- `reference-data/agent-task-definitions.json` — multi-agent task protocol
- `reference-data/agent-output-schema.json` — standardized agent output format
- `docs/cultural-sensitivity.md` — cultural sensitivity statement
- `examples/fixtures/catalogue-only.json` — Bill Frith model railway catalogue fixture
```

- [ ] **Step 2: Bump package versions to 1.3.0**

```bash
cd $SPEC && sed -i 's/"version": "1.2.0"/"version": "1.3.0"/' packages/schema/package.json packages/sdk/package.json
```

- [ ] **Step 3: Final mirror sync**

```bash
cd $SPEC && rsync -a --delete --exclude=node_modules --exclude=context v1/ packages/schema/v1/
```

- [ ] **Step 4: Final validation**

```bash
cd $SPEC && pnpm test
# Plus full fixture validation (all 10 estate + 1 catalogue)
```

- [ ] **Step 5: Final count verification**

```bash
cd $SPEC
echo "=== INHERIT AUDIT COUNTS ==="
echo "Entity schemas: $(ls v1/*.json | wc -l)"
echo "Common types: $(ls v1/common/*.json | wc -l)"
echo "Root schemas: $(ls v1/schema.json v1/catalogue.json | wc -l)"
echo "Reference data files: $(ls reference-data/*.json | wc -l)"
echo "Fixtures: $(ls examples/fixtures/*.json | wc -l)"
echo "Root properties (schema.json): $(python3 -c "import json; print(len(json.load(open('v1/schema.json'))['properties']))")"
echo "Root properties (catalogue.json): $(python3 -c "import json; print(len(json.load(open('v1/catalogue.json'))['properties']))")"
echo "Package version: $(grep '"version"' packages/schema/package.json)"
```

- [ ] **Step 6: Commit and push**

```bash
cd $SPEC && git add -A
git commit -m "feat: AI-native INHERIT v1.3.0 — JSON-LD, agent protocol, catalogue profile, cultural sensitivity

<paste counts here>
"
git push origin main
```

---

## Phase 5: Website Updates

### Task 14: Website — Submodule, Governance, Extensions

**Files:**
- Modify: `$WEB/content/spec` (submodule)
- Modify: `$WEB/src/app/governance/page.tsx` (cultural sensitivity section)
- Modify: Extension page template (cultural sensitivity reference)

- [ ] **Step 1: Update submodule**

```bash
cd $WEB && git -C content/spec pull origin main
```

- [ ] **Step 2: Add cultural sensitivity section to governance page**

Add a "Cultural Sensitivity" section linking to the full document.

- [ ] **Step 3: Add cultural sensitivity reference to extension pages**

In the extension page template/component, add a one-line note: "INHERIT models legal systems, not religious beliefs. See our [Cultural Sensitivity Statement](/governance#cultural-sensitivity)."

- [ ] **Step 4: Update schema counts if needed**

Check whether homepage, docs, schema page need count updates (new root schema adds 1 to total schema count: 44 → 45 with catalogue.json).

- [ ] **Step 5: Build and deploy**

```bash
cd $WEB && npx next build
vercel deploy --prod --scope mediahq2ltd --force
```

- [ ] **Step 6: Commit and push**

```bash
cd $WEB && git add -A
git commit -m "feat: update for AI-native INHERIT v1.3.0 — cultural sensitivity, schema counts"
git push origin main
```

---

## Phase 6: GitHub Issue Management

### Task 15: Close Issue #34 and Create Cultural Sensitivity Label

- [ ] **Step 1: Create cultural-sensitivity label**

```bash
gh label create "cultural-sensitivity" --description "Cultural sensitivity review or concern" --color "d4c5f9"
```

- [ ] **Step 2: Close issue #34**

```bash
gh issue close 34 --comment "Implemented in v1.3.0: legacyContacts array on root schema, catalogue-only profile (v1/catalogue.json), purchasedFrom (already in v1.2.0). Bill Frith catalogue fixture demonstrates the full LegacyLists use case."
```

---
