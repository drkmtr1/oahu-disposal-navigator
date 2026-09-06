CREATE SCHEMA "api";

CREATE SCHEMA "private";

CREATE TABLE "private"."disposal_categories" (
  "id"            uuid                     NOT NULL,
  "slug"          text                     NOT NULL,
  "display_name"  text                     NOT NULL,
  "description"   text                     NOT NULL,
  "active"        boolean                  NOT NULL DEFAULT false,
  "review_status" text                     NOT NULL DEFAULT 'pending'::text,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "disposal_categories_description_not_blank" CHECK ((btrim(description) <> ''::text)),
  CONSTRAINT "disposal_categories_display_name_not_blank" CHECK ((btrim(display_name) <> ''::text)),
  CONSTRAINT "disposal_categories_pkey" PRIMARY KEY (id),
  CONSTRAINT "disposal_categories_review_status_allowed"
    CHECK ((review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'expired'::text, 'conflict'::text, 'rejected'::text]))),
  CONSTRAINT "disposal_categories_slug_format" CHECK ((slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text)),
  CONSTRAINT "disposal_categories_slug_key" UNIQUE (slug)
);

ALTER TABLE "private"."disposal_categories"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "private"."disposal_categories"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "private"."disposal_guidance" (
  "id"             uuid                     NOT NULL,
  "category_id"    uuid                     NOT NULL,
  "action_summary" text                     NOT NULL,
  "requirements"   text[]                   NOT NULL,
  "where_summary"  text,
  "escalation_url" text,
  "active"         boolean                  NOT NULL DEFAULT false,
  "review_status"  text                     NOT NULL DEFAULT 'pending'::text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "disposal_guidance_action_not_blank" CHECK ((btrim(action_summary) <> ''::text)),
  CONSTRAINT "disposal_guidance_escalation_https" CHECK (((escalation_url IS NULL) OR (escalation_url ~ '^https://'::text))),
  CONSTRAINT "disposal_guidance_id_category_unique" UNIQUE (id, category_id),
  CONSTRAINT "disposal_guidance_pkey" PRIMARY KEY (id),
  CONSTRAINT "disposal_guidance_requirements_present" CHECK (((cardinality(requirements) > 0) AND (array_position(requirements, ''::text) IS NULL))),
  CONSTRAINT "disposal_guidance_review_status_allowed"
    CHECK ((review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'expired'::text, 'conflict'::text, 'rejected'::text]))),
  CONSTRAINT "disposal_guidance_where_not_blank" CHECK (((where_summary IS NULL) OR (btrim(where_summary) <> ''::text)))
);

ALTER TABLE "private"."disposal_guidance"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "private"."disposal_guidance"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "private"."item_aliases" (
  "id"               uuid                     NOT NULL,
  "category_id"      uuid                     NOT NULL,
  "alias"            text                     NOT NULL,
  "normalized_alias" text                     NOT NULL,
  "locale"           text                     NOT NULL DEFAULT 'en'::text,
  "review_status"    text                     NOT NULL DEFAULT 'pending'::text,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "item_aliases_alias_not_blank" CHECK (((btrim(alias) <> ''::text) AND (char_length(alias) <= 200))),
  CONSTRAINT "item_aliases_category_normalized_unique" UNIQUE (category_id, normalized_alias),
  CONSTRAINT "item_aliases_locale_not_blank" CHECK ((btrim(locale) <> ''::text)),
  CONSTRAINT "item_aliases_normalized_not_blank" CHECK (((btrim(normalized_alias) <> ''::text) AND (char_length(normalized_alias) <= 200))),
  CONSTRAINT "item_aliases_pkey" PRIMARY KEY (id),
  CONSTRAINT "item_aliases_review_status_allowed" CHECK ((review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'expired'::text, 'conflict'::text, 'rejected'::text])))
);

ALTER TABLE "private"."item_aliases"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "private"."item_aliases"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "private"."official_sources" (
  "id"                  uuid                     NOT NULL,
  "stable_id"           text                     NOT NULL,
  "organization"        text                     NOT NULL,
  "title"               text                     NOT NULL,
  "url"                 text                     NOT NULL,
  "authority_level"     text                     NOT NULL,
  "government_domain"   text                     NOT NULL,
  "first_retrieved_on"  date                     NOT NULL,
  "research_checked_on" date                     NOT NULL,
  "apparent_updated_on" date,
  "date_basis"          text                     NOT NULL,
  "last_verified_on"    date                     NOT NULL,
  "review_by"           date                     NOT NULL,
  "review_cadence_days" smallint                 NOT NULL,
  "review_status"       text                     NOT NULL DEFAULT 'pending'::text,
  "verification_notes"  text                     NOT NULL,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "official_sources_authority_allowed" CHECK ((authority_level = ANY (ARRAY['city_primary'::text, 'state_primary'::text, 'other_primary_government'::text]))),
  CONSTRAINT "official_sources_date_basis_not_blank" CHECK ((btrim(date_basis) <> ''::text)),
  CONSTRAINT "official_sources_government_domain" CHECK ((government_domain ~ '(^|\.)gov$|\.gov$'::text)),
  CONSTRAINT "official_sources_organization_not_blank" CHECK ((btrim(organization) <> ''::text)),
  CONSTRAINT "official_sources_pkey" PRIMARY KEY (id),
  CONSTRAINT "official_sources_review_cadence_positive" CHECK ((review_cadence_days > 0)),
  CONSTRAINT "official_sources_review_sequence"
    CHECK (((research_checked_on >= first_retrieved_on) AND (last_verified_on >= first_retrieved_on) AND (review_by >= last_verified_on))),
  CONSTRAINT "official_sources_review_status_allowed" CHECK ((review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'expired'::text, 'conflict'::text, 'rejected'::text]))),
  CONSTRAINT "official_sources_stable_id_format" CHECK ((stable_id ~ '^src-[a-z0-9]+(?:-[a-z0-9]+)*$'::text)),
  CONSTRAINT "official_sources_stable_id_key" UNIQUE (stable_id),
  CONSTRAINT "official_sources_title_not_blank" CHECK ((btrim(title) <> ''::text)),
  CONSTRAINT "official_sources_url_https" CHECK ((url ~ '^https://'::text)),
  CONSTRAINT "official_sources_url_key" UNIQUE (url),
  CONSTRAINT "official_sources_verification_notes_not_blank" CHECK ((btrim(verification_notes) <> ''::text))
);

ALTER TABLE "private"."official_sources"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "private"."official_sources"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "private"."source_evidence" (
  "id"                  uuid                     NOT NULL,
  "stable_id"           text                     NOT NULL,
  "source_id"           uuid                     NOT NULL,
  "category_id"         uuid                     NOT NULL,
  "guidance_id"         uuid                     NOT NULL,
  "locator"             text,
  "supporting_summary"  text                     NOT NULL,
  "claim_scope"         text                     NOT NULL,
  "research_checked_on" date                     NOT NULL,
  "reviewed_on"         date                     NOT NULL,
  "reviewer_ref"        text                     NOT NULL,
  "review_status"       text                     NOT NULL DEFAULT 'pending'::text,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "source_evidence_claim_scope_not_blank" CHECK ((btrim(claim_scope) <> ''::text)),
  CONSTRAINT "source_evidence_locator_not_blank" CHECK (((locator IS NULL) OR (btrim(locator) <> ''::text))),
  CONSTRAINT "source_evidence_pkey" PRIMARY KEY (id),
  CONSTRAINT "source_evidence_review_sequence" CHECK ((reviewed_on >= research_checked_on)),
  CONSTRAINT "source_evidence_review_status_allowed" CHECK ((review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'expired'::text, 'conflict'::text, 'rejected'::text]))),
  CONSTRAINT "source_evidence_reviewer_not_blank" CHECK ((btrim(reviewer_ref) <> ''::text)),
  CONSTRAINT "source_evidence_stable_id_format" CHECK ((stable_id ~ '^ev-[a-z0-9]+(?:-[a-z0-9]+)*$'::text)),
  CONSTRAINT "source_evidence_stable_id_key" UNIQUE (stable_id),
  CONSTRAINT "source_evidence_summary_not_blank" CHECK ((btrim(supporting_summary) <> ''::text))
);

ALTER TABLE "private"."source_evidence"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "private"."source_evidence"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "private"."source_verifications" (
  "id"                  uuid                     NOT NULL,
  "source_id"           uuid                     NOT NULL,
  "verified_on"         date                     NOT NULL,
  "result"              text                     NOT NULL,
  "notes"               text,
  "apparent_updated_on" date,
  "reviewer_ref"        text                     NOT NULL,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "source_verifications_notes_not_blank" CHECK (((notes IS NULL) OR (btrim(notes) <> ''::text))),
  CONSTRAINT "source_verifications_pkey" PRIMARY KEY (id),
  CONSTRAINT "source_verifications_result_allowed" CHECK ((result = ANY (ARRAY['confirmed'::text, 'changed'::text, 'unavailable'::text, 'conflict'::text]))),
  CONSTRAINT "source_verifications_reviewer_not_blank" CHECK ((btrim(reviewer_ref) <> ''::text)),
  CONSTRAINT "source_verifications_source_date_unique" UNIQUE (source_id, verified_on)
);

ALTER TABLE "private"."source_verifications"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "private"."source_verifications"
  FORCE ROW LEVEL SECURITY;

ALTER TABLE "private"."disposal_guidance"
  ADD CONSTRAINT "disposal_guidance_category_id_fkey" FOREIGN KEY (category_id) REFERENCES private.disposal_categories(id) ON DELETE RESTRICT;

ALTER TABLE "private"."item_aliases"
  ADD CONSTRAINT "item_aliases_category_id_fkey" FOREIGN KEY (category_id) REFERENCES private.disposal_categories(id) ON DELETE RESTRICT;

ALTER TABLE "private"."source_evidence"
  ADD CONSTRAINT "source_evidence_category_id_fkey" FOREIGN KEY (category_id) REFERENCES private.disposal_categories(id) ON DELETE RESTRICT;

ALTER TABLE "private"."source_evidence"
  ADD CONSTRAINT "source_evidence_guidance_category_fkey" FOREIGN KEY (guidance_id, category_id) REFERENCES private.disposal_guidance(id, category_id) ON DELETE RESTRICT;

ALTER TABLE "private"."source_evidence"
  ADD CONSTRAINT "source_evidence_source_id_fkey" FOREIGN KEY (source_id) REFERENCES private.official_sources(id) ON DELETE RESTRICT;

ALTER TABLE "private"."source_verifications"
  ADD CONSTRAINT "source_verifications_source_id_fkey" FOREIGN KEY (source_id) REFERENCES private.official_sources(id) ON DELETE RESTRICT;

CREATE VIEW "api"."disposal_lookup" WITH (security_invoker=true) AS  SELECT category.slug AS category_id,
    category.display_name AS category_name,
    category.description AS category_description,
    item_alias.alias,
    item_alias.normalized_alias,
    item_alias.locale,
    guidance.id AS guidance_id,
    guidance.action_summary,
    guidance.requirements,
    guidance.where_summary,
    guidance.escalation_url,
    source.stable_id AS source_id,
    source.organization AS source_organization,
    source.title AS source_title,
    source.url AS source_url,
    source.apparent_updated_on AS source_apparent_updated_on,
    source.last_verified_on AS source_verified_on,
    source.review_by AS source_review_by,
    evidence.stable_id AS evidence_id,
    evidence.supporting_summary AS evidence_summary,
    evidence.locator AS evidence_locator,
    evidence.claim_scope AS evidence_claim_scope,
    evidence.reviewed_on AS evidence_reviewed_on
   FROM ((((private.disposal_categories category
     JOIN private.item_aliases item_alias ON ((item_alias.category_id = category.id)))
     JOIN private.disposal_guidance guidance ON ((guidance.category_id = category.id)))
     JOIN private.source_evidence evidence ON (((evidence.category_id = category.id) AND (evidence.guidance_id = guidance.id))))
     JOIN private.official_sources source ON ((source.id = evidence.source_id)))
  WHERE (category.active AND (category.review_status = 'approved'::text) AND (item_alias.review_status = 'approved'::text) AND guidance.active AND (guidance.review_status = 'approved'::text) AND (evidence.review_status = 'approved'::text) AND (source.review_status = 'approved'::text) AND (source.review_by >= CURRENT_DATE));

CREATE INDEX disposal_categories_active_slug_idx ON private.disposal_categories USING btree (slug)
  WHERE (active AND (review_status = 'approved'::text));

CREATE INDEX disposal_guidance_category_id_idx ON private.disposal_guidance USING btree (category_id);

CREATE UNIQUE INDEX disposal_guidance_one_active_per_category_idx ON private.disposal_guidance USING btree (category_id)
  WHERE active;

CREATE INDEX item_aliases_category_id_idx ON private.item_aliases USING btree (category_id);

CREATE INDEX item_aliases_normalized_approved_idx ON private.item_aliases USING btree (normalized_alias, category_id)
  WHERE (review_status = 'approved'::text);

CREATE INDEX official_sources_review_idx ON private.official_sources USING btree (review_status, review_by);

CREATE INDEX source_evidence_category_id_idx ON private.source_evidence USING btree (category_id);

CREATE INDEX source_evidence_guidance_id_idx ON private.source_evidence USING btree (guidance_id);

CREATE INDEX source_evidence_source_id_idx ON private.source_evidence USING btree (source_id);

CREATE INDEX source_verifications_source_id_idx ON private.source_verifications USING btree (source_id);

CREATE POLICY "categories_read_approved_active" ON "private"."disposal_categories"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((active AND (review_status = 'approved'::text)));

CREATE POLICY "guidance_read_approved_active" ON "private"."disposal_guidance"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((active AND (review_status = 'approved'::text)));

CREATE POLICY "aliases_read_approved" ON "private"."item_aliases"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((review_status = 'approved'::text));

CREATE POLICY "sources_read_approved_fresh" ON "private"."official_sources"
  FOR SELECT
  TO "anon", "authenticated"
  USING (((review_status = 'approved'::text) AND (review_by >= CURRENT_DATE)));

CREATE POLICY "evidence_read_approved" ON "private"."source_evidence"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((review_status = 'approved'::text));

GRANT USAGE ON SCHEMA "api" TO "anon", "authenticated";

GRANT CREATE, USAGE ON SCHEMA "api" TO "postgres";

GRANT USAGE ON SCHEMA "private" TO "anon", "authenticated";

GRANT CREATE, USAGE ON SCHEMA "private" TO "postgres";

GRANT SELECT ON TABLE "private"."disposal_categories" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "private"."disposal_categories" TO "postgres";

GRANT SELECT ON TABLE "private"."disposal_guidance" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "private"."disposal_guidance" TO "postgres";

GRANT SELECT ON TABLE "private"."item_aliases" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "private"."item_aliases" TO "postgres";

GRANT SELECT ON TABLE "private"."official_sources" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "private"."official_sources" TO "postgres";

GRANT SELECT ON TABLE "private"."source_evidence" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "private"."source_evidence" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "private"."source_verifications" TO "postgres";

GRANT SELECT ON TABLE "api"."disposal_lookup" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "api"."disposal_lookup" TO "postgres";
