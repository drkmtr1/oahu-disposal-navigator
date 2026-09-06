-- Supabase's declarative diff does not reliably emit schema/default privileges.
-- Keep these statements aligned with supabase/schemas/01_reference_data.sql.

revoke all on schema private from public, anon, authenticated, service_role;
revoke all on schema api from public, anon, authenticated, service_role;

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

alter default privileges for role postgres in schema private
  revoke execute on functions from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema api
  revoke execute on functions from public, anon, authenticated, service_role;

