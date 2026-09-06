# Requirements

IDs are stable after Stage 1. Change meaning through review; do not reuse or casually renumber an ID.

## Functional requirements

| ID | Requirement | Priority | Dependencies | Verification |
|---|---|---:|---|---|
| FR-001 | A resident can enter one ordinary-language household item description and submit it without choosing a category. | Must | None | E2E and usability test |
| FR-002 | The system trims/normalizes input, accepts 1–200 meaningful characters, and rejects empty, control-character-only, or over-limit input with a plain recoverable error. | Must | FR-001 | Unit, API, E2E |
| FR-003 | The system attempts deterministic exact/normalized alias matching before any model call and returns only an active canonical category or ambiguity. | Must | FR-002, source dataset | Unit, integration, evaluation |
| FR-004 | If enabled by an approved evaluation gate, AI may classify only against active allowed category IDs and must return validated structured output; invalid or uncertain output cannot select a category. | Conditional | FR-003, approved ADR/evaluation | Adapter tests and AI evaluation |
| FR-005 | A successful lookup retrieves disposal guidance only from the stored active canonical category and its reviewed authoritative evidence. | Must | Source dataset, database | Integration and provenance test |
| FR-006 | A success response shows the identified category, what to do, important requirements, supported where/program information, and official source as distinct readable sections. | Must | FR-005 | Component, E2E, user test |
| FR-007 | Every displayed factual instruction exposes organization, source title, official URL, and project verification date, with evidence traceable in stored data. | Must | FR-005 | Data, integration, E2E |
| FR-008 | When multiple categories remain materially plausible, the system asks one concise clarification using a small set of plain-language choices and includes an “I’m not sure” path. | Must | FR-003/004 | Unit, E2E, user test |
| FR-009 | Unsupported, irrelevant, or unresolved input produces an explicit unsupported/uncertain state and an approved official fallback link; it produces no disposal instruction. | Must | FR-002/003/004 | Unit, E2E, safety evaluation |
| FR-010 | Missing evidence, database failure, timeout, unavailable model, or malformed model output safely falls back to a deterministic answer when already supported, otherwise to a retryable generic error or abstention without invented guidance. | Must | FR-005 | Integration and failure tests |
| FR-011 | A resident can correct an input or start another lookup without account state, history, or page reload dependency. | Must | FR-001 | E2E and usability test |
| FR-012 | The result experience states in plain language that disposal rules come from official sources and that AI, if used, only helps interpret the item. | Must | FR-006 | Content and E2E check |
| FR-013 | Each source has retrieval/verification metadata and review status; expired, failed, or unreviewed evidence is excluded from supported production answers. | Must | Source workflow | Data constraints and integration test |

## Nonfunctional requirements

| ID | Requirement | Priority | Dependencies | Verification |
|---|---|---:|---|---|
| NFR-001 | V1 remains Oʻahu residential household disposal with 15–25 evidence-supported categories and the exclusions in SCOPE. | Must | Source discovery | Scope review and release audit |
| NFR-002 | All important disposal claims are supported by reviewed primary-government evidence; model knowledge, snippets, blogs, and commercial pages are not authority. | Must | FR-005/007/013 | Provenance audit |
| NFR-003 | Safety gates achieve 100% correct citation association and 0 unsupported disposal claims in the release regression set; critical hazardous/unsupported cases abstain correctly at 100%. | Must | Dataset and evaluation set | Automated evaluation plus review |
| NFR-004 | The core flow conforms to WCAG 2.2 AA where applicable: semantic structure, associated labels, keyboard completion, visible focus, status announcements, non-color errors, contrast, meaningful links, and 200% zoom. | Must | UI | Automated and manual accessibility checks |
| NFR-005 | The interface uses plain language, one obvious task, no critical icon-only action, no hover-only behavior, and primary controls at least 44 by 44 CSS pixels. | Must | UI | Design review and user test |
| NFR-006 | The UI works from 320 CSS pixels wide through desktop without horizontal page scrolling; content remains a moderate single reading column. | Must | UI | Responsive E2E checks |
| NFR-007 | Under representative production conditions, deterministic lookups target p95 ≤1.5 s and any AI-assisted path p95 ≤5 s, measured separately; timeouts degrade safely. | Should | Deployment and observability | Load sample and production metrics |
| NFR-008 | Private model keys and elevated Supabase credentials never enter browser bundles/logs; database grants and RLS enforce public read-only data and deny anonymous writes. | Must | Server/database | Secret scan, bundle review, database tests |
| NFR-009 | The service intentionally collects no accounts, location, or sensitive personal data; logs minimize/raw-input retention and follow SECURITY. | Must | Logging | Privacy/log review |
| NFR-010 | A database or model failure never converts uncertainty into an authoritative-looking instruction, and the primary flow has documented timeout/error behavior. | Must | FR-010 | Failure injection |
| NFR-011 | A failed request is diagnosable from timestamp, operation, safe correlation ID, route/outcome, dependency used, duration, validation result, and sanitized error class without secrets or unnecessary raw input. | Must | Observability | Log contract test and incident drill |
| NFR-012 | Normal CI is deterministic and uses no paid live-model calls; required lint/type/unit/integration/database/accessibility/E2E checks and frozen regression evaluations gate release as implemented. | Must | Test setup | CI evidence |
| NFR-013 | Every implementation change traces from a BL ID to requirement and AC IDs, tests, PR evidence, and Definition of Done; architecture deviations require an ADR. | Must | Workflow | PR/release audit |
| NFR-014 | The deployable topology remains GitHub → Vercel application → controlled server boundary → Supabase PostgreSQL, with optional server-side model provider and environment-separated secrets. | Must | Platform setup | Architecture and deployment review |

## Threshold rationale

Zero unsupported claims and perfect citation association are release gates because a fluent wrong instruction is the critical harm. The latency targets keep a one-step lookup feeling immediate while allowing a bounded external call. WCAG 2.2 AA and 44-pixel targets are broadly recognized, testable baselines. Comparative UX thresholds are defined and justified in EVALUATION_PLAN; they are pilot decision rules rather than population-level claims.
