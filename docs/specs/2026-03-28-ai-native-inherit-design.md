# AI-Native INHERIT — Design Specification

**Date:** 28 March 2026
**Author:** Richard Davies + Claude
**Status:** Approved
**Context:** INHERIT's 22-step plan is complete. The enterprise is moving toward AI-powered tools, particularly comparable-finding agents for CherishedItems. This spec makes INHERIT's schema, vocabulary, and data structures optimized for AI consumption, multi-agent orchestration, and linked data interoperability.

**Design principles from Itelman & Viotti, *Unifying Business, Data, and Code* (O'Reilly, 2024):**
- Four facets of a data product: Data, Structure, Meaning, Context
- Principle of Integrated Simplicity: complexity reduction, decomposition, compression, memoization
- Principle of Continuums: numeric scores alongside categorical labels
- Principle of Learning: error reduction over time via feedback loops
- Collective/Collaborative Intelligence: standardized agent protocols

**Key decisions from brainstorming:**
- Agents follow path C: both structured data and vision as entry points, converging into the same output
- Agents can write directly to documents with provenance tagging (dataProvenance + confidence scores)
- JSON-LD uses computed @type via context file — no @type fields on entities, zero breaking changes
- Full linked data: Schema.org + FIBO + Wikidata + GS1
- Cultural sensitivity: commit, audit schemas against claims, extend to website/GitHub

---

## 1. Self-Describing Fields

### 1a. Enhanced descriptions on key fields

Update `description` values on high-impact fields in `asset.json`, `valuation.json`, and `property.json` to include purpose and agent guidance — not just definitions.

Fields to enhance (asset.json):
- `condition` — add "Affects resale value — dealers use this to price items. Pair with conditionSystem and conditionGrade for domain-specific assessment."
- `brand` — add "AI agents should use this as a primary search dimension when finding comparables."
- `model` — add "Combined with brand and identifiers, this is the primary key for marketplace search."
- `estimatedValue` — add "For AI valuation agents, compare against professional valuations and comparable sales to assess accuracy."
- `images` — add "Vision-capable AI agents use these to identify items, assess condition, and find visual matches on marketplaces."

Fields to enhance (valuation.json):
- `comparables` — add "Agent-generated comparables should include matchScore for quantitative filtering."
- `valuedAmount` — add "When valuationPurpose is ai_estimate, always pair with confidence scores and the comparables that informed the estimate."

### 1b. Structured enum descriptions

Create `reference-data/enum-descriptions.json` — machine-readable descriptions for every enum in the schema.

Structure:
```json
{
  "_disclaimer": "...",
  "enums": {
    "asset.category": {
      "financial": {
        "label": "Financial Assets",
        "description": "Bank accounts, savings, investments, pensions, shares, bonds, cryptocurrency, insurance",
        "agentHint": "Search financial institution databases, not marketplaces. Value from statements, not comparables.",
        "searchable": false
      },
      "collectibles": {
        "label": "Collectibles",
        "description": "Stamps, coins, model railways, vinyl records, trading cards, memorabilia",
        "agentHint": "Search specialist marketplaces (eBay, Catawiki) and dealer networks. Brand + model + condition are the key search dimensions.",
        "searchable": true
      }
    },
    "asset.condition": { ... },
    "estate.status": { ... }
  }
}
```

Each enum value gets: `label`, `description`, `agentHint` (instruction for AI agents), and field-specific metadata (e.g. `searchable` on category).

No schema changes — companion reference data file only.

---

## 2. JSON-LD Context with Full Linked Data

### 2a. Context file

Create `v1/context/inherit-v1.jsonld` mapping INHERIT structure to linked data vocabularies.

**Array-to-type mappings** (computed @type, no schema changes):
- `people[]` → `schema:Person`
- `assets[]` → `schema:Product`
- `properties[]` → `schema:RealEstateListing`
- `valuations[]` → `schema:PriceSpecification`
- `liabilities[]` → `schema:MonetaryAmount`
- `bequests[]` → `inherit:Bequest` (no Schema.org equivalent)
- `executors[]` → `schema:Role` with `schema:roleName: "executor"`
- `documents[]` → `schema:DigitalDocument`

**Field-to-property mappings:**
- `name` → `schema:name`
- `givenName` → `schema:givenName`
- `familyName` → `schema:familyName`
- `brand` → `schema:brand`
- `model` → `schema:model`
- `description` → `schema:description`
- `estimatedValue` → `schema:price`
- `address` → `schema:address`
- `images` → `schema:image`
- `condition` → `schema:itemCondition`
- `category` → `schema:category`
- `subcategory` → `gs1:subCategory`

**Domain vocabulary mappings:**
- `shareholding` sub-object → `fibo:EquityInstrument`
- `pension` sub-object → `fibo:PensionFund`
- `brand` values for collectibles → Wikidata entity references where available (e.g. Hornby → wd:Q1567489)
- `identifiers[].system` URIs → GS1 identification vocabulary where applicable

### 2b. Root schema change

Add `@context` as an optional string property on schema.json:
- Type: string, format: uri
- Not in required array
- Default example: `"https://openinherit.org/v1/context/inherit-v1.jsonld"`
- Description explains that when present, the document can be processed by any JSON-LD processor

### 2c. Existing context file

The existing `v1/context/inherit-v1.json` (if present) should be replaced or updated to the `.jsonld` extension. Check and handle accordingly.

---

## 3. Agent Decomposition Fields

### 3a. New fields on asset.json

**`searchTerms`** (array of strings, optional):
- AI-generated or human-curated keywords for marketplace searches
- Memoization: once derived, cached so subsequent agents reuse them
- Examples: `["Hornby R3456", "Class 66 OO gauge", "EWS livery locomotive"]`

**`comparableSearchProfile`** (object, optional):
- `platforms` — array of marketplace names to search
- `searchQuery` — natural-language query string
- `filters` — key-value pairs for narrowing results (additionalProperties: string)
- `excludePlatforms` — platforms to skip
- `lastSearchedAt` — when an agent last ran this profile
- `searchFrequency` — enum: once, weekly, monthly, on_demand
- additionalProperties: false

**`suggestedSubcategory`** (string, optional):
- AI-suggested subcategory refinement, kept separate from human-set `subcategory`
- Accepted when the user confirms

### 3b. No changes to other entities

searchTerms and comparableSearchProfile are asset-specific. Properties could benefit in future but not in this iteration.

---

## 4. Confidence and Provenance

### 4a. Per-field confidence scores on asset.json

**`confidenceScores`** (object, optional):
- Keys are field names, values are integers 0-100
- additionalProperties: { type: integer, minimum: 0, maximum: 100 }
- Only present on AI-extracted entities
- Examples: `{"brand": 95, "model": 88, "category": 92, "estimatedValue": 40}`

### 4b. Agent feedback on valuation comparables

Extend the Comparable $def in valuation.json with:
- `humanVerdict` — enum: accepted, rejected, adjusted, not_reviewed
- `rejectionReason` — string explaining why comparable was rejected
- `matchScore` — integer 0-100, numeric companion to matchConfidence enum (see section 6)

### 4c. Verification tracking on asset.json

- `lastVerifiedAt` — date-time, when data was last verified
- `verifiedBy` — string, who or what verified it

---

## 5. Multi-Agent Orchestration

### 5a. Agent task definitions

Create `reference-data/agent-task-definitions.json` defining 5 task types:
- `find_comparables` — search marketplaces for similar items
- `estimate_value` — produce AI valuation from comparables
- `identify_item` — identify item from photos (vision path)
- `find_dealers` — identify specialist dealers for category
- `verify_authenticity` — check identifiers against known databases

Each task defines: description, input fields, output fields, applicable platforms.

### 5b. Agent output schema

Create `reference-data/agent-output-schema.json` — standardized output format:
- `agentId` — which agent produced this
- `taskType` — from task definitions
- `executedAt` — timestamp
- `inputEntityId` — what entity this was run against
- `confidence` — overall confidence 0-100
- `results` — task-specific output
- `searchesPerformed` — array of search records (platform, query, resultCount, timestamp)
- `tokensUsed` — cost tracking
- `errors` — any issues encountered

### 5c. No schema.json changes

Agent protocol is reference data, not schema properties. Agents consume INHERIT documents and produce output conforming to agent-output-schema.json. The results are then written back into the INHERIT document (as valuations, comparables, searchTerms, etc.) with appropriate provenance.

---

## 6. Continuums

### 6a. matchScore on valuation comparables

Add `matchScore` (integer 0-100) alongside existing `matchConfidence` enum on the Comparable $def in valuation.json. The enum is the human interface; the number is the agent interface.

### 6b. valuationReliability on asset.json

Add `valuationReliability` (integer 0-100) alongside existing `valuationConfidence` enum. Computed from: recency, method, corroborating comparables, variance between estimates. Agents use this to prioritize which assets need re-valuation.

### 6c. Design principle

Categorical enums are never removed or replaced. Numeric companions are added as optional fields. The enum captures *source/type*; the number captures *trustworthiness now*. They describe the same dimension from different perspectives.

---

## 7. Cultural Sensitivity

### 7a. Commit

Place `docs/cultural-sensitivity.md` in the spec repo (content from the provided document).

### 7b. Audit

Verify schemas match the document's claims:
1. Extension directories: islamic-succession, jewish-succession, hindu-succession
2. Transliterations follow claimed standards (ALA-LC Arabic, academic Hebrew, Indian statute Sanskrit, modified Hepburn Japanese)
3. Example names across 10 fixtures are diverse and respectful
4. islamic-succession.json has `school` field, jewish-succession.json has `denomination`, hindu-succession.json has `applicableLaw` and `school`

### 7c. Extend

1. Create `cultural-sensitivity` label on GitHub repo
2. Add "Cultural Sensitivity" section to Governance page on openinherit.org
3. Each extension page on the website references the cultural sensitivity statement
4. README links to the document

---

## Files Created/Modified

### New files (spec repo):
- `v1/context/inherit-v1.jsonld` — JSON-LD context
- `reference-data/enum-descriptions.json` — structured enum descriptions with agent hints
- `reference-data/agent-task-definitions.json` — agent task protocol
- `reference-data/agent-output-schema.json` — standardized agent output format
- `docs/cultural-sensitivity.md` — cultural sensitivity statement

### Modified files (spec repo):
- `v1/schema.json` — add `@context` optional property (1 new property → 34 root properties)
- `v1/asset.json` — add searchTerms, comparableSearchProfile, suggestedSubcategory, confidenceScores, valuationReliability, lastVerifiedAt, verifiedBy + enhanced descriptions
- `v1/valuation.json` — add matchScore, humanVerdict, rejectionReason on Comparable $def + enhanced descriptions
- `v1/person.json` — add confidenceScores (for AI-extracted people)
- All 10 fixtures — add @context, populate searchTerms/comparableSearchProfile on at least London fixture
- `CHANGELOG.md` — entries for all changes
- `README.md` — link to cultural sensitivity doc
- `packages/schema/v1/` — mirror sync

### Modified files (website repo):
- `content/spec` — submodule update
- Governance page — cultural sensitivity section
- Extension pages — reference to sensitivity statement

---

## What This Does NOT Change

- Field names aligned with Schema.org (givenName, familyName, brand, model, description) — already correct
- The two-level category/subcategory hierarchy — right decomposition level
- The money.json {amount, currency} object pattern — better for AI than flat fields
- Existing enum values — only additions, no removals
- Required fields on any entity — all new fields are optional
