/**
 * validate-document.ts — Three-level INHERIT document validator.
 *
 * Demonstrates:
 *   - Level 1: JSON Schema validation with AJV (2020-12 draft)
 *   - Level 2: Referential integrity checks across entity arrays
 *   - Level 3: Placeholder for extension-specific field checking (planned for v1.1)
 *
 * Run:  npx tsx validate-document.ts <path-to-inherit-json>
 *       pnpm run validate -- <path-to-inherit-json>
 *
 * Exit code 0 if Level 2 passes, 1 otherwise.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

// ---------------------------------------------------------------------------
// Types — minimal shapes for the cross-reference checks
// ---------------------------------------------------------------------------

/** Any entity with an `id` field. */
interface Identifiable {
  id: string;
}

/** Minimal shape of the root INHERIT document for referential integrity. */
interface InheritDocument {
  estate: {
    testatorPersonId: string;
    [key: string]: unknown;
  };
  people: Identifiable[];
  assets: Identifiable[];
  bequests: Array<{
    id: string;
    beneficiaryId?: string;
    sourceAssetId?: string;
    [key: string]: unknown;
  }>;
  executors: Array<{
    id: string;
    personId: string;
    [key: string]: unknown;
  }>;
  guardians: Array<{
    id: string;
    guardianPersonId: string;
    childPersonId: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

/** A referential integrity error. */
interface RefError {
  path: string;
  message: string;
  explanation: string;
}

// ---------------------------------------------------------------------------
// CLI argument handling
// ---------------------------------------------------------------------------

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npx tsx validate-document.ts <path-to-inherit-json>");
  console.error("Example: npx tsx validate-document.ts ../examples/fixtures/english-family-estate.json");
  process.exit(1);
}

const resolvedPath = resolve(filePath);

// ---------------------------------------------------------------------------
// 1. Load and parse the input document
// ---------------------------------------------------------------------------

let rawJson: string;
try {
  rawJson = readFileSync(resolvedPath, "utf-8");
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`ERROR: Could not read file: ${msg}`);
  process.exit(1);
}

let document: Record<string, unknown>;
try {
  document = JSON.parse(rawJson);
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`ERROR: Invalid JSON: ${msg}`);
  console.error("\nConformance level: 0 (not valid JSON)");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Schema loading — recursively collect all .json files from v1/
// ---------------------------------------------------------------------------

/**
 * Recursively collect all .json files from a directory.
 */
function collectJsonFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectJsonFiles(full));
    } else if (entry.endsWith(".json")) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// 3. Level 1: JSON Schema validation
// ---------------------------------------------------------------------------

/**
 * Provide a human-readable explanation for a JSON Schema validation error.
 */
function explainSchemaError(err: { keyword: string; instancePath: string; message?: string; params?: Record<string, unknown> }): string {
  const path = err.instancePath || "/";

  switch (err.keyword) {
    case "required":
      return `The property "${err.params?.missingProperty}" is required at ${path} but was not provided.`;
    case "type":
      return `The value at ${path} has the wrong type — expected ${err.params?.type}.`;
    case "enum":
      return `The value at ${path} is not one of the allowed values: ${JSON.stringify(err.params?.allowedValues)}.`;
    case "format":
      return `The value at ${path} does not match the expected format "${err.params?.format}".`;
    case "const":
      return `The value at ${path} must be exactly ${JSON.stringify(err.params?.allowedValue)}.`;
    case "additionalProperties":
    case "unevaluatedProperties":
      return `The property "${err.params?.additionalProperty ?? err.params?.unevaluatedProperty}" at ${path} is not allowed by the schema.`;
    case "minimum":
    case "maximum":
      return `The value at ${path} is outside the allowed range (${err.keyword}: ${err.params?.limit}).`;
    case "anyOf":
      return `The value at ${path} does not match any of the permitted alternatives.`;
    case "oneOf":
      return `The value at ${path} must match exactly one alternative, but matched ${err.params?.passingSchemas?.length ?? 0}.`;
    case "if":
      return `A conditional schema rule failed at ${path} — check that required fields for this type are present.`;
    default:
      return `${err.message ?? "Unknown validation error"} at ${path}.`;
  }
}

async function runLevel1(doc: Record<string, unknown>): Promise<{ valid: boolean; errors: string[] }> {
  // Initialise AJV with 2020-12 draft support (required for unevaluatedProperties)
  const ajv = new Ajv2020({
    strict: false, // Tolerate $comment, $id in unexpected places
    allErrors: true, // Report all validation errors, not just the first
  });
  addFormats(ajv);

  // Load every schema from ../v1/ so that $ref resolution works
  const schemaDir = join(import.meta.dirname!, "..", "v1");
  const schemaFiles = collectJsonFiles(schemaDir);

  for (const file of schemaFiles) {
    const raw = readFileSync(file, "utf-8");
    let schema: Record<string, unknown>;
    try {
      schema = JSON.parse(raw);
    } catch {
      // Skip non-JSON or malformed files (e.g. context files)
      continue;
    }

    // Only register schemas that have a $id — AJV uses $id for $ref resolution
    if (typeof schema.$id === "string") {
      // Strip the custom $schema dialect URI — AJV does not need it and would
      // otherwise warn about a missing meta-schema for the INHERIT dialect.
      const { $schema: _dialect, ...schemaWithoutDialect } = schema;

      try {
        ajv.addSchema(schemaWithoutDialect);
      } catch (err) {
        // Schema already registered or other non-fatal issue — skip
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("already exists")) {
          console.warn(
            `Warning: could not register ${relative(schemaDir, file)}: ${msg}`
          );
        }
      }
    }
  }

  // Validate the document against the root schema
  const rootSchemaId = "https://openinherit.org/v1/schema.json";
  const validate = ajv.getSchema(rootSchemaId);

  if (!validate) {
    return {
      valid: false,
      errors: ["Root schema not found — check that v1/schema.json is present and has the correct $id."],
    };
  }

  const valid = validate(doc);

  if (valid) {
    return { valid: true, errors: [] };
  }

  // Format each error with path, message, and explanation
  const errors: string[] = [];
  for (const err of validate.errors ?? []) {
    const path = err.instancePath || "/";
    const message = err.message ?? "unknown error";
    const explanation = explainSchemaError(err);
    errors.push(`  Path:        ${path}\n  Message:     ${message}\n  Explanation: ${explanation}`);
  }

  return { valid: false, errors };
}

// ---------------------------------------------------------------------------
// 4. Level 2: Referential integrity checks
// ---------------------------------------------------------------------------

function runLevel2(doc: InheritDocument): { valid: boolean; errors: RefError[] } {
  const errors: RefError[] = [];

  // Build lookup sets for people and assets
  const personIds = new Set(doc.people.map((p) => p.id));
  const assetIds = new Set(doc.assets.map((a) => a.id));

  // --- estate.testatorPersonId must reference a person ---
  if (!personIds.has(doc.estate.testatorPersonId)) {
    errors.push({
      path: "/estate/testatorPersonId",
      message: `Person "${doc.estate.testatorPersonId}" not found in people array.`,
      explanation:
        "The testator identified in the estate record must exist as a person in the people array.",
    });
  }

  // --- bequest.beneficiaryId must reference a person (when present) ---
  for (let i = 0; i < doc.bequests.length; i++) {
    const bequest = doc.bequests[i];

    if (bequest.beneficiaryId && !personIds.has(bequest.beneficiaryId)) {
      errors.push({
        path: `/bequests/${i}/beneficiaryId`,
        message: `Person "${bequest.beneficiaryId}" not found in people array.`,
        explanation:
          `Bequest "${bequest.id}" references a beneficiary that does not exist in the people array.`,
      });
    }

    // --- bequest.sourceAssetId must reference an asset (when present) ---
    if (bequest.sourceAssetId && !assetIds.has(bequest.sourceAssetId)) {
      errors.push({
        path: `/bequests/${i}/sourceAssetId`,
        message: `Asset "${bequest.sourceAssetId}" not found in assets array.`,
        explanation:
          `Bequest "${bequest.id}" references a source asset (for demonstrative bequests) that does not exist in the assets array.`,
      });
    }
  }

  // --- executor.personId must reference a person ---
  for (let i = 0; i < doc.executors.length; i++) {
    const executor = doc.executors[i];

    if (!personIds.has(executor.personId)) {
      errors.push({
        path: `/executors/${i}/personId`,
        message: `Person "${executor.personId}" not found in people array.`,
        explanation:
          `Executor "${executor.id}" references a person that does not exist in the people array.`,
      });
    }
  }

  // --- guardian.guardianPersonId and guardian.childPersonId must reference people ---
  for (let i = 0; i < doc.guardians.length; i++) {
    const guardian = doc.guardians[i];

    if (!personIds.has(guardian.guardianPersonId)) {
      errors.push({
        path: `/guardians/${i}/guardianPersonId`,
        message: `Person "${guardian.guardianPersonId}" not found in people array.`,
        explanation:
          `Guardian "${guardian.id}" references a guardian person that does not exist in the people array.`,
      });
    }

    if (!personIds.has(guardian.childPersonId)) {
      errors.push({
        path: `/guardians/${i}/childPersonId`,
        message: `Person "${guardian.childPersonId}" not found in people array.`,
        explanation:
          `Guardian "${guardian.id}" references a child person that does not exist in the people array.`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// 5. Main — run all validation levels and report
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`Validating: ${resolvedPath}\n`);
  console.log("=".repeat(60));

  // ---- Level 1: JSON Schema ----
  console.log("\nLevel 1: JSON Schema Validation (AJV, 2020-12 draft)");
  console.log("-".repeat(60));

  const level1 = await runLevel1(document);

  if (level1.valid) {
    console.log("  PASS — Document conforms to the INHERIT v1 root schema.\n");
  } else {
    console.log("  FAIL — Schema validation errors:\n");
    for (const err of level1.errors) {
      console.log(err);
      console.log();
    }
    console.log("=".repeat(60));
    console.log("\nConformance level achieved: 0");
    console.log("The document does not pass JSON Schema validation.");
    process.exit(1);
  }

  // ---- Level 2: Referential integrity ----
  console.log("Level 2: Referential Integrity Checks");
  console.log("-".repeat(60));

  const level2 = runLevel2(document as unknown as InheritDocument);

  if (level2.valid) {
    console.log("  PASS — All cross-references resolve correctly.\n");
  } else {
    console.log("  FAIL — Referential integrity errors:\n");
    for (const err of level2.errors) {
      console.log(`  Path:        ${err.path}`);
      console.log(`  Message:     ${err.message}`);
      console.log(`  Explanation: ${err.explanation}`);
      console.log();
    }
    console.log("=".repeat(60));
    console.log("\nConformance level achieved: 1");
    console.log("The document passes schema validation but has broken cross-references.");
    process.exit(1);
  }

  // ---- Level 3: Extension-specific checks (placeholder) ----
  console.log("Level 3: Extension-Specific Field Checking");
  console.log("-".repeat(60));
  console.log("  Level 3 checking not yet implemented — extension-specific field checking is planned for v1.1.\n");

  // ---- Summary ----
  console.log("=".repeat(60));
  console.log("\nConformance level achieved: 2");
  console.log("The document passes schema validation and referential integrity checks.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
