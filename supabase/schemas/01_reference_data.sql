create schema if not exists private;
create schema if not exists api;

revoke all on schema private from public, anon, authenticated, service_role;
revoke all on schema api from public, anon, authenticated, service_role;

create table private.disposal_categories (
  id uuid primary key,
  slug text not null unique,
  display_name text not null,
  description text not null,
  active boolean not null default false,
  review_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint disposal_categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint disposal_categories_display_name_not_blank check (
    btrim(display_name) <> ''
  ),
  constraint disposal_categories_description_not_blank check (
    btrim(description) <> ''
  ),
  constraint disposal_categories_review_status_allowed check (
    review_status in ('pending', 'approved', 'expired', 'conflict', 'rejected')
  )
);

create table private.item_aliases (
  id uuid primary key,
  category_id uuid not null references private.disposal_categories(id) on delete restrict,
  alias text not null,
  normalized_alias text not null,
  locale text not null default 'en',
  review_status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint item_aliases_category_normalized_unique unique (category_id, normalized_alias),
  constraint item_aliases_alias_not_blank check (
    btrim(alias) <> '' and char_length(alias) <= 200
  ),
  constraint item_aliases_normalized_not_blank check (
    btrim(normalized_alias) <> '' and char_length(normalized_alias) <= 200
  ),
  constraint item_aliases_locale_not_blank check (btrim(locale) <> ''),
  constraint item_aliases_review_status_allowed check (
    review_status in ('pending', 'approved', 'expired', 'conflict', 'rejected')
  )
);

create table private.disposal_guidance (
  id uuid primary key,
  category_id uuid not null references private.disposal_categories(id) on delete restrict,
  action_summary text not null,
  requirements text[] not null,
  where_summary text,
  escalation_url text,
  active boolean not null default false,
  review_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint disposal_guidance_id_category_unique unique (id, category_id),
  constraint disposal_guidance_action_not_blank check (
    btrim(action_summary) <> ''
  ),
  constraint disposal_guidance_requirements_present check (
    cardinality(requirements) > 0 and array_position(requirements, '') is null
  ),
  constraint disposal_guidance_where_not_blank check (
    where_summary is null or btrim(where_summary) <> ''
  ),
  constraint disposal_guidance_escalation_https check (
    escalation_url is null or escalation_url ~ '^https://'
  ),
  constraint disposal_guidance_review_status_allowed check (
    review_status in ('pending', 'approved', 'expired', 'conflict', 'rejected')
  )
);

create table private.official_sources (
  id uuid primary key,
  stable_id text not null unique,
  organization text not null,
  title text not null,
  url text not null unique,
  authority_level text not null,
  government_domain text not null,
  first_retrieved_on date not null,
  research_checked_on date not null,
  apparent_updated_on date,
  date_basis text not null,
  last_verified_on date not null,
  review_by date not null,
  review_cadence_days smallint not null,
  review_status text not null default 'pending',
  verification_notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint official_sources_stable_id_format check (
    stable_id ~ '^src-[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint official_sources_organization_not_blank check (btrim(organization) <> ''),
  constraint official_sources_title_not_blank check (btrim(title) <> ''),
  constraint official_sources_url_https check (url ~ '^https://'),
  constraint official_sources_authority_allowed check (
    authority_level in ('city_primary', 'state_primary', 'other_primary_government')
  ),
  constraint official_sources_government_domain check (
    government_domain ~ '(^|\.)gov$|\.gov$'
  ),
  constraint official_sources_date_basis_not_blank check (btrim(date_basis) <> ''),
  constraint official_sources_review_sequence check (
    research_checked_on >= first_retrieved_on
    and last_verified_on >= first_retrieved_on
    and review_by >= last_verified_on
  ),
  constraint official_sources_review_cadence_positive check (review_cadence_days > 0),
  constraint official_sources_review_status_allowed check (
    review_status in ('pending', 'approved', 'expired', 'conflict', 'rejected')
  ),
  constraint official_sources_verification_notes_not_blank check (
    btrim(verification_notes) <> ''
  )
);

create table private.source_evidence (
  id uuid primary key,
  stable_id text not null unique,
  source_id uuid not null references private.official_sources(id) on delete restrict,
  category_id uuid not null references private.disposal_categories(id) on delete restrict,
  guidance_id uuid not null,
  locator text,
  supporting_summary text not null,
  claim_scope text not null,
  research_checked_on date not null,
  reviewed_on date not null,
  reviewer_ref text not null,
  review_status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint source_evidence_guidance_category_fkey
    foreign key (guidance_id, category_id)
    references private.disposal_guidance(id, category_id)
    on delete restrict,
  constraint source_evidence_stable_id_format check (
    stable_id ~ '^ev-[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint source_evidence_locator_not_blank check (
    locator is null or btrim(locator) <> ''
  ),
  constraint source_evidence_summary_not_blank check (
    btrim(supporting_summary) <> ''
  ),
  constraint source_evidence_claim_scope_not_blank check (
    btrim(claim_scope) <> ''
  ),
  constraint source_evidence_review_sequence check (reviewed_on >= research_checked_on),
  constraint source_evidence_reviewer_not_blank check (btrim(reviewer_ref) <> ''),
  constraint source_evidence_review_status_allowed check (
    review_status in ('pending', 'approved', 'expired', 'conflict', 'rejected')
  )
);

create table private.source_verifications (
  id uuid primary key,
  source_id uuid not null references private.official_sources(id) on delete restrict,
  verified_on date not null,
  result text not null,
  notes text,
  apparent_updated_on date,
  reviewer_ref text not null,
  created_at timestamptz not null default now(),
  constraint source_verifications_source_date_unique unique (source_id, verified_on),
  constraint source_verifications_result_allowed check (
    result in ('confirmed', 'changed', 'unavailable', 'conflict')
  ),
  constraint source_verifications_notes_not_blank check (
    notes is null or btrim(notes) <> ''
  ),
  constraint source_verifications_reviewer_not_blank check (btrim(reviewer_ref) <> '')
);

create unique index disposal_guidance_one_active_per_category_idx
  on private.disposal_guidance(category_id)
  where active;

create index disposal_categories_active_slug_idx
  on private.disposal_categories(slug)
  where active and review_status = 'approved';

create index item_aliases_normalized_approved_idx
  on private.item_aliases(normalized_alias, category_id)
  where review_status = 'approved';

create index item_aliases_category_id_idx
  on private.item_aliases(category_id);

create index disposal_guidance_category_id_idx
  on private.disposal_guidance(category_id);

create index official_sources_review_idx
  on private.official_sources(review_status, review_by);

create index source_evidence_source_id_idx
  on private.source_evidence(source_id);

create index source_evidence_category_id_idx
  on private.source_evidence(category_id);

create index source_evidence_guidance_id_idx
  on private.source_evidence(guidance_id);

create index source_verifications_source_id_idx
  on private.source_verifications(source_id);

alter table private.disposal_categories enable row level security;
alter table private.disposal_categories force row level security;
alter table private.item_aliases enable row level security;
alter table private.item_aliases force row level security;
alter table private.disposal_guidance enable row level security;
alter table private.disposal_guidance force row level security;
alter table private.official_sources enable row level security;
alter table private.official_sources force row level security;
alter table private.source_evidence enable row level security;
alter table private.source_evidence force row level security;
alter table private.source_verifications enable row level security;
alter table private.source_verifications force row level security;

create policy categories_read_approved_active
  on private.disposal_categories
  for select
  to anon, authenticated
  using (active and review_status = 'approved');

create policy aliases_read_approved
  on private.item_aliases
  for select
  to anon, authenticated
  using (review_status = 'approved');

create policy guidance_read_approved_active
  on private.disposal_guidance
  for select
  to anon, authenticated
  using (active and review_status = 'approved');

create policy sources_read_approved_fresh
  on private.official_sources
  for select
  to anon, authenticated
  using (review_status = 'approved' and review_by >= current_date);

create policy evidence_read_approved
  on private.source_evidence
  for select
  to anon, authenticated
  using (review_status = 'approved');

create view api.disposal_lookup
with (security_invoker = true)
as
select
  category.slug as category_id,
  category.display_name as category_name,
  category.description as category_description,
  item_alias.alias,
  item_alias.normalized_alias,
  item_alias.locale,
  guidance.id as guidance_id,
  guidance.action_summary,
  guidance.requirements,
  guidance.where_summary,
  guidance.escalation_url,
  source.stable_id as source_id,
  source.organization as source_organization,
  source.title as source_title,
  source.url as source_url,
  source.apparent_updated_on as source_apparent_updated_on,
  source.last_verified_on as source_verified_on,
  source.review_by as source_review_by,
  evidence.stable_id as evidence_id,
  evidence.supporting_summary as evidence_summary,
  evidence.locator as evidence_locator,
  evidence.claim_scope as evidence_claim_scope,
  evidence.reviewed_on as evidence_reviewed_on
from private.disposal_categories as category
join private.item_aliases as item_alias
  on item_alias.category_id = category.id
join private.disposal_guidance as guidance
  on guidance.category_id = category.id
join private.source_evidence as evidence
  on evidence.category_id = category.id
  and evidence.guidance_id = guidance.id
join private.official_sources as source
  on source.id = evidence.source_id
where category.active
  and category.review_status = 'approved'
  and item_alias.review_status = 'approved'
  and guidance.active
  and guidance.review_status = 'approved'
  and evidence.review_status = 'approved'
  and source.review_status = 'approved'
  and source.review_by >= current_date;

revoke all on all tables in schema private from public, anon, authenticated, service_role;
revoke all on all tables in schema api from public, anon, authenticated, service_role;

grant usage on schema private to anon, authenticated;
grant usage on schema api to anon, authenticated;

grant select on private.disposal_categories to anon, authenticated;
grant select on private.item_aliases to anon, authenticated;
grant select on private.disposal_guidance to anon, authenticated;
grant select on private.official_sources to anon, authenticated;
grant select on private.source_evidence to anon, authenticated;
grant select on api.disposal_lookup to anon, authenticated;

alter default privileges for role postgres in schema private
  revoke select, insert, update, delete, truncate, references, trigger
  on tables from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema api
  revoke select, insert, update, delete, truncate, references, trigger
  on tables from public, anon, authenticated, service_role;

