# Sourcemeta Advanced Features — Bundle, Validate, Inspect

**Date:** 28 March 2026
**Status:** Approved
**Approach:** Hybrid — CI generates artefacts, website consumes them

## Overview

Extend INHERIT's use of the Sourcemeta JSON Schema CLI beyond lint/fmt/test to include three new capabilities: schema bundling, example validation, and schema inspection. These produce artefacts that are both visible in the GitHub repo (badges, downloadable files) and rendered on openinherit.org (interactive graph, validated examples, download button).

The goal is to maximise technical credibility for evaluators reviewing the repo and website — particularly senior technical staff at prospective partner organisations.

## 1. Bundle — Single-File Schema Distribution

### What it produces

A single self-contained JSON Schema file (`dist/inherit-v1-bundled.json`) where all `$ref` references across the 31+ schema files are inlined into `$defs`. Consumers download one file and validate INHERIT documents without needing the full schema tree.

### CI workflow

New workflow `bundle-schema.yml`:
- **Triggers:** Push to `main` touching `v1/` files
- **Steps:**
  1. Checkout, pnpm setup, Node 22
  2. Run `jsonschema bundle v1/schema.json --resolve v1/ --resolve v1/common/`
  3. Write output to `dist/inherit-v1-bundled.json`
  4. Check for changes, auto-commit if changed
- **Badge:** Added to README

### npm script

```
"bundle:schema": "jsonschema bundle v1/schema.json --resolve v1/ --resolve v1/common/ > dist/inherit-v1-bundled.json"
```

### Website integration

- "Download Bundled Schema" button on `/docs/schemas`
- Links to raw file on GitHub for direct download
- Mentioned in home page quick-start section

## 2. Validate — Example Documents Verified in CI

### What it produces

A CI step that runs `jsonschema validate` against every fixture in `examples/fixtures/` (12 reference documents spanning 10 jurisdictions). If any fixture fails validation, CI goes red.

### CI workflow

New workflow `validate-examples.yml`:
- **Triggers:** Push to `main` touching `v1/`, `examples/fixtures/`, or `dist/`
- **Steps:**
  1. Checkout, pnpm setup, Node 22
  2. Run `jsonschema validate` for each fixture against `v1/schema.json`, resolving all schemas
  3. Exclude `broken-references.json` (intentionally invalid fixture for error-handling examples)
- **Badge:** Added to README

### npm script

```
"validate:examples": "jsonschema validate examples/fixtures/*.json --resolve v1/ --resolve v1/common/ --exclude examples/fixtures/broken-references.json"
```

Note: Exact flag syntax to be confirmed during implementation — `--exclude` may not exist; alternative is to list valid fixtures explicitly or use a shell glob that excludes the broken file.

### Fixture hygiene

`broken-references.json` is intentionally invalid. It exists so the TypeScript/Python/Go examples can demonstrate error handling. It must be excluded from the validation CI step.

### Website integration

- "Example Documents" section on `/docs/schemas` showing each fixture with a green validated indicator and download link
- Proves INHERIT works with real multi-jurisdictional data

## 3. Inspect — Interactive Schema Dependency Graph

### What it produces

Two artefacts:

#### 3a. Graph data (CI-generated)

`jsonschema inspect` runs against all schemas with `--json` and outputs machine-readable JSON to `dist/schema-graph.json` containing every schema's URI, `$ref` targets, and metadata (title, description).

Added as a step in `bundle-schema.yml` (same trigger, same files — no separate workflow needed).

#### 3b. Interactive graph (website)

New page at `/docs/schemas/graph` renders the graph data as an interactive force-directed diagram.

**Rendering library:** react-force-graph (preferred for React integration) or D3-force — evaluated during implementation based on bundle size and dark mode support.

**Graph features:**
- **Nodes** = schemas, colour-coded by category:
  - Core entities: emerald
  - Common types: blue
  - Extensions: amber
- **Edges** = `$ref` relationships with directional arrows
- **Click node** → navigates to `/docs/schemas/[entity]`
- **Hover node** → tooltip with title, description, connection count
- **Zoom/pan** for exploring the full topology
- **Legend** explaining colour categories
- **Dark mode** support via `prefers-color-scheme`
- **Responsive** layout using `max-w-7xl` container

### npm script

```
"inspect:schema": "jsonschema inspect v1/*.json v1/common/*.json --resolve v1/ --resolve v1/common/ --json > dist/schema-graph.json"
```

Note: Exact `inspect` flags to be confirmed during implementation — the `--json` output format needs to be examined to determine what transformation (if any) is needed before the website can consume it.

## 4. README and Repo Presentation

### Badges

Three new badges added to README, grouped with any existing badges:

```
[schemas validated] [examples verified] [schema bundled] [lint] [format]
```

### dist/ directory

New directory containing CI-generated artefacts:
- `dist/inherit-v1-bundled.json` — single-file bundled schema
- `dist/schema-graph.json` — inspect output for the website

Follows the same pattern as existing `generated/` and `openapi/*-bundled.yaml` artefacts (gitignored locally, committed by CI).

### Downloads section

Brief "Quick Start" or "Downloads" section in README pointing to the bundled schema and linking to the website.

## 5. Website Updates (openinheritorg)

### Pages affected

| Page | Change |
|------|--------|
| `/docs/schemas` | Add "Download Bundled Schema" button, "View Schema Graph" link, "Example Documents" section |
| `/docs/schemas/graph` (new) | Interactive force-directed dependency graph |
| `/docs` hub | Add graph link to documentation index |
| Home page (`/`) | Add "Schema Quality" section with CI badges and graph link |

### Submodule

`content/spec/` submodule updated to pick up `dist/` artefacts. The graph page reads `content/spec/dist/schema-graph.json` at build time and passes it as props to the client-side graph component.

### New dependency

One graph rendering library (react-force-graph or D3-force). Kept lightweight.

### Styling

Follows existing patterns: emerald accents, Tailwind utility classes, dark mode, responsive layout. Graph page uses full-width layout for the diagram.

## Implementation Order

1. **Bundle** — npm script, CI workflow, dist/ directory, README badge
2. **Validate** — npm script, CI workflow, README badge
3. **Inspect** — npm script, CI workflow step, dist/ output
4. **README** — badges and downloads section
5. **Website: graph page** — new `/docs/schemas/graph` with interactive diagram
6. **Website: schemas page** — download button, examples section, graph link
7. **Website: home page** — schema quality section
8. **Submodule sync** — update content/spec/ pointer

## Out of Scope

- Extension schemas in the bundle (core + common only for v1)
- `codegen` command (already handled by existing TypeScript generation pipeline)
- `install` command (no external schema dependencies yet)
- `compile` command (pre-compilation not needed at current scale)
- `encode`/`decode` (binary compression — no use case yet)
