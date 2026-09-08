-- The hosted Data API object-exposure control may add table privileges.
-- Reassert the V1 contract after that platform configuration: the public
-- lookup view is readable, but never writable, for browser-facing roles.

revoke all on table api.disposal_lookup from public, anon, authenticated, service_role;

grant select on table api.disposal_lookup to anon, authenticated;
