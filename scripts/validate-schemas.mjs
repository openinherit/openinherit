#!/usr/bin/env node

/**
 * INHERIT schema validator.
 *
 * Validates that all JSON Schema files in v1/ are:
 * 1. Valid JSON
 * 2. Have a $id field
 * 3. Have a $schema field
 * 4. All $ref URIs can be resolved within the schema set
 * 5. All extension.json manifests have required fields
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const V1_DIR = resolve(ROOT, 'v1');

let errors = 0;

/** Recursively collect all .json files. */
function collectJsonFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectJsonFiles(full));
    } else if (entry.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

function fail(file, message) {
  console.error(`  FAIL: ${file}`);
  console.error(`        ${message}`);
  errors++;
}

// ─── 1. Parse all JSON files ─────────────────────────────────────────────────

const allFiles = collectJsonFiles(V1_DIR);
const schemas = new Map(); // $id -> parsed schema
const schemaIds = new Set();

console.log(`Validating ${allFiles.length} files in v1/...`);
console.log('');

for (const file of allFiles) {
  const relative = file.replace(ROOT + '/', '');

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf-8'));
  } catch (err) {
    fail(relative, `Invalid JSON: ${err.message}`);
    continue;
  }

  // Skip non-schema files (extension manifests, JSON-LD context)
  if (file.endsWith('extension.json') || file.includes('/context/')) {
    continue;
  }

  // Check $id
  if (!parsed.$id) {
    fail(relative, 'Missing $id');
    continue;
  }

  // Check $schema
  if (!parsed.$schema) {
    fail(relative, 'Missing $schema');
  }

  schemas.set(parsed.$id, { file: relative, schema: parsed });
  schemaIds.add(parsed.$id);
}

console.log(`Found ${schemas.size} schemas with $id`);

// ─── 2. Validate $ref resolution ────────────────────────────────────────────

function collectRefs(obj, refs = []) {
  if (obj && typeof obj === 'object') {
    if (typeof obj.$ref === 'string' && !obj.$ref.startsWith('#')) {
      // Extract the base URI (before any fragment)
      const base = obj.$ref.split('#')[0];
      if (base) refs.push(base);
    }
    for (const value of Object.values(obj)) {
      collectRefs(value, refs);
    }
  }
  return refs;
}

for (const [id, { file, schema }] of schemas) {
  const refs = collectRefs(schema);
  for (const ref of refs) {
    // Resolve relative refs — these are filesystem relative, not URI relative
    // $id-based resolution: refs should be absolute URIs
    if (ref.startsWith('https://openinherit.org/') && !schemaIds.has(ref)) {
      fail(file, `Unresolved $ref: ${ref}`);
    }
  }
}

// ─── 3. Validate extension manifests ────────────────────────────────────────

const requiredManifestFields = [
  'name', 'id', 'version', 'inherit', 'maturity',
  'jurisdiction', 'legalSystems', 'maintainers',
  'lastVerified', 'dataProvenance', 'responsibleOrganisation', 'description',
];

const manifestFiles = allFiles.filter(f => f.endsWith('extension.json'));
console.log(`Found ${manifestFiles.length} extension manifests`);

for (const file of manifestFiles) {
  const relative = file.replace(ROOT + '/', '');
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    fail(relative, 'Invalid JSON in manifest');
    continue;
  }

  for (const field of requiredManifestFields) {
    if (!(field in manifest)) {
      fail(relative, `Missing required field: ${field}`);
    }
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

console.log('');
if (errors === 0) {
  console.log('All schemas valid.');
} else {
  console.log(`${errors} error(s) found.`);
}

process.exit(errors > 0 ? 1 : 0);
