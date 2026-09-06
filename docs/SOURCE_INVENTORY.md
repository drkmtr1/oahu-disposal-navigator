# Pilot authoritative source inventory

## Purpose and boundary

BL-001 tests whether a small, inspectable source workflow can preserve authoritative evidence, qualifications, provenance, freshness, and uncertainty before application or database work begins. The machine-readable companion is [`data/source-inventory.json`](../data/source-inventory.json), and its dependency-free structural check is [`scripts/validate-source-inventory.mjs`](../scripts/validate-source-inventory.mjs).

This pilot contains exactly five candidate household-item groups: mattresses, propane cylinders, televisions/electronics, household batteries, and paint. They are research subjects only. They are **not the frozen V1 taxonomy**, do not promise production support, and do not change the planned 15–25 evidence-supported-category boundary.

## Source-selection rules

### Authority hierarchy

1. Use the City and County of Honolulu Department of Environmental Services (ENV), or another directly responsible City department, for Oʻahu residential guidance.
2. Use another primary Hawaiʻi government source only when the City source is insufficient or that authority administers the relevant rule or program. Record why it was needed.
3. If authoritative evidence is incomplete, internally inconsistent, unavailable, or too stale to trust, preserve the gap or conflict and withhold the unsupported instruction.

Search engines may locate a source, but search snippets are never evidence. Blogs, news summaries, commercial disposal sites, community posts, and AI-generated text are excluded as factual bases. A government page is included only when the inspected page directly supports a bounded Oʻahu residential claim. Facility names, dates, limits, and preparation rules are not inferred.

## Evidence-capture method

For each candidate, the reviewer:

1. opened the authoritative HTTPS page and confirmed the government organization and page title;
2. recorded the access date and an apparent update/effective date only when the source or its official government-published metadata supplied one;
3. captured a narrow structured summary, page heading/section locator, and claim scope rather than copying a whole page;
4. separated supported action, restrictions, destination/program information, gaps, and conflicts;
5. assigned an allowlisted review state and verification note; and
6. checked that every summarized action could be traced back to the inspected source text.

Unknown scalar values are represented as JSON `null`; an empty array means the field was reviewed and no item was identified. Placeholder strings such as `TBD`, `N/A`, or `unknown` are prohibited. Dates use `YYYY-MM-DD`. A repeated URL is allowed only when the same official page contains separately located evidence for different candidates and every repeated record explains the reuse.

## Conflict, incompleteness, and review handling

The pilot review-state allowlist is `verified`, `verified_with_gaps`, `blocked_incomplete`, `blocked_conflict`, and `rejected`. `Verified_with_gaps` means the stated bounded claim was manually confirmed, while the candidate is not yet broad enough or unambiguous enough for a production category. A conflict is recorded verbatim in substance, but no disputed instruction is selected. A missing apparent update date is not guessed. The official City page metadata reports that the resident waste-drop-off page was modified on 2025-04-22; the other two source pages did not expose a stable update date during review.

All three unique source pages and all five category-to-evidence relationships were checked on 2026-09-05. This pilot did not set the final review cadence. Approved BL-002 applies ADR-005's 90-day cadence to the resident and e-waste pages and a shorter 30-day cadence to the dynamic HHW page; BL-007 must preserve production expiry and exclusion behavior.

## Candidate findings

### Mattresses

- **Authoritative source:** City and County of Honolulu ENV, [Rules and Guidelines for Residents](https://www.honolulu.gov/env/ref/waste-drop-off-rules-residents/), “Regular Refuse.”
- **Supported claim:** The resident waste-drop-off guidance explicitly includes mattresses as regular refuse and directs regular refuse to the refuse roll-off container or transfer-station pit floor; bagging is requested when possible.
- **Restrictions and destination:** Residential use, facility-specific acceptance, vehicle/load rules, and attendant directions apply. The supported destination is the City's resident waste-drop-off system—not an inferred private facility.
- **Gap:** The inspected section does not itself establish mattress eligibility for curbside bulky pickup or identify which individual site should be used.
- **Review state:** `verified_with_gaps`.

### Propane cylinders

- **Authoritative source:** City and County of Honolulu ENV, [Rules and Guidelines for Residents](https://www.honolulu.gov/env/ref/waste-drop-off-rules-residents/), “Compressed Gas.”
- **Supported claim:** The resident drop-off rules accept empty, partially full, or full propane tanks in the source-stated 5- and 20-gallon sizes and propane cylinders in the source-stated 16-ounce size.
- **Restrictions and destination:** The claim is limited to the listed household propane containers at City resident drop-off facilities. Commercial-grade compressed gas, industrial tanks, oxygen cylinders, and SCUBA tanks are listed as prohibited.
- **Gap:** The page warns that facilities vary but does not map each propane size to a particular site or provide cylinder-condition instructions.
- **Review state:** `verified_with_gaps`.

### Televisions/electronics

- **Authoritative source:** City and County of Honolulu ENV, [E-waste Recycling at City Disposal Sites](https://www.honolulu.gov/env/city-ewaste-dropbins/).
- **Supported claim:** The City provides e-waste bins at its convenience centers and transfer stations and lists televisions of the stated size/type, computers, monitors, printers, and other named devices as accepted for recycling.
- **Restrictions and destination:** Only items explicitly on the accepted list are supported. The page names Kapaʻa, Kawailoa, and Keʻehi transfer stations and ʻEwa, Kapolei, Lāʻie, Wahiawā, Waiʻanae, Waimānalo, and Waipahu convenience centers.
- **Conflict:** The same page lists VOIP telephones as acceptable and later says telephones of any type, including mobile phones, are unacceptable. This pilot makes no phone-specific disposal claim.
- **Gap:** “Electronics” is too broad for one production category; device-level boundaries must be resolved during taxonomy work.
- **Review state:** `verified_with_gaps`.

### Household batteries

- **Authoritative source:** City and County of Honolulu ENV, [Rules and Guidelines for Residents](https://www.honolulu.gov/env/ref/waste-drop-off-rules-residents/), “Battery.”
- **Supported claim:** The page separates alkaline/single-use batteries, car or motorcycle lead-acid batteries, and listed standalone rechargeable chemistries. It directs alkaline/single-use batteries to regular refuse and requires standalone rechargeable batteries to have taped terminals and be placed in a clear plastic bag for resident drop-off.
- **Restrictions and destination:** Lead-acid acceptance is limited to car and motorcycle batteries. Electric-vehicle batteries are prohibited. Rechargeable guidance is limited to the chemistries named by the source and standalone batteries.
- **Gap:** The inspected section does not address damaged, swollen, leaking, unidentified, or embedded batteries, and facility-specific availability is not mapped.
- **Review state:** `verified_with_gaps`.

### Paint

- **Authoritative source:** City and County of Honolulu ENV, [Household Hazardous Waste (HHW)](https://www.honolulu.gov/env/ref/hhw-2/), “Disposal of HHW.”
- **Supported claim:** For small residential quantities, the page places paint and primer in its “Absorb and Put In Trash Can” route: liquid may be absorbed and sealed before trash disposal, and paint may be air-dried in the can before trash disposal.
- **Restrictions and destination:** Large quantities require a call to the City's Refuse Division. The page separately requires an HHW drop-off appointment for named materials including aluminum paint, lead paint, paint stripper, and paint thinner; appointment details are time-sensitive and are not converted into a standing rule here.
- **Gap:** “Paint” is too broad without type and quantity clarification, and the page displays event dates that will change.
- **Review state:** `verified_with_gaps`.

## Pilot limitations and next use

- This is a five-record research artifact, not production guidance, a complete source corpus, a schema, or seed data.
- The source pages are live and can change after the recorded access date; no archived snapshots or City staff confirmations were obtained.
- One City page is intentionally reused for three candidates because its separately headed sections are the direct current evidence. Reuse does not imply that those candidates should share a production category.
- The pilot shows that destinations can be represented as bounded structured details. Accepted ADR-009 and resolved OD-002 keep V1 destination/program text in authored guidance.
- All five pilot candidates retain their historical gaps, and electronics retains an explicit source conflict. The [reviewed BL-002 V1 canonical dataset](V1_CATEGORY_DATASET.md) narrows, splits, or excludes them; the project-owner audit and live-source second pass approved its bounded records on 2026-09-05.
