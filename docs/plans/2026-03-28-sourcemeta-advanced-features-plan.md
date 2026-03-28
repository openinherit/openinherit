# Sourcemeta Advanced Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add schema bundling, example validation, and interactive schema graph to the openinherit repo and website.

**Architecture:** CI in openinherit generates artefacts (bundled schema, validated examples, graph data) and commits them to `dist/`. The openinheritorg website reads these via the git submodule and renders them — including an interactive force-directed schema graph.

**Tech Stack:** Sourcemeta JSON Schema CLI v14.17, GitHub Actions, Next.js 15, react-force-graph, Tailwind CSS

**Repos:**
- `openinherit` = `/home/richardd/projects/openinherit` (schemas, CI, artefacts)
- `openinheritorg` = `/home/richardd/projects/openinheritorg` (website)

**Branch:** All openinherit changes on `feat/sourcemeta-advanced` (branch protection requires PRs to main).

---

## File Structure

### openinherit repo (new/modified files)

| File | Responsibility |
|------|---------------|
| `dist/inherit-v1-bundled.json` | CI-generated bundled schema (all $refs inlined) |
| `dist/schema-graph.json` | CI-generated graph data for the website |
| `scripts/generate-graph-data.mjs` | Node script: runs inspect per schema, combines into graph JSON |
| `scripts/validate-examples.sh` | Shell script: validates each fixture, excludes broken-references.json |
| `.github/workflows/bundle-and-inspect.yml` | CI: bundle schema + generate graph data, auto-commit to dist/ |
| `.github/workflows/validate-examples.yml` | CI: validate example fixtures against schemas |
| `package.json` | Add npm scripts: bundle:schema, validate:examples, inspect:schema, graph:data |
| `README.md` | Add CI badges, downloads section |

### openinheritorg repo (new/modified files)

| File | Responsibility |
|------|---------------|
| `src/app/docs/schemas/graph/page.tsx` | Schema graph page (metadata, layout, loads graph data) |
| `src/components/schema-graph.tsx` | Client component: interactive force-directed graph |
| `src/app/docs/schemas/page.tsx` | Modified: add download button, graph link, examples section |
| `src/app/page.tsx` | Modified: add schema quality section |
| `src/app/docs/page.tsx` | Modified: add graph link |
| `package.json` | Add react-force-graph dependency |

---

## Task 1: Create dist/ directory and bundle npm script

**Files:**
- Create: `dist/.gitkeep`
- Modify: `package.json`

- [ ] **Step 1: Create dist directory**

```bash
mkdir -p dist && touch dist/.gitkeep
```

- [ ] **Step 2: Test the bundle command locally**

Run:
```bash
npx jsonschema bundle v1/schema.json --resolve v1/dialect.json --resolve v1/ --resolve v1/common/ > dist/inherit-v1-bundled.json
```

Expected: Exit code 0. File `dist/inherit-v1-bundled.json` created with a single self-contained JSON Schema.

- [ ] **Step 3: Verify the bundled schema is valid JSON with $defs**

Run:
```bash
node -e "const s = require('./dist/inherit-v1-bundled.json'); console.log('$defs count:', Object.keys(s.\$defs || {}).length); console.log('title:', s.title)"
```

Expected: `$defs count:` showing 30+ inlined schemas, `title: INHERIT v1 Root Schema`

- [ ] **Step 4: Add bundle:schema npm script to package.json**

In `package.json`, add to the `"scripts"` object:

```json
"bundle:schema": "jsonschema bundle v1/schema.json --resolve v1/dialect.json --resolve v1/ --resolve v1/common/ > dist/inherit-v1-bundled.json"
```

- [ ] **Step 5: Verify the npm script works**

Run:
```bash
pnpm run bundle:schema
```

Expected: Exit code 0. `dist/inherit-v1-bundled.json` regenerated.

- [ ] **Step 6: Commit**

```bash
git add dist/.gitkeep package.json
git commit -m "feat: add bundle:schema npm script and dist/ directory"
```

---

## Task 2: Create validate-examples script and npm script

**Files:**
- Create: `scripts/validate-examples.sh`
- Modify: `package.json`

- [ ] **Step 1: Test validate command on a single fixture**

Run:
```bash
npx jsonschema validate v1/schema.json examples/fixtures/minimal-estate.json --resolve v1/dialect.json --resolve v1/ --resolve v1/common/
```

Expected: Exit code 0 (silent success).

- [ ] **Step 2: Test validate rejects invalid input**

Run:
```bash
npx jsonschema validate v1/schema.json examples/fixtures/broken-references.json --resolve v1/dialect.json --resolve v1/ --resolve v1/common/ 2>&1; echo "Exit: $?"
```

Expected: Non-zero exit code with validation errors.

- [ ] **Step 3: Create the validation shell script**

Create `scripts/validate-examples.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

RESOLVE_FLAGS="--resolve v1/dialect.json --resolve v1/ --resolve v1/common/"
SCHEMA="v1/schema.json"
SKIP="broken-references.json sample-will-text.txt"
PASSED=0
FAILED=0

for fixture in examples/fixtures/*; do
  filename=$(basename "$fixture")

  # Skip non-JSON and known-invalid files
  if echo "$SKIP" | grep -qw "$filename"; then
    echo "SKIP: $filename"
    continue
  fi

  if npx jsonschema validate "$SCHEMA" "$fixture" $RESOLVE_FLAGS 2>/dev/null; then
    echo "PASS: $filename"
    PASSED=$((PASSED + 1))
  else
    echo "FAIL: $filename"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "Results: $PASSED passed, $FAILED failed"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
```

- [ ] **Step 4: Make executable and test**

Run:
```bash
chmod +x scripts/validate-examples.sh
bash scripts/validate-examples.sh
```

Expected: All 11 JSON fixtures pass (broken-references.json and sample-will-text.txt skipped). `Results: 11 passed, 0 failed`

- [ ] **Step 5: Add npm script to package.json**

In `package.json`, add to `"scripts"`:

```json
"validate:examples": "bash scripts/validate-examples.sh"
```

- [ ] **Step 6: Verify npm script works**

Run:
```bash
pnpm run validate:examples
```

Expected: Same output as step 4.

- [ ] **Step 7: Commit**

```bash
git add scripts/validate-examples.sh package.json
git commit -m "feat: add validate:examples script for fixture validation"
```

---

## Task 3: Create graph data generation script

**Files:**
- Create: `scripts/generate-graph-data.mjs`
- Modify: `package.json`

The `jsonschema inspect` command only processes one schema at a time. This script runs it on each schema, extracts $ref relationships, and combines them into a single `schema-graph.json` for the website.

- [ ] **Step 1: Create the graph data script**

Create `scripts/generate-graph-data.mjs`:

```javascript
import { execFileSync } from 'node:child_process';
import { readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SCHEMA_DIR = 'v1';
const COMMON_DIR = 'v1/common';
const OUTPUT = 'dist/schema-graph.json';
const BASE_URI = 'https://openinherit.org/v1/';

// Find the jsonschema binary path
const npxPath = process.platform === 'win32' ? 'npx.cmd' : 'npx';

// Collect all schema files
const coreSchemas = readdirSync(SCHEMA_DIR)
  .filter(f => f.endsWith('.json') && f !== 'dialect.json')
  .map(f => join(SCHEMA_DIR, f));

const commonSchemas = readdirSync(COMMON_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => join(COMMON_DIR, f));

const allSchemas = [...coreSchemas, ...commonSchemas];

// Build graph
const nodes = [];
const edges = [];

for (const schemaPath of allSchemas) {
  // Read schema for metadata
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const id = schema.$id;
  if (!id) continue;

  const slug = id.replace(BASE_URI, '').replace('.json', '').replace('common/', '');
  const category = schemaPath.startsWith(COMMON_DIR) ? 'common' : 'core';

  nodes.push({
    id,
    slug,
    title: schema.title || slug,
    description: schema.description || '',
    category,
    path: schemaPath,
    propertyCount: schema.properties ? Object.keys(schema.properties).length : 0,
  });

  // Run inspect to get references
  try {
    const output = execFileSync(
      npxPath,
      [
        'jsonschema', 'inspect', schemaPath,
        '--resolve', 'v1/dialect.json',
        '--resolve', 'v1/',
        '--resolve', 'v1/common/',
        '--json',
      ],
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const inspectData = JSON.parse(output);

    for (const ref of inspectData.references || []) {
      // Skip $schema references to dialect
      if (ref.origin === '/$schema') continue;
      // Skip self-references (internal $defs)
      if (ref.base === id) continue;

      // Only include references to other INHERIT schemas
      if (ref.base && ref.base.startsWith(BASE_URI)) {
        // Deduplicate: only add unique source->target pairs
        const existing = edges.find(e => e.source === id && e.target === ref.base);
        if (!existing) {
          edges.push({
            source: id,
            target: ref.base,
            property: ref.origin.split('/').pop().replace('$ref', ''),
          });
        }
      }
    }
  } catch (err) {
    console.error(`Warning: inspect failed for ${schemaPath}: ${err.message}`);
  }
}

const graph = {
  generated: new Date().toISOString(),
  nodeCount: nodes.length,
  edgeCount: edges.length,
  nodes,
  edges,
};

writeFileSync(OUTPUT, JSON.stringify(graph, null, 2));
console.log(`Graph data written to ${OUTPUT}: ${nodes.length} nodes, ${edges.length} edges`);
```

- [ ] **Step 2: Test the script**

Run:
```bash
node scripts/generate-graph-data.mjs
```

Expected: `Graph data written to dist/schema-graph.json: 31 nodes, N edges` (where N > 0).

- [ ] **Step 3: Verify the output structure**

Run:
```bash
node -e "const g = require('./dist/schema-graph.json'); console.log('Nodes:', g.nodeCount, 'Edges:', g.edgeCount); console.log('Sample node:', g.nodes[0].title); console.log('Sample edge:', g.edges[0]?.source, '->', g.edges[0]?.target)"
```

Expected: Shows node count ~31, edge count > 0, with valid sample node and edge.

- [ ] **Step 4: Add npm script to package.json**

In `package.json`, add to `"scripts"`:

```json
"graph:data": "node scripts/generate-graph-data.mjs"
```

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-graph-data.mjs package.json
git commit -m "feat: add graph data generation script using Sourcemeta inspect"
```

---

## Task 4: Create CI workflows

**Files:**
- Create: `.github/workflows/bundle-and-inspect.yml`
- Create: `.github/workflows/validate-examples.yml`

- [ ] **Step 1: Create bundle-and-inspect workflow**

Create `.github/workflows/bundle-and-inspect.yml`:

```yaml
name: Bundle Schema & Generate Graph

on:
  push:
    branches:
      - main
    paths:
      - 'v1/**'

jobs:
  bundle-and-inspect:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Bundle schema
        run: pnpm run bundle:schema

      - name: Generate graph data
        run: pnpm run graph:data

      - name: Check for changes
        id: changes
        run: |
          if git diff --quiet dist/; then
            echo "changed=false" >> "$GITHUB_OUTPUT"
          else
            echo "changed=true" >> "$GITHUB_OUTPUT"
          fi

      - name: Commit artefacts
        if: steps.changes.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add dist/
          git commit -m "chore: regenerate bundled schema and graph data"
          git push
```

- [ ] **Step 2: Create validate-examples workflow**

Create `.github/workflows/validate-examples.yml`:

```yaml
name: Validate Examples

on:
  push:
    branches:
      - main
    paths:
      - 'v1/**'
      - 'examples/fixtures/**'
  pull_request:
    paths:
      - 'v1/**'
      - 'examples/fixtures/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Validate example fixtures
        run: pnpm run validate:examples
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/bundle-and-inspect.yml .github/workflows/validate-examples.yml
git commit -m "ci: add bundle-and-inspect and validate-examples workflows"
```

---

## Task 5: Update README with badges and downloads section

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add CI badges to README**

After the existing badge line (line 5 of README.md), add two new badges:

```markdown
[![CI: Examples Validated](https://github.com/openinherit/openinherit/actions/workflows/validate-examples.yml/badge.svg)](https://github.com/openinherit/openinherit/actions/workflows/validate-examples.yml)
[![CI: Schema Bundled](https://github.com/openinherit/openinherit/actions/workflows/bundle-and-inspect.yml/badge.svg)](https://github.com/openinherit/openinherit/actions/workflows/bundle-and-inspect.yml)
```

- [ ] **Step 2: Add downloads section to README**

After the existing "Install via npm" section (around line 60), add:

```markdown
### Download the bundled schema

A single self-contained JSON Schema file with all `$ref` references inlined:

- **[inherit-v1-bundled.json](dist/inherit-v1-bundled.json)** — validate INHERIT documents with one file, no dependencies

This file is regenerated automatically by CI whenever schemas change.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add CI badges and bundled schema download to README"
```

---

## Task 6: Create PR for openinherit changes

- [ ] **Step 1: Push branch and create PR**

```bash
git push -u origin feat/sourcemeta-advanced
gh pr create --title "feat: Sourcemeta advanced features — bundle, validate, inspect" --body "$(cat <<'EOF'
## Summary

- **Bundle:** `pnpm run bundle:schema` produces `dist/inherit-v1-bundled.json` — single-file schema with all $refs inlined
- **Validate:** `pnpm run validate:examples` validates all 11 example fixtures against the schemas
- **Inspect:** `pnpm run graph:data` generates `dist/schema-graph.json` for the interactive website graph
- Two new CI workflows: `bundle-and-inspect.yml` and `validate-examples.yml`
- README updated with new CI badges and download link

## Test plan

- [ ] `pnpm run bundle:schema` produces valid bundled JSON
- [ ] `pnpm run validate:examples` passes all 11 fixtures
- [ ] `pnpm run graph:data` produces graph JSON with 31+ nodes
- [ ] CI workflows run successfully on push to main

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: Merge PR**

Merge once checks pass (or user approves).

---

## Task 7: Add react-force-graph to website

**Repo:** openinheritorg

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install react-force-graph**

```bash
cd /home/richardd/projects/openinheritorg
pnpm add react-force-graph-2d
```

Note: `react-force-graph-2d` is the lightweight 2D-only version (~45KB gzipped). The full `react-force-graph` includes 3D which is unnecessary.

- [ ] **Step 2: Verify installation**

Run:
```bash
pnpm ls react-force-graph-2d
```

Expected: Shows installed version.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add react-force-graph-2d for schema dependency graph"
```

---

## Task 8: Create interactive schema graph component

**Repo:** openinheritorg

**Files:**
- Create: `src/components/schema-graph.tsx`

- [ ] **Step 1: Create the client-side graph component**

Create `src/components/schema-graph.tsx`:

```tsx
'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center text-gray-500">
      Loading graph…
    </div>
  ),
});

interface GraphNode {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'core' | 'common';
  propertyCount: number;
}

interface GraphEdge {
  source: string;
  target: string;
  property: string;
}

interface SchemaGraphData {
  generated: string;
  nodeCount: number;
  edgeCount: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface SchemaGraphProps {
  data: SchemaGraphData;
}

const CATEGORY_COLOURS: Record<string, { fill: string; stroke: string }> = {
  core: { fill: '#059669', stroke: '#047857' },    // emerald-600/700
  common: { fill: '#2563eb', stroke: '#1d4ed8' },  // blue-600/700
};

export function SchemaGraph({ data }: SchemaGraphProps) {
  const router = useRouter();
  const graphRef = useRef<any>(null);

  const graphData = useMemo(() => ({
    nodes: data.nodes.map(n => ({ ...n })),
    links: data.edges.map(e => ({ source: e.source, target: e.target })),
  }), [data]);

  const handleNodeClick = useCallback((node: any) => {
    router.push(`/docs/schemas/${node.slug}`);
  }, [router]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const { fill, stroke } = CATEGORY_COLOURS[node.category] || CATEGORY_COLOURS.core;
    const radius = 6 + (node.propertyCount / 5);

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.font = '4px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#374151'; // gray-700
    ctx.fillText(node.title, node.x, node.y + radius + 2);
  }, []);

  const nodeTooltip = useCallback((node: any) => {
    return `<div style="background:#1f2937;color:white;padding:8px 12px;border-radius:6px;font-size:13px;max-width:280px">
      <strong>${node.title}</strong><br/>
      <span style="color:#9ca3af">${node.category} · ${node.propertyCount} fields</span><br/>
      <span style="color:#d1d5db;font-size:12px">${node.description.slice(0, 120)}</span>
    </div>`;
  }, []);

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Legend */}
      <div className="absolute left-4 top-4 z-10 flex gap-4 rounded-md bg-white/90 px-3 py-2 text-xs dark:bg-gray-900/90">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-600" />
          Core entities
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-600" />
          Common types
        </span>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node: any, colour: string, ctx: CanvasRenderingContext2D) => {
          const radius = 6 + (node.propertyCount / 5);
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = colour;
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        nodeLabel={nodeTooltip}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={() => '#d1d5db'}
        linkWidth={1}
        width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 1280) : 1280}
        height={600}
        cooldownTicks={100}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700">
        {data.nodeCount} schemas · {data.edgeCount} references · Click a node to view its documentation ·
        Generated {new Date(data.generated).toLocaleDateString('en-GB')}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/schema-graph.tsx
git commit -m "feat: add interactive schema graph component"
```

---

## Task 9: Create schema graph page

**Repo:** openinheritorg

**Files:**
- Create: `src/app/docs/schemas/graph/page.tsx`

- [ ] **Step 1: Create the graph page**

Create `src/app/docs/schemas/graph/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SchemaGraph } from '@/components/schema-graph';

export const metadata: Metadata = {
  title: 'Schema Dependency Graph',
  description:
    'Interactive visualisation of how INHERIT schemas reference each other — core entities and common types.',
};

function loadGraphData() {
  const graphPath = join(process.cwd(), 'content', 'spec', 'dist', 'schema-graph.json');
  if (!existsSync(graphPath)) {
    return null;
  }
  return JSON.parse(readFileSync(graphPath, 'utf8'));
}

export default function SchemaGraphPage() {
  const data = loadGraphData();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/docs" className="hover:text-emerald-700">
          Docs
        </Link>{' '}
        /{' '}
        <Link href="/docs/schemas" className="hover:text-emerald-700">
          Schemas
        </Link>{' '}
        / Graph
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Schema Dependency Graph
      </h1>
      <p className="mt-3 max-w-3xl text-base text-gray-600">
        How INHERIT&rsquo;s {data?.nodeCount ?? '31+'} schemas reference each other. Each node is a
        schema — click to view its full documentation. Arrows show{' '}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">$ref</code> relationships.
      </p>

      <div className="mt-8">
        {data ? (
          <SchemaGraph data={data} />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
            Graph data not available. Run{' '}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-sm">pnpm run graph:data</code>{' '}
            in the openinherit repo and update the submodule.
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page builds**

Run:
```bash
cd /home/richardd/projects/openinheritorg
pnpm build 2>&1 | tail -20
```

Expected: Build succeeds. The graph page may show the "not available" fallback until the submodule is updated with dist/ data — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/app/docs/schemas/graph/page.tsx
git commit -m "feat: add schema dependency graph page"
```

---

## Task 10: Update schemas page with download button, graph link, and examples

**Repo:** openinheritorg

**Files:**
- Modify: `src/app/docs/schemas/page.tsx`

- [ ] **Step 1: Add action bar and examples section to schemas page**

At the top of `SchemasIndexPage` (after the `<p>` description paragraph and before `<SchemaTable>`), add:

```tsx
{/* Action bar */}
<div className="mt-6 flex flex-wrap gap-3">
  <Link
    href="/docs/schemas/graph"
    className="inline-flex items-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
  >
    View Schema Graph
  </Link>
  <a
    href="https://github.com/openinherit/openinherit/blob/main/dist/inherit-v1-bundled.json"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
  >
    Download Bundled Schema
  </a>
</div>
```

At the bottom (after the extension SchemaTable), add:

```tsx
{/* Validated Examples */}
<section className="mt-16 border-t border-gray-200 pt-10">
  <h2 className="text-lg font-semibold text-gray-900">
    Validated Example Documents
  </h2>
  <p className="mt-2 text-sm text-gray-600">
    Real INHERIT documents spanning 10 jurisdictions — each verified against the
    schemas in CI.
  </p>
  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {[
      { name: 'Minimal Estate', file: 'minimal-estate.json' },
      { name: 'English Family Estate', file: 'english-family-estate.json' },
      { name: 'Scottish Estate', file: 'scottish-estate.json' },
      { name: 'New York Estate', file: 'new-york-estate.json' },
      { name: 'Dubai Estate', file: 'dubai-estate.json' },
      { name: 'Mumbai Estate', file: 'mumbai-estate.json' },
      { name: 'Singapore Estate', file: 'singapore-estate.json' },
      { name: 'Tokyo Estate', file: 'tokyo-estate.json' },
      { name: 'Korean Estate', file: 'korean-estate.json' },
      { name: 'Catalogue Only', file: 'catalogue-only.json' },
    ].map(({ name, file }) => (
      <a
        key={file}
        href={`https://github.com/openinherit/openinherit/blob/main/examples/fixtures/${file}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-emerald-300 hover:bg-emerald-50"
      >
        <span className="text-emerald-600">✓</span>
        <span className="text-gray-700">{name}</span>
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Verify the page builds**

Run:
```bash
cd /home/richardd/projects/openinheritorg
pnpm build 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/docs/schemas/page.tsx
git commit -m "feat: add graph link, download button, and examples to schemas page"
```

---

## Task 11: Update home page with schema quality section

**Repo:** openinheritorg

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add schema quality section to home page**

Before the final `</>` closing tag in the Home component (after the last existing section), add a new section:

```tsx
{/* ── Schema Quality ───────────────────────────────────────── */}
<section className="py-20 bg-white border-b border-gray-200">
  <div className="mx-auto max-w-6xl px-6">
    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
      Built with rigour
    </h2>
    <p className="mt-3 text-base text-gray-500">
      Every schema is linted, formatted, tested, and bundled by the{' '}
      <a
        href="https://github.com/sourcemeta/jsonschema"
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-700 underline decoration-emerald-300 underline-offset-2"
      >
        Sourcemeta JSON Schema CLI
      </a>
      . Example documents are validated in CI across 10 jurisdictions.
    </p>
    <div className="mt-8 flex flex-wrap gap-3">
      <img
        alt="CI: Schema Validation"
        src="https://github.com/openinherit/openinherit/actions/workflows/validate-schemas.yml/badge.svg"
      />
      <img
        alt="CI: Tests"
        src="https://github.com/openinherit/openinherit/actions/workflows/run-tests.yml/badge.svg"
      />
      <img
        alt="CI: Examples Validated"
        src="https://github.com/openinherit/openinherit/actions/workflows/validate-examples.yml/badge.svg"
      />
      <img
        alt="CI: Schema Bundled"
        src="https://github.com/openinherit/openinherit/actions/workflows/bundle-and-inspect.yml/badge.svg"
      />
    </div>
    <div className="mt-6 flex flex-wrap gap-4">
      <Link
        href="/docs/schemas/graph"
        className="inline-flex items-center gap-1 text-base font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2"
      >
        Explore the schema graph →
      </Link>
      <a
        href="https://github.com/openinherit/openinherit/blob/main/dist/inherit-v1-bundled.json"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-base font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2"
      >
        Download the bundled schema →
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify the page builds**

Run:
```bash
cd /home/richardd/projects/openinheritorg
pnpm build 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add schema quality section to home page"
```

---

## Task 12: Update docs hub with graph link

**Repo:** openinheritorg

**Files:**
- Modify: `src/app/docs/page.tsx`

- [ ] **Step 1: Add graph entry to the docs hub**

Find the documentation links/cards section in `src/app/docs/page.tsx` and add a new entry for the schema graph:

```tsx
{
  title: 'Schema Graph',
  description: 'Interactive visualisation of how schemas reference each other.',
  href: '/docs/schemas/graph',
}
```

The exact insertion point depends on the existing structure — add it alongside the other schema-related links.

- [ ] **Step 2: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "docs: add schema graph link to docs hub"
```

---

## Task 13: Update submodule and final verification

**Repo:** openinheritorg

- [ ] **Step 1: Update the content/spec submodule**

After the openinherit PR is merged and CI has generated `dist/`:

```bash
cd /home/richardd/projects/openinheritorg
cd content/spec
git pull origin main
cd ../..
git add content/spec
git commit -m "chore: update spec submodule with dist/ artefacts"
```

- [ ] **Step 2: Run the website locally and verify**

```bash
pnpm dev
```

Check:
- `/docs/schemas` — download button visible, graph link visible, examples section at bottom
- `/docs/schemas/graph` — interactive graph renders with nodes and edges
- `/` (home page) — schema quality section with CI badges
- `/docs` — graph link present

- [ ] **Step 3: Push and deploy**

```bash
git push origin main
```

Vercel deploys automatically.
