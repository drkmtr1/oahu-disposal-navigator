# Architecture

## Selected shape

One Next.js TypeScript application will provide the web UI and same-origin server routes on Vercel. Supabase PostgreSQL will hold curated reference data. The browser never chooses disposal rules and never receives privileged credentials. An optional model-provider call exists only behind the server boundary after deterministic matching and an evaluation/ADR gate.

~~~mermaid
flowchart LR
    U[Resident browser] -->|HTTPS, item text| V[Vercel Next.js application]
    subgraph S[Controlled server boundary]
      X[Validate and normalize]
      D[Deterministic classifier]
      A[Optional bounded AI adapter]
      R[Response assembler and provenance validator]
    end
    V --> X --> D
    D -->|one match| DB[(Supabase PostgreSQL)]
    D -->|no exact match and gate enabled| A
    A -->|validated allowlisted category| DB
    DB --> R --> V
    A -. structured request/response .-> M[Model provider]
    DB --> P[Curated categories, guidance, sources, evidence, freshness]
~~~

## Responsibilities

- **Browser/frontend:** semantic input and four states; client-side convenience validation; accessible status/focus; no authoritative decisions; no private keys.
- **Vercel application:** HTTPS hosting, same-origin route execution, server environment variables, request limits, normalization, orchestration, response validation, structured logs, preview/production separation.
- **Server boundary:** `POST /api/disposal-options` repeats all validation, runs deterministic exact-alias matching through the read projection, validates untrusted canonical records/provenance, and assembles discriminated responses. A later approved task may add the optional model path after deterministic matching.
- **Supabase/PostgreSQL:** relational categories, aliases, authored guidance, sources, evidence, verification history, constraints, indexes, grants, RLS, migrations, and reference seed data.
- **Model provider:** optional untrusted classifier. It receives bounded input and allowed category descriptors, not authority to write guidance or access tools/database.
- **Source process:** a human reviews primary-government pages, records evidence/freshness, and approves data before production use.

## Data and provenance flow

~~~mermaid
sequenceDiagram
    participant B as Browser
    participant S as Server route
    participant C as Classifier
    participant DB as Supabase
    participant M as Optional model
    B->>S: Item description
    S->>S: Validate and normalize
    S->>C: Normalized input
    C-->>S: Match, ambiguous, or none
    opt No deterministic match and AI approved
      S->>M: Input plus allowed categories
      M-->>S: Structured classification only
      S->>S: Schema and allowlist validation
    end
    S->>DB: Canonical category lookup
    DB-->>S: Guidance plus evidence and freshness
    S->>S: Completeness/freshness validation
    S-->>B: Success, ambiguous, unsupported, or error
~~~

A success response is impossible unless the category, guidance, source, evidence, and current review state join successfully. The model cannot populate guidance fields.

## Trust and validation boundaries

Browser input, model output, source content, database data, and provider responses are untrusted at their boundaries. Validate length/characters on server; validate database result shape and review state; validate model output against a closed schema/allowlist; render text with framework escaping; allow only approved HTTPS official URLs; log sanitized reason codes rather than arbitrary content.

The Vercel runtime holds server-only environment variables. ADR-010 selects a Supabase publishable key operating as `anon` for the normal lookup path. BL-005 uses native server-side HTTP with that key in the `apikey` header; there is no browser credential or service-role path. Curated base tables remain in the non-exposed `private` schema; one `security_invoker` view in the dedicated `api` schema supplies the complete active, approved, fresh category → alias → guidance → evidence → source projection. The caller receives only explicit SELECT grants, underlying RLS remains effective, and anonymous/authenticated writes are denied. If a future maintenance job requires an elevated key, it must be isolated and separately approved because it bypasses RLS.

## Failure paths

- Validation failure: local field error, no dependency call.
- Database unavailable/timeout: generic retryable state, safe log event.
- Missing, stale, or incomplete evidence: unsupported/evidence-unavailable state.
- Model unavailable/timeout/invalid: deterministic fallback or abstention.
- Multiple categories: explicit clarification.
- Unexpected server failure: generic error and correlation ID, no internal details.

## Significant choices

| Choice | Rationale | Alternatives | Tradeoff |
|---|---|---|---|
| Next.js + TypeScript in one app | One framework covers accessible UI and server routes and fits Vercel | Static SPA plus separate API; other full-stack frameworks | Framework conventions add weight, but avoid a second service |
| Same-origin internal POST route | Hides orchestration, centralizes validation and secrets, gives a stable contract | Direct browser-to-Supabase; public API | Adds one server hop |
| Supabase relational data | Fixed constraint and a natural fit for small curated structured data | Files only; document/vector store | Requires migrations/access design, but gives constraints and provenance joins |
| Declarative schema plus generated migrations | Reviewable desired state and versioned changes for a new project | Imperative-only migrations | Requires disciplined schema/diff workflow |
| No V1 auth | No user-specific data or account need | Supabase Auth | Public read access needs careful grants/RLS, but avoids friction |
| Deterministic-first classification | Cheap, testable, safe, and sufficient for exact aliases | LLM-first | Some natural-language inputs abstain until AI is justified |
| No vector database | Corpus is small and keyed by canonical category | Embeddings/RAG | Less semantic flexibility, much lower complexity/risk |
| Non-chat single-column UI | Matches one lookup task and broad usability | Chat or dashboard | Less flexible conversation, clearer task completion |

## Deliberately absent

Microservices, agents, queues, a separate backend host, Kubernetes, Supabase Auth/Realtime/Storage/Edge Functions/Vector, arbitrary web retrieval, direct browser privileged access, and extra observability vendors have no V1 requirement.

## Deployment boundaries

GitHub is source control; Vercel hosts Local/Preview/Production application environments; Supabase uses local/test and separate production data environments; model credentials, if any, are environment scoped. Database migration and application release are separately verifiable and roll forward. No environment/resource is created in Stage 1.
