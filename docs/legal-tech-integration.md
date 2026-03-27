# Legal Tech Integration Guide

How INHERIT fits with existing estate planning and legal practice management software.

## Overview

Most law firms and estate planning professionals use case management or practice management software. INHERIT is designed to sit alongside these tools — not replace them. The typical integration pattern is:

1. **Import:** Receive an INHERIT JSON document from a client or another firm → map fields into your case management system
2. **Export:** Extract estate data from your case management system → produce an INHERIT JSON document for portability

This guide covers field mappings and integration patterns for four major platforms.

---

## Field Mappings

### Person Fields

| INHERIT Field | Clio | LEAP | Actionstep | PracticePanther |
|--------------|------|------|------------|-----------------|
| `person.givenName` | `contact.first_name` | `matter_party.first_name` | `participant.first_name` | `contact.first_name` |
| `person.familyName` | `contact.last_name` | `matter_party.last_name` | `participant.last_name` | `contact.last_name` |
| `person.dateOfBirth` | `contact.date_of_birth` | `matter_party.dob` | `participant.date_of_birth` | `contact.birthday` |
| `person.email` | `contact.email_addresses[0]` | `matter_party.email` | `participant.email` | `contact.email` |
| `person.phone` | `contact.phone_numbers[0]` | `matter_party.phone` | `participant.phone` | `contact.phone` |
| `person.address` | `contact.addresses[0]` | `matter_party.address` | `participant.address` | `contact.address` |

### Estate/Matter Fields

| INHERIT Field | Clio | LEAP | Actionstep | PracticePanther |
|--------------|------|------|------------|-----------------|
| `estate.jurisdiction` | `matter.practice_area` (custom field) | `matter.jurisdiction` | `action.division` | `matter.practice_area` |
| `estate.testatorPersonId` | `matter.client.id` | `matter.client_id` | `action.primary_participant` | `matter.contact_id` |
| `estate.createdAt` | `matter.created_at` | `matter.created_date` | `action.created_timestamp` | `matter.created_at` |

### Asset/Property Fields

Most case management systems do not have structured asset tracking at the field level. The typical approach is:

- **Clio:** Use custom fields on the matter, or a linked custom object
- **LEAP:** Use matter-linked documents or the estate planning module (if available)
- **Actionstep:** Use data collections linked to the action
- **PracticePanther:** Use custom fields on the matter

INHERIT's structured asset and property data is typically richer than what case management systems store. The integration pattern is to store the full INHERIT JSON as an attachment and map key summary fields (total estate value, number of beneficiaries) into the case management system for search and reporting.

---

## Integration Patterns

### Pattern 1: INHERIT JSON as Intake Document

The most common integration. A client or referring firm provides an INHERIT JSON file. Your system imports it:

```
Client uploads INHERIT JSON
    → Your API receives the file
    → Parse JSON, validate against INHERIT schema
    → Create a new matter/case in your system
    → Map person fields to contacts
    → Map estate fields to matter metadata
    → Store the full INHERIT JSON as an attachment
    → Flag any validation warnings for review
```

This eliminates manual re-keying from PDFs. The structured data goes straight into your system.

### Pattern 2: Export for Client Portability

A client requests their data (GDPR Article 20, or simply moving firms). Your system exports an INHERIT JSON document:

```
Client requests data export
    → Query matter/case for all related contacts and custom fields
    → Map contacts to INHERIT person entities
    → Map custom fields to INHERIT asset/property entities
    → Generate UUIDs for all entities
    → Set cross-references (testatorPersonId, beneficiaryId, etc.)
    → Validate against INHERIT schema
    → Deliver INHERIT JSON to client
```

### Pattern 3: Webhook on Estate Completion

For platforms that support webhooks (Clio, Actionstep), trigger an INHERIT export when an estate matter reaches a specific status:

```
Matter status changes to "Complete"
    → Webhook fires to your integration endpoint
    → Endpoint queries the matter API for all data
    → Generates INHERIT JSON
    → Stores in document management or sends to client
```

### Pattern 4: Periodic Sync

For firms managing multiple estates, a scheduled job can export all active estates as INHERIT JSON for backup, portability, or regulatory compliance:

```
Nightly job runs
    → Query all active estate matters
    → For each matter, generate INHERIT JSON
    → Store in encrypted backup location
    → Log export for audit trail
```

---

## Common Challenges

### UUID Mapping

INHERIT uses v4 UUIDs for all entity identifiers. Case management systems typically use auto-increment integers or their own ID formats. You'll need a mapping table:

| INHERIT UUID | System ID | Entity Type |
|-------------|-----------|-------------|
| `a1b2c3d4-...` | `12345` | Person |
| `e5f6g7h8-...` | `67890` | Matter |

On import, generate new UUIDs. On export, generate UUIDs from your system IDs (deterministic UUID v5 from a namespace is one approach, or store the mapping).

### Monetary Amounts

INHERIT uses integer minor units (e.g. 150000 for £1,500.00). Most case management systems store decimal amounts. Convert on import and export:

- **Import:** `inheritAmount / 100` → decimal for your system
- **Export:** `yourAmount * 100` → integer for INHERIT (round to nearest integer)

### Missing Data

INHERIT requires all 15 entity arrays to be present (empty arrays are valid). When exporting from a case management system, you'll likely have data for people and perhaps assets, but not for every INHERIT entity type. That's fine — export what you have and leave the rest as empty arrays. The document will still pass Level 1 validation.

---

## Getting Started

1. Read the [INHERIT Primer](primer.md) to understand the data model
2. Review the [example fixtures](../examples/fixtures/) for real-world document examples
3. Use the [web validator](https://www.openinherit.org/tools/validator) to test your generated documents
4. File an issue on [GitHub](https://github.com/openinherit/openinherit) if you need help with a specific platform

## Support

For integration consulting, Testate Technologies offers support for firms building their own INHERIT integrations. Contact [partners@openinherit.org](mailto:partners@openinherit.org) for details.
