#!/usr/bin/env node

/**
 * INHERIT language-agnostic test runner.
 *
 * Reads test files in JSON Schema Test Suite format from tests/v1/,
 * validates each test case against its declared schema using AJV,
 * and reports pass/fail counts.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TESTS_DIR = resolve(ROOT, 'tests', 'v1');
const V1_DIR = resolve(ROOT, 'v1');

// ─── Schema loading ──────────────────────────────────────────────────────────

/** Recursively collect all .json files from a directory. */
function collectJsonFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectJsonFiles(full));
    } else if (entry.endsWith('.json') && entry !== 'extension.json') {
      results.push(full);
    }
  }
  return results;
}

/** Load and register all INHERIT schemas with AJV. */
function createValidator() {
  const ajv = new Ajv({
    strict: false,
    allErrors: true,
    validateFormats: true,
  });
  addFormats(ajv);

  // Load all schema files from v1/
  const schemaFiles = collectJsonFiles(V1_DIR);
  for (const file of schemaFiles) {
    try {
      const schema = JSON.parse(readFileSync(file, 'utf-8'));
      if (schema.$id) {
        ajv.addSchema(schema);
      }
    } catch {
      // Skip files that aren't valid schemas (e.g. JSON-LD context)
    }
  }

  return ajv;
}

// ─── Test runner ─────────────────────────────────────────────────────────────

function collectTestFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectTestFiles(full));
    } else if (entry.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

let passed = 0;
let failed = 0;
const failures = [];

const ajv = createValidator();
const testFiles = collectTestFiles(TESTS_DIR);

for (const file of testFiles) {
  const suites = JSON.parse(readFileSync(file, 'utf-8'));

  for (const suite of suites) {
    const schemaRef = suite.schema?.$ref;
    if (!schemaRef) {
      console.error(`  SKIP: no schema.$ref in suite "${suite.description}" (${file})`);
      continue;
    }

    for (const test of suite.tests) {
      const label = `${suite.description} > ${test.description}`;
      try {
        const validate = ajv.getSchema(schemaRef);
        if (!validate) {
          failures.push({ label, reason: `Schema not found: ${schemaRef}` });
          failed++;
          continue;
        }

        const valid = validate(test.data);
        if (valid === test.valid) {
          passed++;
        } else {
          const reason = test.valid
            ? `Expected valid but got errors: ${JSON.stringify(validate.errors?.map(e => e.message))}`
            : `Expected invalid but validation passed`;
          failures.push({ label, reason });
          failed++;
        }
      } catch (err) {
        failures.push({ label, reason: err.message });
        failed++;
      }
    }
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

console.log('');
console.log('INHERIT Test Suite Results');
console.log('═'.repeat(50));

if (failures.length > 0) {
  console.log('');
  console.log('Failures:');
  for (const f of failures) {
    console.log(`  FAIL: ${f.label}`);
    console.log(`        ${f.reason}`);
  }
}

console.log('');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);
console.log('');

process.exit(failed > 0 ? 1 : 0);
