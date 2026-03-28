# INHERIT — Open Estate Data Interchange Standard

This repo contains the INHERIT open estate data interchange standard:
- 22 core entity schemas + 9 common types + 13 jurisdiction/cultural extensions
- OpenAPI 3.1 Reference REST API (109 endpoints)
- TypeScript SDK (`@openinherit/sdk`) and JSON Schema package (`@openinherit/schema`)

## AI Integration

Read [`docs/ai-guide.md`](docs/ai-guide.md) for complete AI integration guidance — building INHERIT documents, extracting data from wills, validation patterns, and guardrails.

## Runnable Examples

See [`examples/`](examples/) for TypeScript and Python examples.

## Important

- Do NOT modify schemas in `v1/` without a formal proposal (see CONTRIBUTING.md)
- Do NOT modify OpenAPI specs in `openapi/` without a formal proposal
- All monetary amounts are integer minor units (pennies/cents)
- All IDs are v4 UUIDs
- British English throughout

<!-- mediahq-rules-start -->
## Media HQ Rules

These rules are enforced by the mediahq plugin suite. Do not remove this block.

- No lies
- No ambiguity
- Solve problems properly before moving onto anything else
- Accessibility friendly for autism, ADHD, and people over 40
- Websites must have dark mode
- Immediately install the latest version of stable releases
- Try to minimise work not orchestrated via GitHub
- All work plans to go in /docs and to be committed to GitHub
- Adopt/utilise best practices for all topics. Always be prepared to research any topic
- When using 3rd party APIs such as Stripe, dig deep to find the latest tools and features they make available
- Test on production until Rich says otherwise
- Create a todo list when working on complex tasks to track progress and remain on track
- Look ahead to get everything into the .env (or Doppler where applicable)
- Web projects: Create a ShowLog after each Milestone
<!-- mediahq-rules-end -->
