# UX design

This document defines how the V1 experience should be presented and operated. [USER_FLOWS.md](USER_FLOWS.md) defines state transitions, [REQUIREMENTS.md](REQUIREMENTS.md) defines obligations, and [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) defines pass/fail evidence. This document turns those artifacts into a coherent interaction and presentation model without adding features.

## Primary user objective

An Oʻahu resident should be able to describe one common household item in ordinary language and quickly understand the supported next disposal step, its important restrictions, and the official evidence behind it. If the system cannot safely answer, the resident should understand why and what reliable action remains available.

The design optimizes for correct task completion and source comprehension, not engagement, conversation length, visual novelty, or maximum answer coverage.

## Universal-design position

V1 is for the general population across ages, reading abilities, devices, dexterity, technical familiarity, and familiarity with government websites. It is not branded, described, or visually styled as an “elderly” product and has no special age mode. Larger targets, readable type, explicit labels, predictable behavior, and low cognitive load are universal quality choices that benefit everyone.

Cross-generational usability means:

- familiar form controls and visible text labels rather than gesture, hover, or icon knowledge;
- one obvious next action and minimal choices;
- forgiving wording and correction without requiring official waste terminology;
- contemporary but restrained civic presentation;
- no assumptions that a resident understands AI, databases, categories, or government program names.

## Low-friction design principles

1. One task per screen context: identify how to dispose of one item.
2. Recognition over recall: examples and clarification choices use resident language.
3. Deterministic simplicity first: no onboarding, account, category picker, location request, preferences, or chat history.
4. Immediate orientation: the purpose, labeled field, and primary action appear without scrolling on common mobile viewports where practical.
5. Preserve user effort: validation keeps the entered text; edit/search-again returns to a ready field.
6. Safe clarity over forced success: ambiguity and unsupported states are explicit and never disguised as guidance.
7. Source visibility: the official source is part of the result hierarchy, not a footnote or icon.
8. Stable, predictable presentation: avoid auto-advancing, unnecessary motion, modal interruptions, and shifting layouts.

## Navigation model

V1 uses a single primary route and no navigation menu. The resident moves between states of the same lookup experience:

Initial → loading → success, ambiguous, unsupported, or error → edit/search again.

The browser Back action remains understandable. A visible project title returns to the initial state only if that behavior does not discard entered text unexpectedly. Result states include a visible text action to edit the current description or start another lookup. Official-source links are secondary outbound actions and use meaningful link text.

There is no dashboard, nested category browser, persistent chatbot, history page, settings area, or required onboarding.

## Page hierarchy

The page uses a centered, moderate-width, single-column main region:

1. Civic identity: project name and concise purpose.
2. Primary task: question label, item input, example/help text, and primary action.
3. Status region: loading, validation, or lookup outcome announced accessibly.
4. Result region when applicable:
   - item identified as;
   - what to do;
   - important requirements;
   - where/program information only when supported;
   - official source and verification date;
   - concise trust explanation;
   - edit/search-again action.
5. Minimal supporting/footer information when justified.

Critical instructions, warnings, next actions, and source identity are never hidden behind tabs, accordions, hover, or tooltips.

## Form philosophy

The form contains one programmatically labeled text input and one visible submit button. Placeholder text is an example, not the only label or a promise that every example is supported. Browser and server validation use the same documented 1–200 meaningful-character contract.

Validation is forgiving about case, surrounding whitespace, and ordinary punctuation. Empty, control-only, wrong-type, and over-limit input receives a specific plain-language error connected to the field. The resident can correct the same value without reopening a dialog or re-entering unrelated information.

Submission by Enter and by pointer/touch must work. While a request is active, prevent accidental duplicate submission, preserve focus predictably, retain the item text, and show a text loading message. Do not require confirmation before a harmless lookup.

## Plain language and content

- Use short sentences, common verbs, and resident-facing item names.
- Prefer “What to do,” “Important requirements,” and “Official source” over internal or government-system jargon.
- Define an unavoidable official term beside its first use.
- State uncertainty directly: “I couldn’t reliably identify a disposal method.”
- Distinguish unsupported coverage from temporary service failure.
- Never imply government endorsement; identify the project as an independent navigator using official sources.
- Explain AI briefly only where trust requires it: official sources define disposal rules; AI may help interpret the item.
- Link text describes its destination, such as “View City disposal guidance,” rather than “Learn more” or a bare URL.

Content review should target concise task-focused instructions without removing safety-relevant qualifications.

## Readability and visual hierarchy

Use semantic headings in a logical order, comfortable spacing, strong text/background contrast, and a calm civic palette. Body text should default to at least 1rem with approximately 1.5 line height; important labels and headings are larger without relying on size alone. Keep ordinary reading lines roughly 45–75 characters on wider screens.

The primary action is visually dominant. Success does not rely only on a checkmark or color. Warnings and errors combine text, semantic status, and restrained visual treatment. The source block is visually meaningful and comparable in prominence to the guidance, while secondary technical details remain subordinate.

Local identity, if used, is understated and civic. Avoid palm trees, beaches, hibiscus decoration, resort styling, tropical gradients, and stereotypical motifs.

## Responsive and touch behavior

Design mobile first in one column and enhance spacing at wider viewports rather than introducing a dashboard. At 320, 375, 768, and 1280 CSS-pixel widths:

- no page-level horizontal scrolling or obscured controls;
- text reflows without clipped instructions or URLs;
- input, submit, clarification, retry, and source actions remain easy to reach;
- primary interactive targets are at least 44 by 44 CSS pixels;
- controls have adequate separation to reduce accidental activation;
- no action depends on hover, a precision gesture, or drag;
- desktop content stays within a moderate reading width.

Support browser text resizing and 200% zoom without loss of information or two-dimensional page scrolling under the criterion in AC-NFR-004-02.

## Progressive disclosure

Show the resident’s identified category, action, safety-relevant requirements, destination/program information, source identity, verification date, and next action immediately. Optional supporting evidence details may use a clearly labeled disclosure only if the core claim and source remain visible without opening it.

Ambiguity uses one focused question with no more than four plain-language choices plus “I’m not sure.” Do not turn clarification into open-ended chat. Technical AI, model, database, and provenance internals belong in portfolio documentation, not the resident’s primary flow.

## State behavior

### Loading

Replace or accompany the primary action with plain text such as “Finding disposal options…” and an accessible live status. Keep the layout stable, prevent duplicate requests, and do not use a spinner alone. If the wait reaches the documented timeout, move to a recoverable error rather than loading indefinitely.

### Empty

The initial state is intentionally useful rather than blank: it contains purpose, label, example, and action. Submitting an empty value produces field validation, not an empty results panel. Missing optional “where” data removes that section cleanly; it must not show an empty card or placeholder.

### Error and unsupported

Use distinct content for invalid input, unsupported coverage, missing/stale evidence, temporary database/provider failure, and rate limiting. Do not expose stack traces, provider details, SQL, or internal identifiers except an optional safe support/request reference. Never show partial authoritative guidance when required evidence is missing. Provide edit, retry when safe, or an approved official fallback.

Errors remain in context, are announced to assistive technology, do not rely on color, and preserve the resident’s input. Automatic retry is limited by API_CONTRACTS and never loops.

### Confirmation

A lookup is read-only and requires no “Are you sure?” dialog. Success uses a concise status such as “Disposal guidance found” plus the structured result. Ambiguous selection is clarification, not confirmation. Because V1 has no destructive resident action, booking, submission, or account change, no additional confirmation flow is justified.

## Accessibility considerations

Apply semantic HTML before custom ARIA. Provide a labeled input; real buttons/links; logical heading, landmark, and focus order; visible focus; keyboard completion; screen-reader-compatible status updates; meaningful source links; contrast meeting WCAG 2.2 AA where applicable; non-color error cues; touch targets; text resize/zoom; reduced or absent nonessential motion; and readable reflow.

Focus should move only when it helps orientation: invalid submission identifies/announces the field error; a completed lookup announces the result heading/status; clarification exposes the question and choices. Do not steal focus during loading. Automated checks supplement, not replace, keyboard, zoom, and representative screen-reader review.

## Measurable usability objectives

The following existing criteria provide the UX evidence:

| Objective | Requirement and acceptance evidence |
|---|---|
| Complete the core flow with keyboard and assistive semantics | NFR-004; AC-NFR-004-01, AC-NFR-004-03 |
| Retain usable information and controls at 200% zoom | NFR-004; AC-NFR-004-02 |
| Use visible text actions and 44 by 44 CSS-pixel primary targets | NFR-005; AC-NFR-005-01 |
| At least 80% begin correctly without instruction and identify the source | NFR-005; AC-NFR-005-02 |
| No horizontal scrolling/obscured controls at representative widths | NFR-006; AC-NFR-006-01 |
| Complete the one-input and four-state resident journey | FR-001, FR-006, FR-008, FR-009, FR-011, FR-012 and their mapped ACs |
| Demonstrate material improvement over the official workflow | AC-V1-01 and EVALUATION_PLAN |

Also record invalid-submission rate, ambiguity recovery, task errors, recovery failures, source-identification success, completion time, and observed accessibility barriers. The small user study is directional and may not be generalized to all Oʻahu residents.

## Design guardrails

Do not add a category picker before input, chat bubbles, a chatbot sidebar, dashboards, maps, geolocation, accounts, personalization, image recognition, animated novelty, tourist imagery, dark mode as a feature, or a multi-step wizard without approved evidence and scope change. A polished simple lookup is the V1 design.
