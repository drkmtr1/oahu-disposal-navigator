SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.reject_source_verification_mutation()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  raise exception using
    errcode = '55000',
    message = 'source verification history is append-only';
end;
$function$;

CREATE TRIGGER source_verifications_append_only
  BEFORE DELETE OR UPDATE ON private.source_verifications
  FOR EACH ROW
  EXECUTE FUNCTION private.reject_source_verification_mutation();

REVOKE ALL ON FUNCTION "private"."reject_source_verification_mutation"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "private"."reject_source_verification_mutation"() TO "postgres";
