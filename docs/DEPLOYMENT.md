# Deployment

This is a future reproducible path, not evidence of a current deployment. No Supabase/Vercel resource, link, environment, schema, or CI workflow was created in Stage 1.

## Local development

BL-003 pins Node.js 22.17.1 and npm 10.9.2, commits the npm lockfile, and supplies lint, type, test, reviewed-data validation, secret-scan, production-build, and dependency-audit scripts. No runtime environment value is required for the static foundation. Docker-compatible Supabase CLI requirements remain deferred until database work begins. Use a local Supabase stack with synthetic/reviewed seed data when authorized; never expose it publicly.

The committed environment example contains names only. Expected future server-only variables include the Supabase project URL, a publishable/read-only key or narrower credential, and optional model key/model ID. Local values stay in ignored files. Their activation and exact provider-specific contracts belong to the relevant later backlog items. Discover exact CLI commands through installed-version help and pin tool versions where practical.

The new-project database path is declarative schema files plus generated/reviewed versioned migrations and repeatable seeds/tests. Current workflow guidance: https://supabase.com/docs/guides/local-development/cli-workflows

## GitHub and CI

Use focused backlog branches and PRs. CI grows with implementation and gates reproducible install, lint/type/unit/contract/data/database tests, build, E2E/accessibility, secret/dependency checks, and deterministic evaluation. Protect main with PR/required checks when repository settings allow; a solo maintainer self-reviews the diff and AC evidence. No normal direct-to-main implementation.

## Supabase environments and recovery

Use local/test data during development and one production Supabase project only when the deployment backlog authorizes it. Preview builds must not have production write access. Apply reviewed migrations through a controlled release step; verify migration order/status and access policies before application promotion. Version reference seeds/data changes.

Before production, document provider backup availability, a tested logical export/restore path appropriate to the plan, responsible owner, and recovery objective. Roll back deployed schema by a reviewed forward corrective migration; never reset a production database.

## Vercel

Connect the GitHub repository only in the deployment milestone. Use Vercel Local/Preview/Production separation, environment-scoped variables, HTTPS, and preview deployments for PR validation. Because Vercel documents that a new project’s first deployment is production, project creation/import must occur only in the explicitly approved deployment task after release prerequisites are ready. See:

- https://vercel.com/docs/deployments/environments
- https://vercel.com/docs/git

Preview uses non-production Supabase data/credentials. Production points only to the approved production project. Never put private values in public-prefixed variables or PR logs.

## Release sequence

1. Confirm source/data version, ACs, security/access review, evaluation, and user-test gates.
2. Freeze candidate commit and pass CI.
3. Back up/confirm recovery and apply production migrations/data through the approved mechanism.
4. Run database constraints, read, write-denial, and provenance smoke checks.
5. Deploy the exact tested application artifact/commit to Vercel production.
6. Verify HTTPS, security headers, initial/success/ambiguous/unsupported flows, source links, mobile/keyboard basics, logs, and dependency failures.
7. Record URL, commit, data/migration version, checks, time, owner, and known issues.

## Rollback

For application failure, re-point/rollback to the last verified Vercel deployment. For data/schema issues, disable affected records where safe and use a reviewed forward migration/data correction; preserve provenance history. Re-run smoke checks after rollback. A rollback decision does not erase logs/evaluation evidence.

## Production verification

A READY deployment/build or successful migration is insufficient. Production is accepted only when the real browser → server → Supabase → response/provenance path passes, optional AI behavior is safely contained, no secret is exposed, logs are diagnostic/redacted, and monitoring signals are available.
