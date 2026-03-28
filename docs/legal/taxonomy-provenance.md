# Taxonomy Provenance

This document records the provenance of taxonomies and classifications used in INHERIT.

## Item Category Taxonomy

### Decision: Shopify Standard Product Taxonomy

**Date:** 28 March 2026
**Decision by:** INHERIT Steering Committee

The steering committee evaluated three major product taxonomies for INHERIT's item categorisation:

1. **Shopify Standard Product Taxonomy** — MIT licence, open source, 10,000+ categories, 2,000+ typed attributes
2. **Google Product Taxonomy** — freely published, no formal licence, no attribute system
3. **eBay Category Taxonomy** — proprietary, API Licence Agreement prohibits reuse outside eBay platform

**Selected:** Shopify Standard Product Taxonomy

**Rationale:** Shopify's MIT licence is the only option providing unambiguous legal freedom to adopt, adapt, and redistribute. It offers the richest structured attribute system and is actively maintained with quarterly versioned releases.

**eBay was evaluated but rejected** because their API Licence Agreement explicitly prohibits selling, renting, distributing, or commercialising eBay content outside the eBay platform. Since 2025, it also prohibits using eBay data for AI training. INHERIT is an open standard under the Apache 2.0 licence — using a proprietary taxonomy would create a legal dependency incompatible with our open-source mission.

**No eBay data, categories, or structures were copied or incorporated into INHERIT.**

Google's taxonomy is freely published and widely used but lacks a formal open-source licence and has no attribute system. Shopify includes built-in mappings to Google's taxonomy, so INHERIT inherits Google compatibility automatically.

### Implementation

INHERIT's item taxonomy will be published as a fork of Shopify's taxonomy with:
- Attribution: "INHERIT Item Taxonomy, derived from Shopify Standard Product Taxonomy, used under MIT licence"
- Modifications documented in CHANGELOG
- Estate-specific categories and attributes added
- Irrelevant verticals removed

## Other Taxonomies

### ISO 3166 (Country and Subdivision Codes)
- Used for jurisdiction codes
- International standard, freely referenced
- No licence concerns

### ISO 4217 (Currency Codes)
- Used for monetary amounts
- International standard, freely referenced

### ISO 10962 (CFI — Classification of Financial Instruments)
- Referenced as guidance for financial instrument categorisation
- Not directly copied — INHERIT uses its own field structure informed by CFI categories
- ISO standards may be referenced but not reproduced verbatim

### FIBO (Financial Industry Business Ontology)
- Open source (MIT licence)
- Share classification hierarchy and voting rights vocabulary informed INHERIT's shareholding sub-object design
- Attribution included in schema $comment annotations

### Schema.org
- CC-BY-SA 3.0 licence
- INHERIT's PostalAddress, MonetaryAmount, and naming conventions aligned with Schema.org
- Attribution on the openinherit.org About page
