# Narrative Template

This template shows how to generate a human-readable estate summary from an INHERIT JSON document. Implementations should adapt the language to the jurisdiction and audience — for example, using "executor" in English common-law jurisdictions but "personal representative" in others, or adjusting currency formatting and date conventions to local norms.

Each section below provides a template pattern that implementations can populate from the corresponding INHERIT arrays and objects. Optional sections should be omitted when the underlying data is empty.

---

## Sections

### 1. Testator

**Source:** `people[]` where `roles` includes `"testator"`, cross-referenced with `estate.jurisdiction`.

**Template:**

> "{givenName} {familyName}, born {dateOfBirth}, of {contact.address}. {He/She/They} {is/are} domiciled in {jurisdiction.name}."

Use the testator's `contact.address` fields to build a formatted postal address. Select pronoun from context or default to "They" when unspecified.

---

### 2. People Involved

**Source:** `people[]`, `kinships[]`, `relationships[]`, `executors[]`, `guardians[]`.

**Template:**

List all people grouped by role type. For each person, include their relationship to the testator where it can be resolved from `kinships` (e.g., parent-child) or `relationships` (e.g., spouse/civil partner).

> **Executors:** {name} — {relationship to testator}
>
> **Beneficiaries:** {name} — {relationship to testator}
>
> **Guardians:** {name} — appointed guardian for {child name}

---

### 3. Properties

**Source:** `properties[]`.

**Template:**

> "{name} — a {propertyType} property held on {tenureType} basis, valued at {estimatedValue}."

Include `isPrimaryResidence` as a qualifier (e.g., "the testator's primary residence"). Format the value using the specified `currency`.

---

### 4. Assets

**Source:** `assets[]`.

**Template:**

> "{name} ({category}) — valued at approximately {estimatedValue}."

Group assets by `category`. Note any with urgency flags or special handling requirements. Where an `assetCollection` groups multiple assets, present the collection heading first with its aggregated value, then list the individual items beneath.

---

### 5. Liabilities

**Source:** `liabilities[]`.

**Template:**

> "{name} — {liabilityType}, {amount} owed to {creditor}."

If no liabilities exist, state: "No liabilities are recorded against this estate."

---

### 6. Bequests

**Source:** `bequests[]`, cross-referenced with `people[]` to resolve beneficiary names.

**Template:**

> "{bequestType}: {description} to {beneficiary name}."

Present bequests in a natural order: specific bequests first, then pecuniary, then residuary. Resolve `beneficiaryId` to a full name from the `people` array.

---

### 7. Tax Position

**Source:** `taxPosition`.

**Template:**

> "The estate has an estimated gross value of {grossEstateValue}. After applying {count} exemptions totaling {total exemptions}, the taxable estate is {taxableEstate}, resulting in an estimated {jurisdiction} inheritance tax liability of {estimatedLiability} at an effective rate of {effectiveRate}%."

Always include the disclaimer from `taxPosition.disclaimer`. If no tax position has been calculated, state: "No tax position has been computed for this estate."

---

### 8. Completeness

**Source:** `completeness`.

**Template:**

> "This estate plan is {score}% complete. {count} items require attention: {list incomplete items}."

Present incomplete items as a bulleted list with their severity or category.

---

### 9. Recommended Actions

**Source:** `recommendedActions[]`.

**Template:**

For each action, ordered by priority (critical first):

> "[{priority}] {title} — {description}"

---

### 10. Conformance

**Source:** `conformance`.

**Template:**

> "This document conforms to INHERIT {schemaVersion} at Level {level}. Validated on {validatedAt} by {validatedBy}."

---

## Worked Example

The following narrative is generated from the `english-family-estate.json` fixture. It demonstrates how structured INHERIT data translates into a professional estate summary.

---

### Estate Summary for James Ashford

**Prepared from INHERIT v1 data — 27 March 2026**

James Ashford, born 14 May 1968, of 42 Acacia Avenue, Bristol BS8 1AB, United Kingdom. He is domiciled in England & Wales.

**People involved in this estate:**

- **Executor:** Catherine Ashford (spouse) — appointed as primary executor.
- **Beneficiaries:** Catherine Ashford (spouse); Oliver Ashford (son, born 11 March 1995); Emily Ashford (daughter, born 3 July 2015).
- **Guardian:** Sarah Mitchell — appointed as testamentary guardian for Emily Ashford, who is a minor.

**Real property:**

42 Acacia Avenue, Bristol — a detached property held on an ownership basis. This is the testator's primary residence. The property is solely owned and has an estimated value of £450,000.

**Financial assets:**

Barclays Savings Account (savings account) — valued at approximately £85,000.

The combined gross estate value is approximately £535,000.

**Liabilities:**

No liabilities are recorded against this estate.

**Bequests:**

1. *Specific bequest:* The property at 42 Acacia Avenue, Bristol is given to Catherine Ashford (spouse) absolutely.
2. *Pecuniary bequest:* The sum of £10,000 is given to Oliver Ashford (son).
3. *Residuary bequest:* The residue of the estate is given to Catherine Ashford (spouse).

In effect, Catherine receives the family home and whatever remains after the specific cash gift to Oliver. Emily, as a minor, is not a direct beneficiary of the estate at this time, though she is protected by the appointment of Sarah Mitchell as her testamentary guardian should both parents be unable to care for her.

**Tax position:**

The estate has an estimated gross value of £535,000. After applying the nil-rate band of £325,000 and the residence nil-rate band of £175,000, the taxable estate is £35,000, resulting in an estimated inheritance tax liability of £14,000 at an effective rate of 2.6%. The spousal exemption would likely eliminate this liability entirely, as the majority of the estate passes to Catherine Ashford as surviving spouse — however, this depends on the order in which the bequests are satisfied.

*Disclaimer: This estimate is for planning purposes only and does not constitute tax advice. The actual liability will depend on the values at the date of death and the tax legislation in force at that time. Professional advice should be sought.*

**Completeness:**

This estate plan is 72% complete. Four items require attention:

- No replacement executor has been named in case Catherine Ashford is unable or unwilling to act.
- No provision has been made for what happens to Emily's share of the residuary estate should Catherine predecease James.
- Digital assets (online accounts, cryptocurrency, intellectual property) have not been addressed.
- No letter of wishes has been prepared to accompany the will.

**Recommended actions:**

- **[Critical]** Appoint a substitute executor — if Catherine is unable to act, the estate would require a court-appointed administrator.
- **[High]** Add a survivorship clause — specify what happens to the estate if Catherine does not survive James by 28 days.
- **[Medium]** Inventory digital assets — document online accounts, subscriptions, and any digital property with access credentials stored securely.
- **[Low]** Prepare a letter of wishes — provide non-binding guidance to the executor on funeral preferences, personal items, and the care of Emily.

**Conformance:**

This document conforms to INHERIT v1 at Level 2 (Structured). Validated on 27 March 2026 by INHERIT Validator v1.0.0.

---

*This narrative was generated from structured data. It is not a legal document and does not replace professional legal advice. The INHERIT standard enables this kind of human-readable output from any compliant system, ensuring that the story of an estate is never locked inside a proprietary format.*
