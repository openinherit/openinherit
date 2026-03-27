# Changelog

All notable changes to the INHERIT standard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Developer examples in `examples/` — 4 TypeScript examples (create-estate, validate-document, import-export, extract-entities) and 1 Python example (validate)
- 9 global example fixtures covering 7 jurisdictions (GB-ENG, GB-SCT, US-NY, SG, JP, IN-MH, AE) plus an intentionally invalid fixture for testing
- AI integration guide (`docs/ai-guide.md`) with extraction prompts, tool schemas, and guardrails
- Agent configuration files for Claude Code, OpenAI Codex, GitHub Copilot, and Cursor
- Error guide (`docs/error-guide.md`) — validation errors explained with fixes
- Migration guide (`docs/migration-guide.md`) — migrating from databases, spreadsheets, and other formats
- `ROADMAP.md` — v1.0 through v2.0 roadmap
- Swagger UI API explorer at `swagger/index.html` (served via GitHub Pages)
- README overhaul: npm badges, "What Next?" navigation, conformance testing guide, data handling statement, contributors section, learning resources
- TypeScript code blocks added to the primer alongside existing JSON examples
- 5 good-first-issue GitHub issues for community contributors

## [1.0.0] — 2026-03-26

### Added
- 18 core entity schemas
- 5 common type schemas
- 13 jurisdiction/cultural extension schemas
- Extension manifests and registry
- OpenAPI 3.1 schema bundle with validate endpoint
- Language-agnostic test suite (33 test cases)
- SDK generation pipeline (TypeScript + API client)
- Governance, contributing, and security documentation
- Developer documentation (primer, maturity model, conformance levels, extension guide)
- Partner onboarding documentation
- Reference REST API spec (`reference-api.yaml`) — 109 endpoints covering CRUD, import/export, couples, validation
- Reference data (regulatory bodies, practitioner activities, data protection rules)
- CI pipelines (schema validation, OpenAPI lint, test suite, type generation)
- Issue and PR templates
- RFC-style proposal template
