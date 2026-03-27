# Self-Hosted Will-to-INHERIT Scanner

How to run the will-scanner extraction pipeline on your own infrastructure — so no document data passes through openinherit.org.

## What the Scanner Does

The will-scanner converts PDF estate documents into structured INHERIT JSON:

1. **Text extraction** — extracts text from the PDF (using PDF.js for digital PDFs, or vision analysis for scanned documents)
2. **AI extraction** — sends the extracted text to an LLM with a structured prompt and tool schema, receiving typed entity data back
3. **Document assembly** — assembles the extracted entities into a valid INHERIT root document with UUIDs, cross-references, and empty arrays for any missing entity types

The public scanner at [openinherit.org/tools/will-scanner](https://www.openinherit.org/tools/will-scanner) performs all three steps, transmitting document content to Anthropic's Claude API for step 2. Self-hosting lets you control that data flow.

## Architecture

```
Your PDF → [Text Extraction] → plain text → [LLM API] → entities → [Assembly] → INHERIT JSON
                                                 ↑
                                        Your API key,
                                        your infrastructure
```

## Source Files

The extraction pipeline lives in the website repository at `src/lib/scanner/`:

| File | Purpose | Lines |
|------|---------|-------|
| `extract-text.ts` | PDF text extraction (server-side) | ~50 |
| `claude-extract.ts` | LLM extraction with system prompt and tool schema | ~290 |
| `assemble-document.ts` | Entity assembly into INHERIT root document | ~230 |
| `rate-limit.ts` | Rate limiting utility | ~40 |

Total: approximately 610 lines of TypeScript.

## Setup

### 1. Clone the extraction code

```bash
git clone https://github.com/openinherit/openinherit.org.git
cd openinherit.org/src/lib/scanner
```

Copy these four files into your own project:
- `extract-text.ts`
- `claude-extract.ts`
- `assemble-document.ts`
- `rate-limit.ts`

### 2. Install dependencies

```bash
npm install @anthropic-ai/sdk    # Claude API client
npm install pdfjs-dist            # PDF text extraction
```

### 3. Set your API key

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

This is your key, billed to your account. No data passes through openinherit.org.

### 4. Run extraction

```typescript
import { extractText } from './extract-text';
import { extractEntities } from './claude-extract';
import { assembleDocument } from './assemble-document';

// Step 1: Extract text from PDF
const text = await extractText(pdfBuffer);

// Step 2: Send to Claude for entity extraction
const entities = await extractEntities(text);

// Step 3: Assemble into INHERIT document
const document = assembleDocument(entities);

// Result: a valid INHERIT JSON document
console.log(JSON.stringify(document, null, 2));
```

### 5. Deploy

Run as a standalone Node.js script, integrate into your own API, or wrap in a serverless function. The extraction pipeline has no dependencies on the openinherit.org infrastructure.

## Data Flow

When self-hosted, the data flow is:

```
Your server → Anthropic API → Your server
```

No data passes through openinherit.org. The only external service involved is the LLM provider (Anthropic by default).

## Alternative LLM Providers

The extraction pipeline uses Claude's `tool_use` feature for structured output. If your organisation needs to avoid Anthropic entirely, the extraction prompt and tool schema can be adapted for:

- **Local models** — Llama, Mistral, or other open models with tool/function calling support
- **Azure OpenAI** — with data residency guarantees for your region
- **AWS Bedrock** — Claude or other models via your AWS account with VPC controls
- **Google Vertex AI** — Gemini models with Google Cloud data handling

The key components to adapt are:

1. **System prompt** — the extraction instructions (see `docs/ai-guide.md` § Section 2)
2. **Tool schema** — the structured output definition (Claude `tool_use` format, adaptable to OpenAI function calling or other frameworks)
3. **API client** — replace the `@anthropic-ai/sdk` client with your provider's SDK

The system prompt and tool schema are documented in full in the [AI Integration Guide](ai-guide.md).

## Compliance Considerations

Self-hosting addresses common compliance requirements:

- **Data residency** — documents never leave your network (except to the LLM provider, if using a cloud API)
- **Audit trail** — you control logging and audit of all document processing
- **Access control** — integrate with your existing identity and access management
- **Retention policy** — you control how long extracted data is retained
- **DPA coverage** — your data processing agreement with the LLM provider covers the API calls

For maximum data isolation, pair self-hosting with a local LLM deployment — no data leaves your network at all.

## Support

For questions about self-hosting the scanner, file an issue on the [openinherit/openinherit](https://github.com/openinherit/openinherit) repository or email hello@openinherit.org.
