# AI system design

## Why AI is only being considered

Residents may use colloquial descriptions, misspellings, or wording not represented by exact aliases. That is a classification problem, not permission for a general waste chatbot. A deterministic baseline is implemented and evaluated first. AI is added only if BL-008 demonstrates a meaningful accuracy/recovery gain that outweighs latency, cost, and risk.

## Exact bounded responsibility

The optional model maps one normalized item description to one of the currently active category IDs, several plausible IDs, or unsupported. It may not retrieve sources, browse, call tools, choose a disposal method, generate safety advice, or update data. Grounded rewriting is deferred and needs a separate requirement, evaluation, and ADR.

Deterministic software performs validation, normalization, exact aliases, allowed-category construction, output-schema validation, ambiguity/unsupported decisions, database lookup, review/freshness checks, response assembly, citations, timeouts, error handling, and logging.

## Classification contract

Input contains only the user description (bounded to 200 characters), task instructions, and minimal allowlisted category descriptors from reviewed data. The structured output is the model-provider object in API_CONTRACTS. Numeric confidence is not trusted or required; explicit matched/ambiguous/unsupported plus deterministic validation controls the outcome.

A matched decision requires exactly one allowed active category ID and no candidates. Ambiguous requires 2–4 unique allowed IDs and no selected ID. Unsupported has no IDs. Any other form is invalid. Even a valid match must retrieve complete approved evidence before success.

## Grounding and retrieval

The model is not shown or asked to restate disposal rules. Canonical relational lookup supplies authored instructions and provenance after classification. With 15–25 categories, deterministic key/alias retrieval is clearer, cheaper, and more testable than embeddings/vector search. Semantic retrieval is prohibited unless later evaluation demonstrates a specific unsolved need.

## UX

Users see a structured public-service result, not model prose or chat bubbles. Ambiguity becomes a small set of buttons. Unsupported and failures become explicit abstention/error states. The trust note explains that government sources define rules and AI may only interpret the item.

## Model selection gate

No provider/model is selected in Stage 1. Compare candidates on structured-output validity, category accuracy, critical abstention, latency, availability, cost per lookup, data-retention terms, and server/Vercel compatibility. The chosen version must be pinned/configured, documented, and replaceable behind one adapter. Training/fine-tuning is out of scope.

## Failure behavior

| Failure | Required behavior |
|---|---|
| Provider unavailable/timeout/refusal | Use a complete deterministic result if available; otherwise unsupported/temporary error |
| Malformed schema | Reject fully; never salvage prose |
| Non-allowlisted/inactive ID | Reject and abstain |
| Ambiguity remains | Clarification state |
| Model emits disposal advice | Ignore/reject all extra fields |
| Missing authoritative evidence | Abstain even if classification is valid |
| Prompt injection/override attempt | Treat as item input; classification only or unsupported |

## Security

User input and category/source text are untrusted. Fixed system instructions, closed schemas, least privilege, no tools, no arbitrary retrieval, output allowlisting, length limits, timeouts, and safe encoding reduce direct/indirect prompt injection. The provider gets no database credential, service-role key, hidden source repository, user identity, or write capability. Do not log full prompts/responses by default.

## Evaluation, cost, and latency

Measure exact/synonym/colloquial/misspelling accuracy, ambiguity and unsupported handling, critical hazardous abstention, schema failures, injection resistance, latency distribution, token counts, estimated cost, and provider error rate. Normal CI uses recorded/mock outputs. A controlled live suite runs only for model changes/release approval.

Release gates are in EVALUATION_PLAN: 0 unsupported claims, 100% critical safe handling, 100% citation association, and a justified improvement over the deterministic baseline. If the gate fails, V1 ships deterministic-only.

## Known limitations

Classification is limited to English V1 wording and frozen categories; ordinary terms may remain ambiguous; model behavior can drift; provider outages/latency exist; model confidence is not calibrated authority; current official data may still change between manual reviews. Human authorities remain responsible for unusual, chemical, hazardous, eligibility, and facility-specific questions.
