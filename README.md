# Oʻahu Household Item Disposal Navigator

Status: **Stage 1 and BL-001 are merged. BL-002 now has a 15-category canonical-data review candidate pending independent human source approval; no application has been implemented.**

The Oʻahu Household Item Disposal Navigator is a small public-interest web project for residents who need to understand how to dispose of a common household item. Official guidance can require people to translate ordinary item names into government categories and combine information from several pages. V1 will provide a single plain-language lookup and return a structured, source-backed result or a clear clarification/unsupported state.

## Version 1

V1 is limited to Oʻahu residential household disposal and approximately 15–25 categories selected only after authoritative-source review. It will use deterministic alias matching first. Bounded AI classification may be added only if evaluation shows that it improves interpretation of ordinary language; AI will never create disposal rules. Every factual instruction must come from curated City and County of Honolulu information, or another primary Hawaiʻi government source when necessary, with visible provenance and verification metadata.

V1 excludes accounts, authentication, saved history, maps, geolocation, booking, commercial waste, image recognition, multilingual support, a general chatbot, autonomous agents, vector search, microservices, and other unproven complexity.

## Planned architecture

The planned implementation is one TypeScript web application, using Next.js as the minimal full-stack framework, hosted by Vercel and connected through server-side application routes to Supabase PostgreSQL. Browser code will receive only validated response data. Privileged database and model-provider credentials remain server-side. No application-specific Supabase or Vercel project/configuration was detected in the local repository; external dashboard state has not been verified.

The interface is a mobile-first, single-column public-service lookup with four states: initial, success, ambiguous, and unsupported/error. Semantic HTML, keyboard operation, visible focus, strong contrast, plain language, scalable text, and generous touch targets are normal acceptance requirements.

## Engineering approach

GitHub is the employer-facing repository. Focused branches and pull requests will connect requirements, backlog items, implementation, tests, and acceptance evidence. Supabase will hold curated relational reference data and provenance; Vercel will provide preview and production hosting. Deterministic tests, database policy tests, accessibility checks, end-to-end tests, AI regression evaluation (only if AI is used), and a small comparative user study are required before V1 is done.

Start with [AGENTS.md](AGENTS.md), the [project overview](docs/PROJECT_OVERVIEW.md), the [V1 dataset review candidate](docs/V1_CATEGORY_DATASET.md), and the [UX design](docs/UX_DESIGN.md). The original [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) is preserved as historical context. The BL-002 dataset cannot become active merely by existing in Git; its source evidence requires the documented independent human review.

This project is intentionally a Level 1 portfolio project: the objective is to demonstrate disciplined problem definition, source integrity, responsible AI boundaries, accessible UX, evaluation, security, and delivery in a system one person can finish and explain.
