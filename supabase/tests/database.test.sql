begin;

create extension if not exists pgtap with schema extensions;

select plan(51);

select has_schema('private', 'BL-004 creates the non-exposed data schema');
select has_schema('api', 'BL-004 creates the dedicated Data API schema');
select has_table('private', 'disposal_categories', 'Category table exists');
select has_table('private', 'item_aliases', 'Alias table exists');
select has_table('private', 'disposal_guidance', 'Guidance table exists');
select has_table('private', 'official_sources', 'Source table exists');
select has_table('private', 'source_evidence', 'Evidence table exists');
select has_table('private', 'source_verifications', 'Verification history table exists');
select has_view('api', 'disposal_lookup', 'The read-only lookup projection exists');

select results_eq(
  $$
    select count(*)
    from pg_class as relation
    join pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'private'
      and relation.relname in (
        'disposal_categories',
        'item_aliases',
        'disposal_guidance',
        'official_sources',
        'source_evidence',
        'source_verifications'
      )
      and relation.relrowsecurity
      and relation.relforcerowsecurity
  $$,
  array[6::bigint],
  'RLS is enabled and forced on every private application table'
);

select results_eq(
  $$select count(*) from private.disposal_categories$$,
  array[15::bigint],
  'The reviewed seed contains exactly 15 categories'
);
select results_eq(
  $$select count(*) from private.item_aliases$$,
  array[85::bigint],
  'The reviewed seed contains exactly 85 aliases'
);
select results_eq(
  $$select count(*) from private.disposal_guidance$$,
  array[15::bigint],
  'The reviewed seed contains one guidance record per category'
);
select results_eq(
  $$select count(*) from private.official_sources$$,
  array[3::bigint],
  'The reviewed seed contains exactly three authoritative sources'
);
select results_eq(
  $$select count(*) from private.source_evidence$$,
  array[15::bigint],
  'The reviewed seed contains exactly 15 evidence records'
);
select results_eq(
  $$select count(*) from private.source_verifications$$,
  array[3::bigint],
  'Each source has an initial append-only verification record'
);

select results_eq(
  $$select count(*) from api.disposal_lookup$$,
  array[85::bigint],
  'The approved fresh projection contains all reviewed aliases'
);
select results_eq(
  $$select count(distinct category_id) from api.disposal_lookup$$,
  array[15::bigint],
  'The projection contains every approved category'
);
select results_eq(
  $$
    select count(*)
    from api.disposal_lookup
    where source_organization is null
      or source_title is null
      or source_url is null
      or source_verified_on is null
      or evidence_id is null
      or evidence_summary is null
      or evidence_claim_scope is null
  $$,
  array[0::bigint],
  'Every projected instruction carries complete inspectable provenance'
);
select results_eq(
  $$select count(distinct category_id) from api.disposal_lookup where normalized_alias = 'battery'$$,
  array[3::bigint],
  'The intentional battery collision remains an ambiguity'
);

select throws_ok(
  $$
    insert into private.disposal_guidance (
      id, category_id, action_summary, requirements, active, review_status
    )
    select
      '00000000-0000-5000-8000-000000000001'::uuid,
      id,
      'Synthetic duplicate guidance',
      array['Synthetic requirement'],
      true,
      'approved'
    from private.disposal_categories
    where slug = 'mattresses'
  $$,
  '23505',
  'duplicate key value violates unique constraint "disposal_guidance_one_active_per_category_idx"',
  'A category cannot have two active guidance records'
);

select throws_ok(
  $$
    update private.source_evidence
    set guidance_id = (
      select guidance.id
      from private.disposal_guidance as guidance
      join private.disposal_categories as category on category.id = guidance.category_id
      where category.slug = 'green-waste'
    )
    where stable_id = 'ev-mattresses-drop-off'
  $$,
  '23503',
  'insert or update on table "source_evidence" violates foreign key constraint "source_evidence_guidance_category_fkey"',
  'Evidence cannot point to guidance for another category'
);

select throws_ok(
  $$
    update private.official_sources
    set url = 'http://example.gov/not-https'
    where stable_id = 'src-hnl-city-ewaste'
  $$,
  '23514',
  'new row for relation "official_sources" violates check constraint "official_sources_url_https"',
  'Source URLs must use HTTPS'
);

select throws_ok(
  $$
    update private.source_verifications
    set result = 'changed'
    where id = (select id from private.source_verifications limit 1)
  $$,
  '55000',
  'source verification history is append-only',
  'Source verification history is append-only'
);

select ok(
  has_table_privilege('anon', 'api.disposal_lookup', 'select'),
  'Anonymous requests may select from the dedicated projection'
);
select ok(
  has_table_privilege('authenticated', 'api.disposal_lookup', 'select'),
  'Authenticated requests may select from the dedicated projection'
);
select ok(
  not has_table_privilege('anon', 'api.disposal_lookup', 'insert'),
  'Anonymous requests cannot insert through the projection'
);
select ok(
  not has_table_privilege('anon', 'api.disposal_lookup', 'update'),
  'Anonymous requests cannot update through the projection'
);
select ok(
  not has_table_privilege('anon', 'api.disposal_lookup', 'delete'),
  'Anonymous requests cannot delete through the projection'
);
select ok(
  not has_table_privilege('authenticated', 'api.disposal_lookup', 'insert'),
  'Authenticated requests cannot insert through the projection'
);
select ok(
  not has_table_privilege('authenticated', 'api.disposal_lookup', 'update'),
  'Authenticated requests cannot update through the projection'
);
select ok(
  not has_table_privilege('authenticated', 'api.disposal_lookup', 'delete'),
  'Authenticated requests cannot delete through the projection'
);
select ok(
  not has_table_privilege('anon', 'private.source_verifications', 'select'),
  'Anonymous requests cannot read internal verification history'
);
select ok(
  not has_table_privilege('authenticated', 'private.source_verifications', 'select'),
  'Authenticated requests cannot read internal verification history'
);

set local role anon;

select results_eq(
  $$select count(*) from api.disposal_lookup$$,
  array[85::bigint],
  'Anonymous lookup reads return approved fresh data'
);

select throws_ok(
  $$
    insert into private.disposal_categories (
      id, slug, display_name, description, active, review_status
    ) values (
      '00000000-0000-5000-8000-000000000002',
      'unauthorized-category',
      'Unauthorized',
      'Must not be inserted',
      true,
      'approved'
    )
  $$,
  '42501',
  'permission denied for table disposal_categories',
  'Anonymous inserts are denied'
);
select throws_ok(
  $$update private.disposal_categories set display_name = 'Unauthorized' where slug = 'mattresses'$$,
  '42501',
  'permission denied for table disposal_categories',
  'Anonymous updates are denied'
);
select throws_ok(
  $$delete from private.disposal_categories where slug = 'mattresses'$$,
  '42501',
  'permission denied for table disposal_categories',
  'Anonymous deletes are denied'
);

reset role;
set local role authenticated;

select results_eq(
  $$select count(*) from api.disposal_lookup$$,
  array[85::bigint],
  'Authenticated lookup reads return approved fresh data'
);
select throws_ok(
  $$
    insert into private.disposal_categories (
      id, slug, display_name, description, active, review_status
    ) values (
      '00000000-0000-5000-8000-000000000003',
      'unauthorized-auth-category',
      'Unauthorized',
      'Must not be inserted',
      true,
      'approved'
    )
  $$,
  '42501',
  'permission denied for table disposal_categories',
  'Authenticated inserts are denied'
);
select throws_ok(
  $$update private.disposal_categories set display_name = 'Unauthorized' where slug = 'mattresses'$$,
  '42501',
  'permission denied for table disposal_categories',
  'Authenticated updates are denied'
);
select throws_ok(
  $$delete from private.disposal_categories where slug = 'mattresses'$$,
  '42501',
  'permission denied for table disposal_categories',
  'Authenticated deletes are denied'
);

reset role;

update private.official_sources
set review_by = current_date - 1
where stable_id = 'src-hnl-household-hazardous-waste';

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where source_id = 'src-hnl-household-hazardous-waste'$$,
  array[0::bigint],
  'Past-due sources cannot support an anonymous production lookup'
);
reset role;

update private.official_sources
set review_by = date '2026-10-05'
where stable_id = 'src-hnl-household-hazardous-waste';

update private.official_sources
set review_status = 'pending'
where stable_id = 'src-hnl-city-ewaste';

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where source_id = 'src-hnl-city-ewaste'$$,
  array[0::bigint],
  'Unreviewed sources cannot support an anonymous production lookup'
);
reset role;

update private.official_sources
set review_status = 'approved'
where stable_id = 'src-hnl-city-ewaste';

update private.official_sources
set review_status = 'rejected'
where stable_id = 'src-hnl-resident-drop-off';

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where source_id = 'src-hnl-resident-drop-off'$$,
  array[0::bigint],
  'Rejected sources cannot support an anonymous production lookup'
);
reset role;

update private.official_sources
set review_status = 'approved'
where stable_id = 'src-hnl-resident-drop-off';

update private.disposal_guidance
set active = false
where category_id = (
  select id from private.disposal_categories where slug = 'mattresses'
);

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where category_id = 'mattresses'$$,
  array[0::bigint],
  'Inactive guidance cannot support an anonymous production lookup'
);
reset role;

update private.disposal_guidance
set active = true
where category_id = (
  select id from private.disposal_categories where slug = 'mattresses'
);

update private.disposal_categories
set review_status = 'pending'
where slug = 'mattresses';

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where category_id = 'mattresses'$$,
  array[0::bigint],
  'Unreviewed categories cannot support an anonymous production lookup'
);
reset role;

update private.disposal_categories
set review_status = 'approved'
where slug = 'mattresses';

update private.source_evidence
set review_status = 'conflict'
where stable_id = 'ev-green-waste';

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where category_id = 'green-waste'$$,
  array[0::bigint],
  'Conflicted evidence cannot support an anonymous production lookup'
);
reset role;

update private.source_evidence
set review_status = 'approved'
where stable_id = 'ev-green-waste';

update private.official_sources
set review_status = 'conflict'
where stable_id = 'src-hnl-city-ewaste';

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where source_id = 'src-hnl-city-ewaste'$$,
  array[0::bigint],
  'A conflicted source cannot support an anonymous production lookup'
);
reset role;

update private.official_sources
set review_status = 'expired'
where stable_id = 'src-hnl-resident-drop-off';

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where source_id = 'src-hnl-resident-drop-off'$$,
  array[0::bigint],
  'An explicitly expired source cannot support an anonymous production lookup'
);
reset role;

insert into private.source_verifications (
  id,
  source_id,
  verified_on,
  result,
  notes,
  apparent_updated_on,
  reviewer_ref
)
select
  '00000000-0000-5000-8000-000000000004'::uuid,
  id,
  date '2026-09-06',
  'unavailable',
  'Synthetic BL-007 unavailable-source review.',
  apparent_updated_on,
  'test-reviewer'
from private.official_sources
where stable_id = 'src-hnl-household-hazardous-waste';

update private.official_sources
set review_status = 'expired'
where stable_id = 'src-hnl-household-hazardous-waste';

set local role anon;
select results_eq(
  $$select count(*) from api.disposal_lookup where source_id = 'src-hnl-household-hazardous-waste'$$,
  array[0::bigint],
  'A source recorded unavailable and made ineligible cannot support production lookup'
);
reset role;

select * from finish();
rollback;
