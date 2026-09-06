# User flows

The application has one primary entry point and one resident task. It does not require onboarding, category knowledge, an account, location, or chat history.

This document defines transitions and recovery paths. See [UX_DESIGN.md](UX_DESIGN.md) for navigation, page hierarchy, forms, readability, responsive/touch presentation, progressive disclosure, loading/empty/error/confirmation behavior, and universal-design positioning.

## Primary decision flow

~~~mermaid
flowchart TD
    A[Initial: one labeled item input] --> B{Valid input?}
    B -- No --> C[Inline recoverable validation error]
    C --> A
    B -- Yes --> D[Normalize and deterministic alias match]
    D -->|One active category| E[Retrieve reviewed authoritative guidance]
    D -->|Several plausible categories| F[Ambiguous: plain-language choices]
    D -->|No match| G{AI gate enabled and provider available?}
    G -->|No| H[Unsupported or uncertain]
    G -->|Yes| I[Bounded allowlist classification]
    I -->|One valid category| E
    I -->|Several candidates| F
    I -->|Invalid or unsupported| H
    F -->|One choice| E
    F -->|I'm not sure| H
    E --> J{Active reviewed evidence complete?}
    J -->|Yes| K[Structured success with visible source]
    J -->|No| H
    K --> L[Edit or search another item]
    H --> L
~~~

## State 1: Initial

Show the project name, one-sentence purpose, a programmatically labeled large input with examples that are not support guarantees, and one prominent “Find disposal options” button. Explain no technology. Submission works with keyboard and pointer. The button gives immediate busy feedback without auto-advancing focus unexpectedly.

Empty, whitespace/control-only, and over-200-character input stays on this state with a specific text error connected to the input. The input retains its value and focus moves or is announced accessibly.

## State 2: Success

For an exact/normalized alias, deterministic software chooses the single active category without a model call. If the optional AI gate is later enabled, a valid single category ID follows the same retrieval path.

The screen presents:

1. “Item identified as” and the canonical display name.
2. “What to do” from curated guidance.
3. “Important requirements” as concise bullets.
4. “Where” only when authoritative data supports it.
5. “Official source” with organization, meaningful title/link, and verification date.
6. A short trust note and a visible way to edit/search again.

No free-form model output can enter disposal instruction fields.

## State 3: Ambiguous

If an alias or validated model output maps to several plausible active categories, ask one concrete question and show no more than four plain-language category choices plus “I’m not sure.” A chosen option returns to canonical evidence retrieval. “I’m not sure” leads to the unsupported state and approved official fallback. The system does not continue an open-ended conversation or guess.

## State 4: Unsupported/error

Unsupported, irrelevant, unsafe, unresolved, missing-evidence, and some dependency failures share a visually consistent but specifically worded state. It must distinguish:

- not currently covered;
- needs more detail;
- service temporarily unavailable;
- official evidence unavailable or due for review.

Show no disposal method unless a complete deterministic result was already retrieved. Where approved, link to the general official guidance/contact. Offer edit/retry and start-another-search actions. A database failure may retry once from the UI; do not loop. A model failure skips AI and uses deterministic results or abstains.

## Recovery and return

The user can return to the input from every result state, preserve/edit the previous wording when useful, or clear it for another item. No lookup history is persisted for the user.

## Failure-specific behavior

| Condition | Behavior |
|---|---|
| Empty/invalid/too long | Inline labeled validation message; no request or model call |
| Deterministic ambiguity | Clarification choices |
| Unsupported item | Unsupported state and approved official fallback |
| Missing/unreviewed/expired evidence | Abstain; never show partial factual guidance |
| Database timeout/failure | Generic retryable error; safe diagnostic event |
| Model timeout/unavailable/malformed/not-allowed ID | Ignore model output; deterministic fallback or unsupported |
| Repeated transient failure | Stop automatic retry and invite a later retry/official source |
