# Data model

This is the expected relational design, not an implemented production schema. BL-001/BL-002 may refine fields based on real sources before the schema backlog item. Keep the fewest entities that preserve category lookup, instructions, provenance, and review history.

## Proposed entities

| Entity | Purpose and key fields | Constraints and lifecycle |
|---|---|---|
| disposal_categories | id UUID PK; slug text; display_name text; description text; active boolean; created_at/updated_at timestamptz | slug unique and stable; display fields nonempty; deactivate rather than delete once referenced |
| item_aliases | id UUID PK; category_id UUID FK; alias text; normalized_alias text; locale text default en; review_status text | unique(category_id, normalized_alias); index normalized_alias; duplicate aliases across categories allowed to represent ambiguity; reviewed aliases only in production |
| disposal_guidance | id UUID PK; category_id UUID FK; action_summary text; requirements text array; where_summary nullable text; escalation_url nullable text; active boolean; updated_at | at most one active V1 guidance record per category; nonempty action; URLs approved HTTPS; change creates reviewed migration/data update |
| official_sources | id UUID PK; organization text; title text; url text; apparent_updated_on nullable date; first_retrieved_at and last_verified_at timestamptz; review_by date; review_status text | URL unique; status in pending/approved/expired/conflict/rejected; approved and not overdue for production |
| source_evidence | id UUID PK; source_id UUID FK; category_id UUID FK; guidance_id UUID FK; supporting_passage text; locator nullable text; claim_scope text; reviewed_at timestamptz; reviewer_ref text | passage and claim scope nonempty; one evidence row supports a bounded claim; RESTRICT deletion |
| source_verifications | id UUID PK; source_id UUID FK; verified_at timestamptz; result text; notes nullable text; apparent_updated_on nullable date | append-only history; result in confirmed/changed/unavailable/conflict |

Destinations/facilities are not yet a table. BL-001 must show repeated structured fields and relationships before adding an optional destination entity; otherwise where_summary remains authored guidance. This avoids speculative modeling.

~~~mermaid
erDiagram
    DISPOSAL_CATEGORIES ||--o{ ITEM_ALIASES : recognizes
    DISPOSAL_CATEGORIES ||--o| DISPOSAL_GUIDANCE : has_active
    DISPOSAL_CATEGORIES ||--o{ SOURCE_EVIDENCE : supported_by
    DISPOSAL_GUIDANCE ||--|{ SOURCE_EVIDENCE : justified_by
    OFFICIAL_SOURCES ||--|{ SOURCE_EVIDENCE : contains
    OFFICIAL_SOURCES ||--o{ SOURCE_VERIFICATIONS : checked_by
~~~

## Validation and nullability

IDs, slugs/names, active guidance action, source organization/title/URL, evidence passage/scope, verification timestamps, and statuses are non-null. Source apparent-update dates, locators, where text, escalation URLs, and notes may be null because official pages may omit them. Empty strings are invalid. Text lengths will be bounded in schema after source discovery; long evidence excerpts must remain narrowly necessary and respect source usage.

Normalization is deterministic Unicode normalization, case folding, whitespace collapse, and documented punctuation handling. Store original alias and normalized value. Category slugs are machine identifiers and never derived from model text at runtime.

## Keys, indexes, and deletion

Use UUID primary keys and foreign keys with ON DELETE RESTRICT for guidance/source/evidence chains. Index active category slug, normalized alias, category foreign keys, source review status/review_by, and evidence joins. A partial uniqueness constraint should enforce one active guidance per category if history remains in the same table. Prefer deactivation and new reviewed records over destructive edits; preserve source verification history.

## Ownership and access

The project maintainer owns/curates all data. Residents create no database records. Production reads occur through the server boundary using least-privilege anon access. Grants and RLS allow intended SELECTs only and deny anon/authenticated INSERT, UPDATE, and DELETE. No service-role key belongs in browser or normal lookup code.

Every table in an exposed schema must have RLS plus deliberate grants/policies; RLS and grants are both tested. A private schema may be chosen for internal-only history if it meaningfully reduces exposure, but the final choice must be recorded before schema implementation.

## Freshness and update lifecycle

1. Discover primary-government source.
2. Record metadata and bounded evidence as pending.
3. Human verifies category/claim association and marks approved with review_by.
4. Seed/reference change is reviewed in a focused PR with provenance tests.
5. A scheduled manual review records source_verifications.
6. Changed/conflicting/unavailable/overdue sources stop supporting production success until resolved.

No autonomous web monitor is required. Review cadence begins with 90 days for approved sources, shortened when a source states frequent/temporary changes; this assumption is validated during source discovery.

## Seed/reference data

Version-controlled seed data will include only reviewed categories, aliases, guidance, sources, evidence, and verification metadata. Test fixtures use clearly synthetic records plus a frozen reviewed sample. Production reference data is never silently generated by a model.

## Schema workflow

The intended new-project workflow is declarative files in supabase/schemas as source of truth, generated/reviewed migrations in supabase/migrations, and repeatable seed/test data. Schema and migration are committed together and verified by a local reset and database policy tests. Stage 1 creates none of these files.
