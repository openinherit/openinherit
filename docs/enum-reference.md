# Enum Reference

A comprehensive reference of all enumerated values across INHERIT v1 schemas.

---

## Summary by Schema

| Schema | Enum Fields |
|--------|-------------|
| [asset](#asset) | `category`, `valuationConfidence`, `condition`, `possessionStatus`, `mobilityType`, `acquisitionType`, `registrationStatus`, `ownershipEvidence` |
| [attestation](#attestation) | `method`, `attestationType`, `witnessConflictCheckScope` |
| [bequest](#bequest) | `type`, `interestType`, `distributionMethod`, `predeceaseRule`, `constrainedBy`, `response`, `type` (BeneficiaryOrganisation), `type` (PostDeathAction) |
| [dealer-interest](#dealer-interest) | `type` (InterestedParty), `interestLevel`, `offerStatus`, `testatorDisposition`, `privacyLevel`, `communicationInitiatedBy` |
| [estate](#estate) | `status`, `willType`, `primaryInstrument`, `defaultPropertyRegime`, `claimNature`, `calculationBasis`, `applicableTo`, `type` (AdjudicatingBody), `resolutionStatus`, `status` (ancillaryProbate) |
| [executor](#executor) | `role`, `grantType` |
| [guardian](#guardian) | `role`, `appointmentType`, `guardianshipStructure` |
| [kinship](#kinship) | `type`, `legalStatus`, `legitimacy` |
| [liability](#liability) | `type` |
| [nonprobate-transfer](#nonprobate-transfer) | `type` |
| [person](#person) | `type` (titles), `gender`, `roles`, `system` (legalPersonalities), `fatcaStatus` |
| [property](#property) | `propertyType`, `valuationConfidence`, `ownershipType`, `ownershipModel`, `acquisitionType`, `tenureType`, `registrationStatus`, `ownershipEvidence`, `successionRule`, `mobilityType`, `characterClassification` |
| [proxy-authorisation](#proxy-authorisation) | `consentMethod`, `scope` |
| [relationship](#relationship) | `type`, `type` (RelationshipEvent), `type` (FinancialInstrument), `status` (FinancialInstrument), `currentStatus`, `propertyRegime`, `maharType`, `brideStatus` |
| [trust](#trust) | `type`, `creationType`, `revocability`, `interestType`, `role` (TrustAppointee), `powerType` (reservedPowers), `automaticOrDiscretionary` (fleeClause), `powerType` (protectorPowers) |
| [wish](#wish) | `type`, `bindingNature` |

---

## Asset

| Field | Values | Description |
|-------|--------|-------------|
| `category` | `bank_account`, `savings_account`, `investment`, `pension`, `shares`, `premium_bonds`, `cryptocurrency`, `insurance`, `vehicle`, `jewellery`, `art`, `antiques`, `collectibles`, `furniture`, `electronics`, `musical_instruments`, `books`, `clothing`, `kitchenware`, `sports_equipment`, `firearms`, `wine_and_spirits`, `tools`, `garden_and_outdoor`, `business_interest`, `intellectual_property`, `domain_name`, `social_media_account`, `digital_subscription`, `sukuk`, `takaful`, `islamic_deposit`, `other` | Asset classification. Islamic finance types: sukuk (bond), takaful (insurance), islamic_deposit. |
| `valuationConfidence` | `estimated`, `professional`, `probate`, `unknown` | Source of valuation |
| `condition` | `excellent`, `good`, `fair`, `poor`, `unknown`, `not_applicable` | Physical condition. Use `not_applicable` for financial assets. |
| `possessionStatus` | `possessed_at_death`, `receivable`, `contingent` | Distinguishes assets held at death from those receivable after |
| `mobilityType` | `immoveable`, `moveable`, `mixed` | Relevant for Shia inheritance and French lex rei sitae |
| `acquisitionType` | `self_acquired`, `ancestral_joint`, `ancestral_severed`, `inherited`, `gifted`, `stridhan`, `communal`, `waqf_endowed` | How the asset was acquired |
| `registrationStatus` | `formally_registered`, `informally_held`, `community_acknowledged`, `disputed`, `undocumented` | Legal registration status |
| `ownershipEvidence` | `title_deed`, `certificate_of_occupancy`, `family_recognition`, `community_testimony`, `receipts_only`, `none` | Type of evidence proving ownership |

---

## Attestation

| Field | Values | Description |
|-------|--------|-------------|
| `method` | `in_person`, `video`, `remote`, `none`, `kinyan_sudar`, `kinyan_agav`, `seal_based`, `inkan_registered` | Execution method. Jewish (kinyan), Japanese (inkan) methods included. |
| `attestationType` | `written_signed`, `oral_witnessed`, `oral_community`, `seal_based` | Type of attestation formalities |
| `witnessConflictCheckScope` | `english_law`, `halachic_broad`, `shariah_standard`, `civil_law_standard`, `customary_oral`, `community_testimony` | Scope of beneficiary-as-witness conflict check |

---

## Bequest

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `specific`, `pecuniary`, `demonstrative`, `general`, `residuary`, `life_interest`, `class` | Core bequest types |
| `interestType` | `use_and_income`, `income_only`, `use_only`, `protective`, `right_of_residence` | Type of life interest |
| `distributionMethod` | `per_capita`, `per_stirpes`, `modified_per_stirpes`, `per_capita_at_each_generation`, `halachic_yerusha` | How class gifts distribute among issue |
| `predeceaseRule` | `lapse`, `per_stirpes`, `substitution`, `accrual`, `statutory_default` | What happens if beneficiary predeceases testator |
| `constrainedBy` | `testamentary_freedom`, `customary_rule`, `forced_heirship`, `religious_rule`, `coparcenary_survivorship` | Legal constraint on bequest |
| `beneficiaryOrganisation.type` | `charity`, `company`, `unincorporated_association`, `trust`, `other` | Organisation beneficiary types |
| `postDeathAction.type` | `disclaimer`, `deed_of_variation`, `appropriation`, `assent` | Actions after death affecting bequest |
| `inheritanceResponse.response` | `accepted`, `renounced`, `qualified_acceptance`, `pending` | Beneficiary's response to inheritance |

---

## Dealer Interest

| Field | Values | Description |
|-------|--------|-------------|
| `interestedParty.type` | `art_dealer`, `antique_dealer`, `property_investor`, `auction_house`, `gallery`, `private_collector`, `museum`, `institution`, `charity`, `developer`, `fund_manager`, `family_office`, `estate_agent`, `solicitor_firm`, `other` | Type of interested party |
| `interestLevel` | `exploratory`, `moderate`, `strong`, `committed` | Level of interest in asset |
| `offerStatus` | `standing_interest`, `verbal_offer`, `written_offer`, `formal_valuation`, `conditional_offer`, `accepted`, `declined`, `expired`, `withdrawn` | Current status of offer |
| `testatorDisposition` | `willing_to_sell`, `prefer_not_to_sell`, `hold_for_executor`, `deferred_to_family`, `promised_to_institution`, `undecided` | Testator's willingness to sell |
| `privacyLevel` | `testator_only`, `proxy_visible`, `executor_visible`, `all_parties` | Who can see this interest record |
| `communicationInitiatedBy` | `buyer`, `testator`, `proxy`, `executor` | Who started communication |

---

## Estate

| Field | Values | Description |
|-------|--------|-------------|
| `status` | `draft`, `active`, `locked`, `archived` | Estate lifecycle status |
| `willType` | `secular`, `religious`, `dual`, `composite`, `oral_witnessed`, `oral_customary`, `holographic`, `notarised`, `privileged_will` | Type of will/instrument |
| `primaryInstrument` | `will`, `revocable_trust`, `both`, `intestacy` | Primary succession instrument |
| `defaultPropertyRegime` | `community_property`, `separate_property`, `equitable_distribution`, `deferred_community`, `universal_community`, `participation_in_acquisitions`, `islamic_dower` | Marital property regime |
| `forcedHeirship.claimNature` | `property_share`, `cash_claim`, `usufruct`, `court_discretion` | Nature of forced heirship claim |
| `forcedHeirship.calculationBasis` | `fixed`, `per_child_sliding`, `court_discretion`, `conditional` | How reserved portion calculated |
| `forcedHeirship.applicableTo` | `children_only`, `children_and_spouse`, `all_descendants`, `all_heirs` | Who forced heirship applies to |
| `adjudicatingBody.type` | `secular_court`, `religious_court`, `beth_din`, `shariah_court`, `tribal_court`, `family_court`, `family_council`, `community_elders`, `partition_meeting`, `karta_decision`, `maori_land_court`, `high_court` | Type of adjudicating body |
| `successionConflict.resolutionStatus` | `unresolved`, `resolved`, `pending_court`, `pending_arbitration` | Status of conflict resolution |
| `ancillaryProbate.status` | `not_started`, `applied`, `granted`, `completed`, `waived` | Status of ancillary probate |

---

## Executor

| Field | Values | Description |
|-------|--------|-------------|
| `role` | `primary`, `secondary`, `substitute`, `administrator`, `administrator_with_will_annexed` | Executor role in administration |
| `grantType` | `grant_of_probate`, `letters_of_administration`, `letters_of_administration_with_will_annexed`, `resealing`, `european_certificate_of_succession` | Type of grant obtained |

---

## Guardian

| Field | Values | Description |
|-------|--------|-------------|
| `role` | `primary`, `secondary`, `substitute` | Guardian role |
| `appointmentType` | `testamentary`, `parental_responsibility`, `court_appointed`, `shariah_court_appointed`, `community_appointed`, `religious_court_appointed` | How guardian was appointed |
| `guardianshipStructure` | `individual`, `collective`, `rotating`, `family_council_determined` | Structure of guardianship |

---

## Kinship

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `PARENT_CHILD_BIOLOGICAL`, `PARENT_CHILD_ADOPTED`, `PARENT_CHILD_STEP`, `PARENT_CHILD_FOSTER`, `PARENT_CHILD_ACKNOWLEDGED`, `SIBLING`, `HALF_SIBLING_PATERNAL`, `HALF_SIBLING_MATERNAL`, `STEP_SIBLING`, `GRANDPARENT_GRANDCHILD`, `UNCLE_NEPHEW`, `AUNT_NEPHEW` | Type of familial relationship |
| `legalStatus` | `recognised`, `contested`, `pending`, `unrecognised` | Legal recognition status |
| `legitimacy` | `legitimate`, `illegitimate`, `legitimated`, `not_applicable` | Legitimacy status for inheritance purposes |

---

## Liability

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `mortgage`, `personal_loan`, `credit_card`, `overdraft`, `student_loan`, `car_finance`, `hire_purchase`, `mahr`, `ketubah_debt`, `lobola`, `tax_liability`, `funeral_costs`, `care_fees`, `mezonot`, `other` | Debt type. Cultural obligations: mahr (Islamic), ketubah_debt (Jewish), lobola (African), mezonot (Jewish maintenance) |

---

## Nonprobate Transfer

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `revocable_trust`, `tod_deed`, `pod_account`, `jtwros`, `tenancy_by_entirety`, `beneficiary_designation`, `life_insurance_nomination`, `superannuation_nomination`, `cpf_nomination`, `epf_nomination`, `mandatory_savings_nomination` | Transfer mechanism. CPF (Singapore), EPF (Malaysia), superannuation (Australia) |

---

## Person

| Field | Values | Description |
|-------|--------|-------------|
| `titles[].type` | `chieftaincy`, `traditional`, `religious`, `professional`, `honorific`, `clan`, `academic`, `military`, `other` | Title classification |
| `gender` | `male`, `female`, `non_binary`, `other`, `prefer_not_to_say`, `unknown` | Gender for inheritance calculations |
| `roles` | `testator`, `beneficiary`, `executor`, `guardian`, `trustee`, `witness`, `attorney`, `proxy`, `protector`, `enforcer` | Person's function in estate |
| `legalPersonalities[].system` | `statutory`, `customary`, `religious`, `traditional` | Legal identity system |
| `taxResidency[].fatcaStatus` | `us_person`, `non_us_person`, `exempt`, `unknown` | FATCA classification |

---

## Property

| Field | Values | Description |
|-------|--------|-------------|
| `propertyType` | `detached_house`, `semi_detached_house`, `terraced_house`, `flat`, `maisonette`, `bungalow`, `cottage`, `farmhouse`, `barn_conversion`, `land`, `commercial`, `mixed_use`, `houseboat`, `mobile_home`, `other` | Type of property |
| `valuationConfidence` | `estimated`, `professional`, `probate`, `unknown` | Source of valuation |
| `ownershipType` | `sole`, `joint_tenants`, `tenants_in_common`, `trust`, `tenancy_by_entirety` | Legal ownership structure |
| `ownershipModel` | `individual`, `joint`, `communal_family`, `huf_coparcenary`, `tribal`, `government_vested`, `trust_held` | Ownership model. HUF = Hindu Undivided Family (India) |
| `acquisitionType` | `self_acquired`, `ancestral_joint`, `ancestral_severed`, `inherited`, `gifted`, `stridhan`, `communal`, `waqf_endowed` | How property was acquired |
| `tenureType` | `freehold`, `leasehold`, `certificate_of_occupancy`, `customary_right_of_occupancy`, `communal`, `government_allocated`, `traditional_authority_granted`, `informal_unregistered` | Land tenure type |
| `registrationStatus` | `formally_registered`, `informally_held`, `community_acknowledged`, `disputed`, `undocumented` | Registration status |
| `ownershipEvidence` | `title_deed`, `certificate_of_occupancy`, `family_recognition`, `community_testimony`, `receipts_only`, `none` | Evidence of ownership |
| `successionRule` | `testamentary`, `intestacy`, `customary_eldest_son`, `customary_family_council`, `customary_matrilineal`, `survivorship`, `not_individually_bequeathable` | How property passes on death |
| `mobilityType` | `immoveable`, `moveable`, `mixed` | Relevant for Shia inheritance |
| `characterClassification` | `community`, `separate`, `quasi_community`, `mixed`, `not_applicable` | US community property classification |

---

## Proxy Authorisation

| Field | Values | Description |
|-------|--------|-------------|
| `consentRecord.consentMethod` | `in_person_verbal`, `in_person_written`, `video_recorded`, `witnessed_verbal`, `phone_recorded`, `assumed_cultural_norm` | How consent was obtained |
| `scope` | `full`, `information_gathering`, `communication`, `negotiation`, `decision_making` | Scope of proxy authority |

---

## Relationship

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `MARRIAGE_CIVIL`, `MARRIAGE_RELIGIOUS`, `MARRIAGE_CUSTOMARY`, `MARRIAGE_COMMON_LAW`, `CIVIL_PARTNERSHIP`, `CIVIL_UNION`, `DOMESTIC_PARTNERSHIP`, `DE_FACTO`, `COHABITATION`, `ENGAGEMENT` | Relationship type |
| `events[].type` | `CEREMONY`, `REGISTRATION`, `ENGAGEMENT`, `MARRIAGE_CONTRACT`, `PROPERTY_REGIME_CHANGE`, `SEPARATION_INFORMAL`, `SEPARATION_LEGAL`, `DIVORCE_FILED`, `DIVORCE_FINALISED`, `FINANCIAL_ORDER`, `ANNULMENT`, `DISSOLUTION`, `DEATH_OF_PARTNER`, `RECONCILIATION`, `VOID_DECLARATION`, `MAHR_PAYMENT`, `LOBOLA_PAYMENT` | Relationship lifecycle events |
| `financialInstruments[].type` | `MAHR`, `KETUBAH`, `LOBOLA`, `PRENUPTIAL_AGREEMENT`, `POSTNUPTIAL_AGREEMENT`, `MARRIAGE_SETTLEMENT` | Financial instrument type |
| `financialInstruments[].status` | `AGREED`, `PAID`, `PARTIALLY_PAID`, `DEFERRED`, `DISPUTED`, `WAIVED` | Payment status |
| `currentStatus` | `ACTIVE`, `SEPARATED_INFORMAL`, `SEPARATED_LEGAL`, `DIVORCED`, `ANNULLED`, `DISSOLVED`, `WIDOWED`, `VOID`, `PUTATIVE` | Current relationship status |
| `propertyRegime` | `COMMUNITY_OF_PROPERTY`, `SEPARATION_OF_PROPERTY`, `COMMUNITY_OF_ACQUESTS`, `DEFERRED_COMMUNITY`, `SEPARATE_AS_MODIFIED`, `ISLAMIC_DOWER`, `US_COMMUNITY_PROPERTY`, `US_COMMUNITY_WITH_SURVIVORSHIP`, `US_QUASI_COMMUNITY`, `HINDU_SEPARATE` | Marital property regime |
| `maharDetails.maharType` | `prompt`, `deferred`, `combination` | When mahr is payable |
| `ketubahDetails.brideStatus` | `virgin`, `widow`, `divorcee` | Bride's prior marital status |

---

## Trust

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `discretionary`, `life_interest`, `bare`, `accumulation_and_maintenance`, `disabled_persons`, `charitable`, `nil_rate_band`, `waqf`, `other` | Trust type |
| `creationType` | `testamentary`, `inter_vivos_revocable`, `inter_vivos_irrevocable` | How trust was created |
| `revocability` | `revocable`, `irrevocable`, `perpetual` | Revocability status. Perpetual = waqf, STAR trusts |
| `beneficiaries[].interestType` | `income`, `capital`, `both`, `discretionary` | Type of beneficial interest |
| `trustees[].role` | `trustee`, `protector`, `enforcer` | Role in trust governance |
| `reservedPowers[].powerType` | `investment`, `distribution`, `amendment`, `revocation`, `addition_of_beneficiaries`, `removal_of_trustees`, `change_of_governing_law` | Reserved settlor powers |
| `fleeClause.automaticOrDiscretionary` | `automatic`, `discretionary` | Whether flee clause triggers automatically |
| `protectorPowers[].powerType` | `consent_to_distribution`, `remove_trustee`, `appoint_trustee`, `change_governing_law`, `veto_investment`, `add_beneficiary`, `exclude_beneficiary`, `enforce_purpose` | Protector/enforcer powers |

---

## Wish

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `funeral`, `letter`, `care`, `distribution`, `digital`, `pets`, `general` | Type of wish |
| `bindingNature` | `non_binding`, `culturally_obligatory`, `religiously_obligatory`, `legally_binding` | Whether wish creates obligations |

---

## Usage Notes

1. **Enum validation is strict**: INHERIT schemas use `unevaluatedProperties: false` and strict enum validation. Invalid values cause validation failures.

2. **Extension types**: Some fields have `extensionType` companions (e.g., `bequest.extensionType`, `estate.extensionWillType`). These allow jurisdiction-specific values without modifying core enums.

3. **Pattern properties**: All entities accept `x-inherit-*` extension properties for jurisdiction-specific data.

4. **Case sensitivity**: All enum values are lowercase with underscores (snake_case), except relationship types which use UPPER_SNAKE_CASE for historical compatibility.

5. **Validation errors**: If you receive `must be equal to one of the allowed values`, check this reference for the correct value.
