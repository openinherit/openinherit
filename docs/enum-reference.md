# Enum Reference

A comprehensive table of every enum field across all INHERIT v1 core entity schemas. This is a quick reference for developers building INHERIT integrations.

---

## Asset (`asset.json`)

| Field | Allowed Values |
|-------|---------------|
| `category` | `bank_account`, `savings_account`, `investment`, `pension`, `shares`, `premium_bonds`, `cryptocurrency`, `insurance`, `vehicle`, `jewellery`, `art`, `antiques`, `collectibles`, `furniture`, `electronics`, `musical_instruments`, `books`, `clothing`, `kitchenware`, `sports_equipment`, `firearms`, `wine_and_spirits`, `tools`, `garden_and_outdoor`, `business_interest`, `intellectual_property`, `domain_name`, `social_media_account`, `digital_subscription`, `sukuk`, `takaful`, `islamic_deposit`, `other` |
| `valuationConfidence` | `estimated`, `professional`, `probate`, `unknown` |
| `condition` | `excellent`, `good`, `fair`, `poor`, `unknown`, `not_applicable` |
| `possessionStatus` | `possessed_at_death`, `receivable`, `contingent` |
| `mobilityType` | `immoveable`, `moveable`, `mixed` |
| `acquisitionType` | `self_acquired`, `ancestral_joint`, `ancestral_severed`, `inherited`, `gifted`, `stridhan`, `communal`, `waqf_endowed` |
| `registrationStatus` | `formally_registered`, `informally_held`, `community_acknowledged`, `disputed`, `undocumented` |
| `ownershipEvidence` | `title_deed`, `certificate_of_occupancy`, `family_recognition`, `community_testimony`, `receipts_only`, `none` |
| `beneficiaryDesignation.designationType` | `retirement_account`, `life_insurance`, `superannuation`, `pod_account`, `other` |
| `digitalAccessConsent.scope` | `full_access`, `limited_access`, `no_access` |

## Attestation (`attestation.json`)

| Field | Allowed Values |
|-------|---------------|
| `method` | `in_person`, `video`, `remote`, `none`, `kinyan_sudar`, `kinyan_agav`, `seal_based`, `inkan_registered` |
| `attestationType` | `written_signed`, `oral_witnessed`, `oral_community`, `seal_based` |
| `witnessConflictCheckScope` | `english_law`, `halachic_broad`, `shariah_standard`, `civil_law_standard`, `customary_oral`, `community_testimony` |

## Bequest (`bequest.json`)

| Field | Allowed Values |
|-------|---------------|
| `type` | `specific`, `pecuniary`, `demonstrative`, `general`, `residuary`, `life_interest`, `class` |
| `distributionMethod` | `per_capita`, `per_stirpes`, `modified_per_stirpes`, `per_capita_at_each_generation`, `halachic_yerusha` |
| `predeceaseRule` | `lapse`, `per_stirpes`, `substitution`, `accrual`, `statutory_default` |
| `constrainedBy` | `testamentary_freedom`, `customary_rule`, `forced_heirship`, `religious_rule`, `coparcenary_survivorship` |
| `BeneficiaryOrganisation.type` | `charity`, `company`, `unincorporated_association`, `trust`, `other` |
| `LifeInterest.interestType` | `use_and_income`, `income_only`, `use_only`, `protective`, `right_of_residence` |
| `PostDeathAction.type` | `disclaimer`, `deed_of_variation`, `appropriation`, `assent` |
| `InheritanceResponse.response` | `accepted`, `renounced`, `qualified_acceptance`, `pending` |

## Dealer Interest (`dealer-interest.json`)

| Field | Allowed Values |
|-------|---------------|
| `offerStatus` | `standing_interest`, `verbal_offer`, `written_offer`, `formal_valuation`, `conditional_offer`, `accepted`, `declined`, `expired`, `withdrawn` |
| `testatorDisposition` | `willing_to_sell`, `prefer_not_to_sell`, `hold_for_executor`, `deferred_to_family`, `promised_to_institution`, `undecided` |
| `privacyLevel` | `testator_only`, `proxy_visible`, `executor_visible`, `all_parties` |
| `communicationInitiatedBy` | `buyer`, `testator`, `proxy`, `executor` |
| `InterestedParty.type` | `art_dealer`, `antique_dealer`, `property_investor`, `auction_house`, `gallery`, `private_collector`, `museum`, `institution`, `charity`, `developer`, `fund_manager`, `family_office`, `estate_agent`, `solicitor_firm`, `other` |
| `AssetInterestItem.interestLevel` | `exploratory`, `moderate`, `strong`, `committed` |

## Estate (`estate.json`)

| Field | Allowed Values |
|-------|---------------|
| `status` | `draft`, `active`, `locked`, `archived` |
| `willType` | `secular`, `religious`, `dual`, `composite`, `oral_witnessed`, `oral_customary`, `holographic`, `notarised`, `privileged_will` |
| `primaryInstrument` | `will`, `revocable_trust`, `both`, `intestacy` |
| `defaultPropertyRegime` | `community_property`, `separate_property`, `equitable_distribution`, `deferred_community`, `universal_community`, `participation_in_acquisitions`, `islamic_dower` |
| `ForcedHeirship.claimNature` | `property_share`, `cash_claim`, `usufruct`, `court_discretion` |
| `ForcedHeirship.calculationBasis` | `fixed`, `per_child_sliding`, `court_discretion`, `conditional` |
| `ForcedHeirship.applicableTo` | `children_only`, `children_and_spouse`, `all_descendants`, `all_heirs` |
| `AdjudicatingBody.type` | `secular_court`, `religious_court`, `beth_din`, `shariah_court`, `tribal_court`, `family_court`, `family_council`, `community_elders`, `partition_meeting`, `karta_decision`, `maori_land_court`, `high_court` |
| `SuccessionConflict.resolutionStatus` | `unresolved`, `resolved`, `pending_court`, `pending_arbitration` |
| `ancillaryProbate[].status` | `not_started`, `applied`, `granted`, `completed`, `waived` |

## Executor (`executor.json`)

| Field | Allowed Values |
|-------|---------------|
| `role` | `primary`, `secondary`, `substitute`, `administrator`, `administrator_with_will_annexed` |
| `grantType` | `grant_of_probate`, `letters_of_administration`, `letters_of_administration_with_will_annexed`, `resealing`, `european_certificate_of_succession` |

## Guardian (`guardian.json`)

| Field | Allowed Values |
|-------|---------------|
| `role` | `primary`, `secondary`, `substitute` |
| `appointmentType` | `testamentary`, `parental_responsibility`, `court_appointed`, `shariah_court_appointed`, `community_appointed`, `religious_court_appointed` |
| `guardianshipStructure` | `individual`, `collective`, `rotating`, `family_council_determined` |

## Kinship (`kinship.json`)

| Field | Allowed Values |
|-------|---------------|
| `type` | `PARENT_CHILD_BIOLOGICAL`, `PARENT_CHILD_ADOPTED`, `PARENT_CHILD_STEP`, `PARENT_CHILD_FOSTER`, `PARENT_CHILD_ACKNOWLEDGED`, `SIBLING`, `HALF_SIBLING_PATERNAL`, `HALF_SIBLING_MATERNAL`, `STEP_SIBLING`, `GRANDPARENT_GRANDCHILD`, `UNCLE_NEPHEW`, `AUNT_NEPHEW` |
| `legalStatus` | `recognised`, `contested`, `pending`, `unrecognised` |
| `legitimacy` | `legitimate`, `illegitimate`, `legitimated`, `not_applicable` |

## Liability (`liability.json`)

| Field | Allowed Values |
|-------|---------------|
| `type` | `mortgage`, `personal_loan`, `credit_card`, `overdraft`, `student_loan`, `car_finance`, `hire_purchase`, `mahr`, `ketubah_debt`, `lobola`, `tax_liability`, `funeral_costs`, `care_fees`, `mezonot`, `other` |

## Nonprobate Transfer (`nonprobate-transfer.json`)

| Field | Allowed Values |
|-------|---------------|
| `type` | `revocable_trust`, `tod_deed`, `pod_account`, `jtwros`, `tenancy_by_entirety`, `beneficiary_designation`, `life_insurance_nomination`, `superannuation_nomination`, `cpf_nomination`, `epf_nomination`, `mandatory_savings_nomination` |

## Person (`person.json`)

| Field | Allowed Values |
|-------|---------------|
| `roles[]` | `testator`, `beneficiary`, `executor`, `guardian`, `trustee`, `witness`, `attorney`, `proxy`, `protector`, `enforcer` |
| `gender` | `male`, `female`, `non_binary`, `other`, `prefer_not_to_say`, `unknown` |
| `titles[].type` | `chieftaincy`, `traditional`, `religious`, `professional`, `honorific`, `clan`, `academic`, `military`, `other` |
| `legalPersonalities[].system` | `statutory`, `customary`, `religious`, `traditional` |
| `taxResidency[].fatcaStatus` | `us_person`, `non_us_person`, `exempt`, `unknown` |

## Property (`property.json`)

| Field | Allowed Values |
|-------|---------------|
| `propertyType` | `detached_house`, `semi_detached_house`, `terraced_house`, `flat`, `maisonette`, `bungalow`, `cottage`, `farmhouse`, `barn_conversion`, `land`, `commercial`, `mixed_use`, `houseboat`, `mobile_home`, `other` |
| `valuationConfidence` | `estimated`, `professional`, `probate`, `unknown` |
| `ownershipType` | `sole`, `joint_tenants`, `tenants_in_common`, `trust`, `tenancy_by_entirety` |
| `ownershipModel` | `individual`, `joint`, `communal_family`, `huf_coparcenary`, `tribal`, `government_vested`, `trust_held` |
| `acquisitionType` | `self_acquired`, `ancestral_joint`, `ancestral_severed`, `inherited`, `gifted`, `stridhan`, `communal`, `waqf_endowed` |
| `tenureType` | `freehold`, `leasehold`, `certificate_of_occupancy`, `customary_right_of_occupancy`, `communal`, `government_allocated`, `traditional_authority_granted`, `informal_unregistered` |
| `registrationStatus` | `formally_registered`, `informally_held`, `community_acknowledged`, `disputed`, `undocumented` |
| `ownershipEvidence` | `title_deed`, `certificate_of_occupancy`, `family_recognition`, `community_testimony`, `receipts_only`, `none` |
| `successionRule` | `testamentary`, `intestacy`, `customary_eldest_son`, `customary_family_council`, `customary_matrilineal`, `survivorship`, `not_individually_bequeathable` |
| `mobilityType` | `immoveable`, `moveable`, `mixed` |
| `characterClassification` | `community`, `separate`, `quasi_community`, `mixed`, `not_applicable` |

## Proxy Authorisation (`proxy-authorisation.json`)

| Field | Allowed Values |
|-------|---------------|
| `scope` | `full`, `information_gathering`, `communication`, `negotiation`, `decision_making` |
| `ConsentRecord.consentMethod` | `in_person_verbal`, `in_person_written`, `video_recorded`, `witnessed_verbal`, `phone_recorded`, `assumed_cultural_norm` |

## Relationship (`relationship.json`)

| Field | Allowed Values |
|-------|---------------|
| `type` | `MARRIAGE_CIVIL`, `MARRIAGE_RELIGIOUS`, `MARRIAGE_CUSTOMARY`, `MARRIAGE_COMMON_LAW`, `CIVIL_PARTNERSHIP`, `CIVIL_UNION`, `DOMESTIC_PARTNERSHIP`, `DE_FACTO`, `COHABITATION`, `ENGAGEMENT` |
| `currentStatus` | `ACTIVE`, `SEPARATED_INFORMAL`, `SEPARATED_LEGAL`, `DIVORCED`, `ANNULLED`, `DISSOLVED`, `WIDOWED`, `VOID`, `PUTATIVE` |
| `propertyRegime` | `COMMUNITY_OF_PROPERTY`, `SEPARATION_OF_PROPERTY`, `COMMUNITY_OF_ACQUESTS`, `DEFERRED_COMMUNITY`, `SEPARATE_AS_MODIFIED`, `ISLAMIC_DOWER`, `US_COMMUNITY_PROPERTY`, `US_COMMUNITY_WITH_SURVIVORSHIP`, `US_QUASI_COMMUNITY`, `HINDU_SEPARATE` |
| `RelationshipEvent.type` | `CEREMONY`, `REGISTRATION`, `ENGAGEMENT`, `MARRIAGE_CONTRACT`, `PROPERTY_REGIME_CHANGE`, `SEPARATION_INFORMAL`, `SEPARATION_LEGAL`, `DIVORCE_FILED`, `DIVORCE_FINALISED`, `FINANCIAL_ORDER`, `ANNULMENT`, `DISSOLUTION`, `DEATH_OF_PARTNER`, `RECONCILIATION`, `VOID_DECLARATION`, `MAHR_PAYMENT`, `LOBOLA_PAYMENT` |
| `FinancialInstrument.type` | `MAHR`, `KETUBAH`, `LOBOLA`, `PRENUPTIAL_AGREEMENT`, `POSTNUPTIAL_AGREEMENT`, `MARRIAGE_SETTLEMENT` |
| `FinancialInstrument.status` | `AGREED`, `PAID`, `PARTIALLY_PAID`, `DEFERRED`, `DISPUTED`, `WAIVED` |
| `FinancialInstrument.maharDetails.maharType` | `prompt`, `deferred`, `combination` |
| `FinancialInstrument.ketubahDetails.brideStatus` | `virgin`, `widow`, `divorcee` |

## Trust (`trust.json`)

| Field | Allowed Values |
|-------|---------------|
| `type` | `discretionary`, `life_interest`, `bare`, `accumulation_and_maintenance`, `disabled_persons`, `charitable`, `nil_rate_band`, `waqf`, `other` |
| `creationType` | `testamentary`, `inter_vivos_revocable`, `inter_vivos_irrevocable` |
| `revocability` | `revocable`, `irrevocable`, `perpetual` |
| `TrustAppointee.role` | `trustee`, `protector`, `enforcer` |
| `TrustBeneficiary.interestType` | `income`, `capital`, `both`, `discretionary` |
| `reservedPowers[].powerType` | `investment`, `distribution`, `amendment`, `revocation`, `addition_of_beneficiaries`, `removal_of_trustees`, `change_of_governing_law` |
| `fleeClause.automaticOrDiscretionary` | `automatic`, `discretionary` |
| `protectorPowers[].powerType` | `consent_to_distribution`, `remove_trustee`, `appoint_trustee`, `change_governing_law`, `veto_investment`, `add_beneficiary`, `exclude_beneficiary`, `enforce_purpose` |

## Wish (`wish.json`)

| Field | Allowed Values |
|-------|---------------|
| `type` | `funeral`, `letter`, `care`, `distribution`, `digital`, `pets`, `general` |
| `bindingNature` | `non_binding`, `culturally_obligatory`, `religiously_obligatory`, `legally_binding` |

## Common — Address (`common/address.json`)

| Field | Allowed Values |
|-------|---------------|
| `addressOrder` | `western`, `japanese`, `indian`, `arabic`, `custom` |

## Common — Jurisdiction (`common/jurisdiction.json`)

| Field | Allowed Values |
|-------|---------------|
| `legalSystem` | `common_law`, `civil_law`, `mixed`, `religious`, `customary`, `religious_islamic`, `religious_jewish`, `religious_hindu`, `religious_canon`, `plural` |

## Common — Temporal Rule (`common/temporal-rule.json`)

| Field | Allowed Values |
|-------|---------------|
| `status` | `enacted`, `royal_assent`, `bill_stage`, `consultation`, `announced` |
