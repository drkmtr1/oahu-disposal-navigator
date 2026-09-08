# Deployment

This document defines the reproducible operating path. Stage 1 created no hosted resource; BL-013 has since created the application-specific Supabase project and Vercel production deployment. The controlled deployment is live but BL-013 is not complete until the explicitly authorized backup/restore drill is recorded. Current evidence and known limits are in [BL-013_PRODUCTION_RELEASE.md](BL-013_PRODUCTION_RELEASE.md).

## Local development

BL-003 pins Node.js 22.17.1 and npm 10.9.2, commits the npm lockfile, and supplies lint, type, test, reviewed-data validation, secret-scan, production-build, and dependency-audit scripts. BL-004 pins Supabase CLI 2.116.0 as a development-only dependency and commits local configuration with unused Auth, Realtime, Storage, Edge Runtime, Vector, and Analytics services disabled. A Docker-compatible container runtime is required for `npm run db:start`, `db:reset`, `db:lint`, and `db:test`; the local stack is development-only and must never be exposed publicly.

The committed environment example contains names only. The deployed deterministic-only V1 uses server-only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; it has no deployed model credentials under ADR-011. Local values stay in ignored files. Discover exact CLI commands through installed-version help and pin tool versions where practical.

The database path is declarative schema files plus generated/reviewed versioned migrations and repeatable seeds/tests. The `api` schema alone is configured as the local Data API surface. The factual seed is generated from the approved JSON with `npm run db:generate-seed` and checked with `npm run db:verify-seed`. Current workflow guidance: https://supabase.com/docs/guides/local-development/cli-workflows

## GitHub and CI

Use focused backlog branches and PRs. CI grows with implementation and gates reproducible install, lint/type/unit/contract/data/database tests, build, E2E/accessibility, secret/dependency checks, and deterministic evaluation. Protect main with PR/required checks when repository settings allow; a solo maintainer self-reviews the diff and AC evidence. No normal direct-to-main implementation.

## Supabase environments and recovery

Use local/test data during development and one production Supabase project only when the deployment backlog authorizes it. BL-004 did not create a hosted project. In BL-013 the hosted Data API uses an explicit allowlist: `api` is the only exposed schema and `api.disposal_lookup` is the only exposed object; `private` is not exposed. Vercel's two Supabase variables are Production-only, so Preview has no production Supabase credential or data path. Apply reviewed migrations through a controlled release step; verify migration order/status and access policies before application promotion. Version reference seeds/data changes.

Before production, document provider backup availability, a tested logical export/restore path appropriate to the plan, responsible owner, and recovery objective. Roll back deployed schema by a reviewed forward corrective migration; never reset a production database.

## Vercel

Connect the GitHub repository only in the deployment milestone. Use Vercel Local/Preview/Production separation, environment-scoped variables, HTTPS, and preview deployments for PR validation. BL-013 has linked the GitHub repository and deployed the approved `main` artifact to Production; Preview intentionally has no production database credentials until a separate non-production data environment is approved. Because Vercel documents that a new project’s first deployment is production, project creation/import must occur only in the explicitly approved deployment task after release prerequisites are ready. See:

- https://vercel.com/docs/deployments/environments
- https://vercel.com/docs/git

Preview must use a separate non-production Supabase data/credential path if one is later approved. This project has no separate preview database, so Preview currently has no Supabase credential or data path. Production points only to the approved production project. Never put private values in public-prefixed variables or PR logs.

## Release sequence

1. Confirm source/data version, ACs, security/access review, deterministic evaluation, the frozen non-participant resident-task benchmark, and applicable accessibility evidence.
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
