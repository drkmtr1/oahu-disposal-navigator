# Oʻahu Household Item Disposal Navigator

Status: **Stage 1 and BL-001 through BL-006 are merged. BL-007 provenance/freshness behavior is an implementation candidate pending CI and human merge review.**

The Oʻahu Household Item Disposal Navigator is a small public-interest web project for residents who need to understand how to dispose of a common household item. Official guidance can require people to translate ordinary item names into government categories and combine information from several pages. V1 will provide a single plain-language lookup and return a structured, source-backed result or a clear clarification/unsupported state.

## Version 1

V1 is limited to Oʻahu residential household disposal and approximately 15–25 categories selected only after authoritative-source review. It will use deterministic alias matching first. Bounded AI classification may be added only if evaluation shows that it improves interpretation of ordinary language; AI will never create disposal rules. Every factual instruction must come from curated City and County of Honolulu information, or another primary Hawaiʻi government source when necessary, with visible provenance and verification metadata.

V1 excludes accounts, authentication, saved history, maps, geolocation, booking, commercial waste, image recognition, multilingual support, a general chatbot, autonomous agents, vector search, microservices, and other unproven complexity.

## Architecture

The implementation is one TypeScript web application, using Next.js as the minimal full-stack framework, intended for Vercel and connected through server-side application routes to Supabase PostgreSQL. BL-004 keeps curated tables in a non-exposed `private` schema and exposes one read-only, freshness-filtered `api.disposal_lookup` view. BL-005 adds the same-origin `POST /api/disposal-options` route, deterministic exact-alias matching, runtime database-response validation, and safe ambiguity/unsupported/error responses. Browser code receives only validated response data. No application-specific Supabase or Vercel hosted project has been linked or verified.

The interface is a mobile-first, single-column public-service lookup with four states: initial, success, ambiguous, and unsupported/error. Semantic HTML, keyboard operation, visible focus, strong contrast, plain language, scalable text, and generous touch targets are normal acceptance requirements.

## Local foundation checks

BL-003 pins Node.js 22.17.1, npm 10.9.2, Next.js 16.3.4, React 19.2.8, and the compatible TypeScript/ESLint toolchain in `package.json` and `package-lock.json`. BL-005 activates the names-only server environment contract in `.env.example`: `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Real values remain in an ignored local environment file and are required only to call the route against a running Supabase environment; tests and production builds use no live credentials.

~~~text
npm ci
npm run lint
npm run typecheck
npm test
npm run validate:data
npm run db:verify-seed
npm run check:secrets
npm run build
npx playwright install chromium
npm run test:e2e
npm run audit:dependencies
~~~

The pinned Supabase CLI is a development-only dependency. On a machine with a running Docker-compatible container runtime, database verification is:

~~~text
npm run db:start
npm run db:reset
npm run db:lint
npm run db:test
npm run db:stop
~~~

BL-006 adds the resident form and the initial, structured-success, clarification, and unsupported/error experiences. It includes visible source/trust information, edit/search-again controls, keyboard focus and status handling, responsive 44-pixel controls, one user-initiated transient retry, and safe abstention when a resident is unsure. On 2026-09-06, the project owner reported that 200% zoom, keyboard/focus operation, and Windows Narrator worked without a blocking accessibility issue. BL-007 adds progressively disclosed stored evidence, source update/verification/review-by dates, explicit append-only source-verification history, the [manual source review runbook](docs/SOURCE_REVIEW_RUNBOOK.md), and full canonical provenance/freshness regression coverage. Docker-backed CI exercises the local Supabase path because this workstation has no compatible local runtime. No Supabase/Vercel resource has been linked or deployed.

## Engineering approach

GitHub is the employer-facing repository. Focused branches and pull requests will connect requirements, backlog items, implementation, tests, and acceptance evidence. Supabase will hold curated relational reference data and provenance; Vercel will provide preview and production hosting. Deterministic tests, database policy tests, accessibility checks, end-to-end tests, AI regression evaluation (only if AI is used), and a small comparative user study are required before V1 is done.

Start with [AGENTS.md](AGENTS.md), the [project overview](docs/PROJECT_OVERVIEW.md), the [reviewed V1 canonical dataset](docs/V1_CATEGORY_DATASET.md), and the [UX design](docs/UX_DESIGN.md). The original [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) is preserved as historical context. BL-002 approval is recorded in the dataset and remains subject to its source review-by dates.

This project is intentionally a Level 1 portfolio project: the objective is to demonstrate disciplined problem definition, source integrity, responsible AI boundaries, accessible UX, evaluation, security, and delivery in a system one person can finish and explain.
