# INHERIT — Open Estate Data Interchange Standard

This repo contains the INHERIT open estate data interchange standard:
- 22 core entity schemas + 7 common types + 13 jurisdiction/cultural extensions
- OpenAPI 3.1 Reference REST API (109 endpoints)
- TypeScript SDK (`@openinherit/sdk`) and JSON Schema package (`@openinherit/schema`)

## AI Integration

Read `docs/ai-guide.md` for complete AI integration guidance — building INHERIT documents, extracting data from wills, validation patterns, and guardrails.

## Runnable Examples

See `examples/` for TypeScript and Python examples.

## Rules

- Do NOT modify schemas in `v1/` without a formal proposal (see CONTRIBUTING.md)
- Do NOT modify OpenAPI specs in `openapi/` without a formal proposal
- All monetary amounts are integer minor units (pennies/cents)
- All IDs are v4 UUIDs
- British English throughout
