# Project overview

## Purpose and problem

The Oʻahu Household Item Disposal Navigator helps an Oʻahu resident answer: “How should I get rid of this household item?” Official guidance exists, but a resident may need to translate an everyday description into an official category, find the relevant program, and interpret restrictions across government pages. The narrow V1 intervention is to reduce that retrieval and interpretation burden for a curated set of common items without claiming to solve illegal dumping, waste capacity, or environmental policy.

The target user is any Oʻahu resident, across ages, devices, reading abilities, technical familiarity, and familiarity with government websites. The primary need is a quick, trustworthy next step stated in ordinary language and backed by inspectable official evidence.

## Current workaround and value

The mandate identifies the current workaround as navigating official City and County of Honolulu information and translating an item into government terminology. This remains a project hypothesis, not user-research evidence. The V1 non-participant benchmark verifies bounded system behavior but cannot establish observed resident comprehension, ease, speed, or superiority over the official workflow.

The value proposition is: enter one ordinary-language item description and receive a structured, authoritative answer, a small clarification choice, or a safe unsupported response.

## Level 1 and V1 objective

This is a Level 1 public-interest AI engineering portfolio project: one person should be able to understand, operate, evaluate, and finish it. V1 will cover Oʻahu residential household disposal, approximately 15–25 evidence-supported categories, a deterministic baseline, four core UI states, visible provenance, measurable evaluation, and a simple Vercel/Supabase release. AI is optional, bounded, and justified only by measured classification gaps.

Success means:

- every supported disposal claim is linked to reviewed primary-government evidence;
- critical deterministic and provenance tests pass with no unsupported claim;
- unsupported and hazardous ambiguity cases safely abstain;
- representative residents can complete the core flow and identify the source;
- the navigator improves median completion time or completion rate versus the official workflow under the thresholds in EVALUATION_PLAN;
- the security, accessibility, operational, and deployment gates in DEFINITION_OF_DONE pass.

## Evidence, assumptions, and constraints

### Mandate-backed facts

- The repository and GitHub remote exist.
- GitHub, Supabase PostgreSQL, and Vercel are fixed platform constraints.
- The product is public and does not require accounts.
- City and County of Honolulu sources, especially ENV, are the primary intended authority.
- AI-generated content is not authoritative.

### Assumptions to validate

1. Official sources contain sufficiently specific and current guidance for 15–25 categories.
2. A single item-description lookup addresses the main resident difficulty.
3. English-only V1 is useful enough for a first measured release.
4. Public, read-only reference data can be served safely without user authentication.
5. Deterministic aliases will resolve a meaningful share of inputs; AI may add value only in the remaining cases.

Constraints include small solo-maintainer scope, no sensitive-data collection by design, manual source review, ordinary relational data, minimal infrastructure, and no application implementation during Stage 1.

## Source, usability, and portfolio objectives

Important instructions must retain organization, title, URL, evidence passage, apparent source date when available, project verification date, category association, and review state. Stale or missing evidence is an unavailable answer, not permission to infer.

The UX must be a calm civic lookup, not a chatbot. It must support mobile use, keyboard completion, screen readers, zoom, strong contrast, large targets, plain language, and clear recovery without branding the product for a particular age.

The portfolio evidence should demonstrate traceable product judgment: problem → requirements → acceptance criteria → architecture/UX → backlog → implementation → tests/evaluations → Definition of Done.

## Current status

Stage 1 and BL-001 through BL-012 are merged to `main`; BL-012 squash-merged at `6fbf275`. The resident-facing four-state UI, clarification selection, recovery behavior, provenance/freshness behavior, deterministic evaluation, non-participant resident-task benchmark, and browser accessibility/responsive checks pass, and the project owner reported no blocking issue during the 2026-09-06 manual 200% zoom, keyboard/focus, and Windows Narrator review. ADR-011 keeps V1 deterministic-only after the bounded model experiment failed its critical-safety gate. Docker-backed CI exercises the local Supabase path because this workstation lacks a compatible runtime. BL-013 has provisioned the application-specific Supabase project and a controlled Vercel production deployment, with live source-backed lookup, access-boundary, latency, header, rate-protection, backup availability, recovery ownership, and rollback evidence recorded in [BL-013_PRODUCTION_RELEASE.md](BL-013_PRODUCTION_RELEASE.md). BL-014 is now the V1 release-audit and tagging milestone.
