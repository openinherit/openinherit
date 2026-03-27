# Person Roles Reference

Each person in an INHERIT document has a `roles` array containing one or more of the following values. A single person may hold multiple roles — for example, the testator may also be a beneficiary.

| Role | Description |
|------|-------------|
| `testator` | The person who made the will or created the estate plan. Exactly one person should have this role. |
| `beneficiary` | A person who receives property, money, or other benefits from the estate. Referenced by `bequest.beneficiaryId`. |
| `executor` | The person appointed to administer the estate, pay debts, and distribute assets. Further described in `executor.json` with `role` and `grantType` fields. |
| `guardian` | A person appointed to care for a minor child or dependent of the testator. Further described in `guardian.json` with `appointmentType` and `guardianshipStructure`. |
| `trustee` | A person who holds and manages trust property on behalf of beneficiaries. Referenced in `trust.json` via `appointees`. |
| `witness` | A person who witnessed the signing of the will or other testamentary document. Referenced in `attestation.json`. |
| `attorney` | A person granted power of attorney to act on the testator's behalf. Referenced in `proxy-authorisation.json`. |
| `proxy` | A person authorised to act as a representative or intermediary, often for communication or negotiation. Referenced in `proxy-authorisation.json` via `scope`. |
| `protector` | A person who oversees trustees and can veto or direct trust decisions. Referenced in `trust.json` via `appointees` with role `protector`. |
| `enforcer` | A person who ensures the terms of a trust (especially a charitable or purpose trust) are carried out. Referenced in `trust.json` via `appointees` with role `enforcer`. |

## Relationships Between Roles

```
testator ──► executor       (appoints via estate plan)
testator ──► guardian       (appoints for dependants)
testator ──► trustee        (appoints to manage trusts)
testator ──► beneficiary    (may leave gifts to themselves via life interests)
testator ──► witness        (required for attestation)
testator ──► attorney       (grants power of attorney)
testator ──► proxy          (authorises as representative)
executor ──► beneficiary    (manages distribution to)
trustee ──► beneficiary     (holds assets for)
trustee ──► protector       (overseen by)
trustee ──► enforcer       (accountable to)
guardian ──► beneficiary    (cares for minor beneficiaries)
```

## Example

```json
{
  "id": "a1000001-0000-4000-a000-000000000001",
  "givenName": "James",
  "familyName": "Ashford",
  "roles": ["testator"]
}
```

A person acting in multiple capacities:

```json
{
  "id": "a1000002-0000-4000-a000-000000000002",
  "givenName": "Sarah",
  "familyName": "Ashford",
  "roles": ["beneficiary", "executor", "trustee"]
}
```

## Extension-Specific Roles

Cultural and jurisdiction-specific roles (such as `karta` in Hindu succession or `mutawalli` in Islamic waqf) are **not** added to the core enum. Instead, they are expressed via `x-inherit-*` extension blocks alongside the core `roles` array. See the relevant extension documentation in `v1/extensions/` for details.
