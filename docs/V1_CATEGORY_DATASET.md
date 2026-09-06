# V1 canonical dataset review candidate

## Status and purpose

BL-002 extends the five-record pilot into a proposed minimum-size V1 taxonomy and canonical reference dataset. The machine-readable artifact is [`data/v1-canonical-dataset.json`](../data/v1-canonical-dataset.json), validated by [`scripts/validate-v1-dataset.mjs`](../scripts/validate-v1-dataset.mjs).

The artifact is a **review candidate**, not active production data. All categories, aliases, guidance, sources, and evidence remain inactive or `pending_human_review`. The validator requires zero production-eligible categories until an independent human source audit approves every claim. No application, database schema, migration, or production seed is created by BL-002.

## Selection method

The set uses the 15-category lower bound in NFR-001 to keep V1 small enough for one maintainer while covering ordinary refuse, yard waste, appliances, tires, batteries, compressed gas, electronics, sharps, and two distinct light-bulb routes. A candidate was included only when a current City and County of Honolulu ENV page directly supported a bounded residential action and its important qualifications.

Selection followed the authority and evidence rules in [SOURCE_INVENTORY.md](SOURCE_INVENTORY.md): City ENV first, no search snippet or secondary source as evidence, no inferred facility rule, and explicit exclusion when the available language was broad, conflicting, or unsafe. All three source pages and 15 category-to-evidence relationships were research-checked on 2026-09-05.

## Selected category set

| ID | Resident-facing category | Source locator | Bounded action and important boundary |
|---|---|---|---|
| `mattresses` | Mattresses | Resident rules → Regular Refuse | City drop-off as regular refuse; no curbside-pickup claim |
| `household-chairs-and-tables` | Household chairs and tables | Resident rules → Preparing / Regular Refuse | Only chairs and tables; general size/weight rules apply |
| `rugs-and-carpeting` | Rugs and carpeting | Resident rules → Preparing / Regular Refuse | Must be fastened; general size/weight rules apply |
| `green-waste` | Green waste | Resident rules → Green Waste | Listed yard materials, loose and without plastic bags |
| `large-household-appliances` | Large household appliances | Resident rules → Large Appliances | Listed household types; two per month; no commercial equipment |
| `passenger-and-light-truck-tires` | Passenger and light-truck tires | Resident rules → Tires | Four per month; not Keʻehi; no heavy-truck/equipment tires |
| `alkaline-and-single-use-batteries` | Alkaline and single-use batteries | Resident rules → Battery | Regular refuse only when battery type is known |
| `standalone-rechargeable-batteries` | Standalone rechargeable batteries | Resident rules → Battery | Listed chemistries only; standalone, terminals taped, clear bag |
| `car-and-motorcycle-lead-acid-batteries` | Car and motorcycle lead-acid batteries | Resident rules → Battery / Prohibited | No heavy-equipment or electric-vehicle batteries |
| `household-propane-containers` | Household propane tanks and cylinders | Resident rules → Compressed Gas / Prohibited | Only source-stated sizes; generic-size inputs do not exact-match |
| `televisions` | Televisions | City e-waste → Accepted items | Source-qualified display of at least 9 inches |
| `computers-and-peripherals` | Computers and listed peripherals | City e-waste → Accepted / Unacceptable items | Only aliased device types that appear on the accepted list |
| `non-cfl-light-bulbs` | Non-CFL light bulbs | HHW → Put In Trash Can | Small residential quantities known not to be CFLs |
| `household-medical-sharps` | Household medical sharps | HHW → Put In Trash Can | Small residential quantities in a rigid screw-top container |
| `compact-fluorescent-bulbs-and-tubes` | Compact fluorescent bulbs and tubes | HHW → Appointment | Appointment route; live event details must be rechecked |

## Authoritative sources

1. City and County of Honolulu ENV, [Rules and Guidelines for Residents](https://www.honolulu.gov/env/ref/waste-drop-off-rules-residents/).
2. City and County of Honolulu ENV, [E-waste Recycling at City Disposal Sites](https://www.honolulu.gov/env/city-ewaste-dropbins/).
3. City and County of Honolulu ENV, [Household Hazardous Waste](https://www.honolulu.gov/env/ref/hhw-2/).

The resident drop-off page's official metadata reports a 2025-04-22 modification date. The other pages did not expose a stable apparent update date during research. The HHW page receives a proposed 30-day cadence because its event and registration information changes; the other sources retain the 90-day starting assumption from ADR-005. Review-by dates are deliberately `null` until human approval establishes the verification date.

## Canonical data and deterministic aliases

Each selected category has a stable kebab-case ID, resident-facing name, narrow description, deterministic alias objects, authored guidance, limitations, and evidence references. Each source is stored once and each evidence record points to exactly one category and source. This mirrors the relational boundaries in [DATA_MODEL.md](DATA_MODEL.md) without implementing the Supabase schema.

Alias normalization is Unicode NFKC, trimming, en-US lowercase, Unicode-dash normalization, and whitespace collapse. The validator recomputes every normalized alias. Broad or unsafe aliases are intentionally omitted: for example, `tire` does not exact-match because heavy tires are excluded, and a generic propane container does not exact-match because accepted sizes matter.

`battery` is the one deliberate cross-category collision. It maps to the three battery categories and must produce ambiguity, not a silent category selection. The dataset records the exact participating IDs, clarification question, and reason. No other normalized collision is permitted.

## Included guidance and provenance boundaries

- Guidance is authored only from the cited bounded evidence summaries; no model text or general knowledge is an authority.
- Every category points to at least one evidence record with source, locator, claim scope, and research date.
- Important restrictions stay in the guidance rather than being inferred by a later UI.
- “Where” remains an authored summary tied to the source. BL-002 does not create a destination table or claim live site availability.
- Source links use reviewed HTTPS government domains only.
- Dynamic event dates are not embedded as durable instructions.
- An unapproved, expired, conflicted, or rejected record cannot become active.

## Excluded and deferred groups

- **Generic electronics and telephones:** excluded because the City page conflicts on VOIP telephones versus telephones generally, and “electronics” is broader than the selected device records.
- **Damaged, swollen, leaking, embedded, unidentified, heavy-equipment, and electric-vehicle batteries:** excluded because no single safe deterministic household action was established; some types are separately prohibited or routed.
- **Generic tires and propane containers:** not exact aliases because type or size materially changes eligibility.
- **Paint and primer:** excluded from the frozen candidate set because a generic description cannot safely distinguish the City's small-quantity trash route from lead/aluminum paint, stripper, thinner, unidentified products, or large quantities.
- **Commercial, construction, industrial, medical-facility, and agricultural waste:** outside the residential V1 scope.
- **All unlisted household items:** unsupported until a separate evidence-backed scope change is approved.

## Human approval gate

Before this candidate can be called frozen, active, or reviewed canonical data, an independent human reviewer must:

1. open each official URL directly and confirm organization, title, HTTPS government domain, and current availability;
2. compare every one of the 15 evidence summaries and locators to the live source;
3. confirm each action, requirement, destination statement, limitation, and exclusion is supported and not overstated;
4. review all 85 aliases for ordinary-language usefulness, unsafe overbreadth, and the declared `battery` collision;
5. resolve or reject any disputed record rather than editing evidence to fit the desired taxonomy;
6. record a reviewer reference and human review date on each approved evidence record;
7. set source human-verification and review-by dates using the approved cadence;
8. change only approved categories/guidance/sources/evidence to `approved`, activate the approved categories/guidance, and change the root status/kind to `approved` / `v1_canonical_dataset` only when all 15 pass;
9. rerun both data validators and the provenance audit; and
10. approve the focused pull request only if no critical/high source-integrity issue remains.

Until those steps are evidenced, AC-FR-005-01, AC-FR-007-01, AC-FR-013-01, AC-NFR-001-01, and AC-NFR-002-01 are structurally prepared but not fully passed for production.

## Validation and traceability

The dependency-free validator checks category count and exact IDs, ID/reference uniqueness, source authority/HTTPS, required guidance and evidence, deterministic alias normalization, undeclared collisions, review/freshness consistency, exclusions, and the zero-production-eligibility gate. The older five-record pilot and its validator remain intact for audit history.

Traceability for this artifact is:

Problem → FR-003/005/007/013 and NFR-001/002/003 → mapped acceptance criteria → ADR-004/005 and DATA_MODEL → BL-002 → candidate dataset and validator → human provenance audit → backlog-item Definition of Done.

## Open risks

- Human approval is outstanding; this is the blocking condition for BL-002 completion.
- Official pages can change after 2026-09-05.
- The minimum 15-category set is intentionally narrow and may expose deterministic coverage gaps during BL-008; that does not authorize adding categories without evidence.
- The City e-waste telephone contradiction remains documented and excluded.
- Facility hours, temporary closures, and live HHW event details require the official page and are not treated as stable dataset facts.
