# Original Project Mandate

This document contains the original engineering mandate for the Oʻahu Household Item Disposal Navigator.

It is preserved as historical project context.

After Stage 1, `AGENTS.md` and the approved documents under `/docs` become the authoritative guidance for implementation. If this original mandate conflicts with a later approved requirement or architecture decision, the newer approved project documentation takes precedence.

# Oʻahu Household Item Disposal Navigator

## Professional Portfolio Project — Stage 1 Engineering Foundation

You are helping me build the **Oʻahu Household Item Disposal Navigator** as a professional, employer-facing public-interest AI engineering portfolio project.

This is not a one-shot “build me an app” request.

I will rely heavily on Codex for implementation, so the repository must demonstrate that I can exercise sound engineering judgment around:

* problem definition,
* requirements,
* scope control,
* architecture,
* authoritative data,
* provenance,
* AI system design,
* evaluation,
* testing,
* security,
* reliability,
* observability,
* accessibility,
* UX design,
* deployment,
* Git workflow,
* operations,
* and responsible use of coding agents.

The code matters, but the engineering system around the code matters equally.

---

# 1. PROJECT CONTEXT

## Working title

**Oʻahu Household Item Disposal Navigator**

## Level

**Level 1 public-interest AI engineering project**

The project should remain deliberately small, understandable, measurable, and finishable by one person.

Do not increase technical sophistication merely to make the portfolio appear more impressive.

---

# 2. PUBLIC-INTEREST PURPOSE

The application addresses this resident question:

> “I have this household item on Oʻahu. How am I supposed to get rid of it?”

Official disposal information exists, primarily through the City and County of Honolulu Department of Environmental Services, but residents may need to identify the correct waste category, locate the relevant program or facility, understand restrictions, and interpret government terminology.

The application should reduce that information-retrieval and interpretation burden.

It must not become a general waste-management chatbot.

---

# 3. TARGET USER

An Oʻahu resident trying to determine how to properly dispose of a common household item.

The product should be usable by a broad cross-section of residents, including people with different:

* ages,
* levels of technical familiarity,
* device preferences,
* reading abilities,
* familiarity with government websites.

The interface should be simple enough that someone with limited comfort using modern web applications can use it successfully, while still feeling contemporary and efficient to younger and more technically experienced users.

Do **not** position or visually design the application specifically as a product “for elderly users.”

Instead, apply broadly beneficial usability and accessibility principles that reduce barriers for everyone.

Examples of supported categories might eventually include:

* mattresses,
* furniture,
* appliances,
* batteries,
* paint,
* propane cylinders,
* gasoline,
* tires,
* electronics,
* scrap metal,
* green waste,
* and other deliberately selected V1 household disposal categories.

Do **not** assume all of these categories belong in V1 until the source-discovery and data-foundation work supports them.

---

# 4. USER GOAL

The user should be able to describe a supported household item in ordinary language and receive:

1. the recognized disposal category,
2. an appropriate disposal method based on authoritative information,
3. important restrictions or preparation instructions,
4. relevant facility or program information where supported,
5. the authoritative source supporting the answer,
6. sufficient provenance to independently inspect the source,
7. and an explicit uncertainty or escalation response when the system cannot safely answer.

The interaction should require as little explanation or technical knowledge as practical.

A first-time user should generally understand what to do without needing instructions.

---

# 5. PROBLEM STATEMENT

Authoritative disposal guidance exists, but residents may need to navigate multiple government pages and translate an everyday object into official waste categories, programs, facilities, and restrictions.

The V1 intervention is intentionally narrow:

> Help an Oʻahu resident correctly determine how to dispose of a bounded set of common household items using current authoritative government guidance.

Do not claim that this application will solve illegal dumping, waste-management capacity, environmental policy, or other systemic waste problems.

Those are outside the project's evidence and scope.

---

# 6. AUTHORITATIVE SOURCE PRINCIPLE

For Version 1, authoritative information should come primarily from official City and County of Honolulu sources, especially the Department of Environmental Services.

Additional State of Hawaiʻi or other primary government sources may be used only when a selected V1 category genuinely requires them.

Authoritative sources must be preserved.

AI output is never the source of truth.

Important factual disposal instructions must be traceable to stored provenance such as:

* source URL,
* source organization,
* source title,
* supporting passage or evidence,
* source publication/update information when available,
* date the source was last verified by the project.

Do not silently substitute blogs, search-engine summaries, commercial disposal sites, Reddit, or model knowledge for authoritative evidence.

Non-authoritative sources may eventually help with discovery or user research, but they must not become the factual basis for disposal instructions.

---

# 7. RESPONSIBLE AI BOUNDARY

The architecture should prefer:

**User
→ deterministic logic
→ bounded AI classification if needed
→ canonical disposal category
→ authoritative stored evidence
→ grounded explanation
→ validation
→ citations/provenance
→ user**

Do **not** design:

**User
→ unrestricted LLM
→ disposal advice**

## AI may assist with

* interpreting ordinary-language item descriptions,
* mapping ambiguous natural language to a known canonical category,
* explaining authoritative instructions in plain language,
* summarizing retrieved authoritative evidence,
* producing structured classification output.

## Deterministic software should handle where practical

* exact aliases,
* canonical category identifiers,
* database lookup,
* disposal-rule retrieval,
* source/provenance retrieval,
* supported/unsupported-category checks,
* validation,
* response assembly,
* citation linking,
* input limits,
* error handling,
* access control if ever required.

## AI must NOT

* invent disposal procedures,
* infer unsupported government rules,
* declare unknown chemicals safe,
* identify hazardous substances without adequate evidence,
* override official instructions,
* claim an unsupported item is accepted by a facility,
* silently resolve materially ambiguous cases,
* treat model training knowledge as authoritative evidence,
* make consequential governmental decisions,
* hide uncertainty,
* provide unsupported instructions merely to avoid saying “I don't know.”

When evidence is insufficient, the correct system behavior should be some form of:

> “I can't determine the correct disposal method from the information available.”

followed by the appropriate authoritative contact or source when documented.

Abstention is a feature, not a failure.

---

# 8. HUMAN RESPONSIBILITY

The resident remains responsible for confirming that their actual item matches the supported category and following official instructions.

The City and County of Honolulu and other relevant authorities remain authoritative for:

* unusual items,
* unknown substances,
* hazardous-material questions,
* unclear eligibility,
* conflicting instructions,
* facility-specific questions not supported by project data.

AI assists with information access and explanation.

AI does not replace the responsible authority.

---

# 9. UX AND INTERFACE PRINCIPLES

The V1 interface should feel like a **trustworthy public-service lookup tool**, not an AI chatbot.

The interface should optimize for:

* minimal interaction cost,
* minimal cognitive load,
* immediate comprehension,
* broad usability across age groups,
* mobile usability,
* accessibility,
* clarity,
* trust,
* source transparency.

The user should not need to understand how AI works to use the application.

The core interaction should be extremely simple:

1. user describes an item,
2. user submits,
3. system returns a structured disposal result.

Avoid unnecessary onboarding, configuration, menus, settings, or multi-step flows.

## Primary interface concept

The opening screen should prominently present:

**Oʻahu Disposal Navigator**

With concise supporting language similar to:

> Find the proper way to dispose of common household items on Oʻahu.

Then:

**What do you need to get rid of?**

A large, clear input field with examples such as:

> old mattress, propane tank, broken TV

Then one prominent action:

**Find disposal options**

Do not require a user to select a category before typing.

Do not require account creation.

Do not require location permission.

Do not require the user to understand government waste terminology.

---

# 10. LOW-BARRIER UX REQUIREMENT

Reducing the barrier to use is a core V1 product requirement.

The interface should accommodate users who may:

* use the internet infrequently,
* be unfamiliar with modern app conventions,
* have reduced vision or dexterity,
* be using a phone rather than a desktop computer,
* be uncertain which government term describes their item.

However, the application should remain designed for the general population rather than being branded or visually characterized as an elderly-focused product.

Apply universal usability principles.

Prefer:

* one obvious primary task per screen,
* plain language,
* generous text sizing,
* large touch targets,
* clear labels,
* visible buttons,
* strong contrast,
* predictable navigation,
* limited choices,
* minimal scrolling where practical,
* concise instructions,
* immediate feedback,
* forgiving input,
* clear recovery from mistakes.

Avoid:

* tiny text,
* icon-only controls for critical actions,
* hidden hover interactions,
* dense dashboards,
* complicated navigation,
* jargon,
* unclear button labels,
* unnecessary modal dialogs,
* excessive animation,
* auto-advancing interactions,
* required gestures,
* long forms,
* deeply nested pages,
* UI patterns that assume high technical literacy.

---

# 11. ACCESSIBILITY

Accessibility should be treated as a normal quality requirement rather than a specialty feature.

Stage 1 should define appropriate accessibility requirements based on modern web standards, including WCAG considerations where reasonable for V1.

At minimum, design for:

* keyboard navigation,
* visible focus states,
* sufficient contrast,
* semantic HTML,
* programmatically associated labels,
* screen-reader-compatible status updates,
* meaningful link text,
* adequate touch-target sizing,
* scalable text,
* responsive layout,
* error messages that do not rely solely on color,
* support for browser zoom,
* readable line lengths,
* plain language.

Do not over-engineer accessibility infrastructure.

Prefer correct semantic web implementation.

---

# 12. UI VISUAL DIRECTION

The application should feel:

* clean,
* civic,
* calm,
* contemporary,
* trustworthy,
* approachable,
* lightweight.

A useful design reference is conceptually:

**modern public-service interface + high-quality contemporary web application**

rather than:

**ChatGPT clone + AI dashboard**

Avoid presenting conversational chat bubbles as the primary V1 interaction.

Avoid a persistent chatbot sidebar.

Avoid dashboards.

Avoid visual clutter.

Avoid “AI magic” branding.

The fact that AI may be involved should not dominate the interface.

The value proposition is:

**finding trustworthy disposal guidance easily.**

---

# 13. HAWAIʻI VISUAL IDENTITY

The visual design may have subtle Hawaiʻi or Oʻahu identity, but it should not look tourist-oriented.

Avoid unnecessary:

* palm-tree imagery,
* tropical gradients,
* hibiscus decoration,
* beach imagery,
* resort aesthetics,
* stereotypical island motifs.

If local visual identity is used, keep it understated and appropriate to a civic information utility.

Usability and trust should dominate visual styling.

---

# 14. V1 SCREEN STATES

The Stage 1 UX documentation should define at least the following four major interface states.

## State 1 — Initial

Show:

* project name,
* concise purpose,
* single item-description input,
* example input,
* primary submission action.

Example conceptual structure:

```text
Oʻahu Disposal Navigator

Find the proper way to dispose of common
household items on Oʻahu.

What do you need to get rid of?

[ old mattress                         ]

[ Find disposal options ]
```

---

## State 2 — Successful result

Results should be structured rather than presented as a long AI-generated paragraph.

Prefer a result hierarchy similar to:

### Item identified as

Canonical category.

### What to do

Concise authoritative disposal method.

### Important requirements

Bullets containing relevant preparation, limits, restrictions, or warnings.

### Where

Relevant facility/program information when supported.

### Official source

* authority,
* source title,
* source verification information,
* link to official guidance.

Example conceptual structure:

```text
Propane Cylinder

✓ Disposal guidance found

What to do
[clear instructions]

Important requirements
• ...
• ...

Where
[relevant facility or program]

Official source
City & County of Honolulu
Department of Environmental Services

Verified: [date]

[ View official guidance ]
```

The official source must be visually meaningful.

Do not hide provenance behind a tiny citation icon.

---

## State 3 — Ambiguous input

When the system cannot distinguish between reasonable categories, do not guess.

Example:

User enters:

> old tank

Possible interface:

```text
I need a little more information.

What kind of tank is it?

[ Propane cylinder ]
[ Compressed-gas cylinder ]
[ Water tank ]
[ I'm not sure ]
```

Clarification should use a small number of plain-language choices.

Avoid open-ended conversational back-and-forth when a simple deterministic clarification interface will work.

---

## State 4 — Unsupported or uncertain

If the system cannot confidently produce a supported answer:

```text
I couldn't reliably identify a disposal method.

This item isn't currently covered by the navigator.

You can check the official City disposal guidance below.

[ View official disposal guidance ]
```

The system must not hallucinate merely to provide an answer.

---

# 15. TRUST COMMUNICATION

A brief explanation should be available in or near the result experience.

Conceptually:

> Disposal instructions come from official government sources. AI may help interpret what item you entered, but it does not create disposal rules.

This is important because it communicates the project's responsible-AI architecture directly to the user.

Do not overwhelm the user with technical AI terminology.

A portfolio reviewer should nevertheless be able to see that:

**natural-language input
→ classification
→ authoritative data
→ structured response
→ provenance**

is visible in the product behavior.

---

# 16. MOBILE-FIRST PRACTICALITY

Assume a meaningful portion of users will access the application from a phone.

V1 should be responsive and function well on small screens.

Prioritize:

* one-column layout,
* large inputs,
* large primary actions,
* comfortable spacing,
* readable text,
* no horizontal scrolling,
* no hover-dependent behavior,
* simple result cards,
* source links easy to tap.

Desktop may use a centered content column of roughly moderate reading width rather than expanding into a dashboard.

Do not build separate mobile and desktop applications.

---

# 17. UI SCOPE PROTECTION

The following visual/product features are not required for V1 unless a documented usability test demonstrates otherwise:

* maps,
* geolocation,
* animated transitions,
* elaborate illustration systems,
* photo-based item browsing,
* image recognition,
* category carousels,
* chatbot conversation history,
* saved searches,
* personalized recommendations,
* accounts,
* favorites,
* complex navigation,
* dashboard analytics,
* theme customization,
* dark mode as a dedicated project feature.

A visually polished but simple interface is preferable to a feature-rich interface.

---

# 18. VERSION 1 SCOPE

V1 must remain deliberately narrow.

Expected V1 characteristics:

* Oʻahu only.
* Residential household disposal only.
* Approximately 15–25 deliberately selected canonical disposal categories.
* Authoritative government information only for disposal guidance.
* One simple natural-language item-description input.
* One clear primary user journey.
* Deterministic alias/category matching where sufficient.
* Bounded AI interpretation only where it adds measurable value.
* Structured AI output.
* Stored authoritative disposal records.
* Stored source provenance.
* Clear structured disposal response.
* Source links and inspectable evidence.
* Explicit ambiguous/unsupported-item handling.
* Four primary UI states: initial, success, ambiguous, unsupported/error.
* Responsive/mobile-friendly interface.
* Broad accessibility and usability.
* Reproducible deterministic tests.
* Reproducible AI evaluation set.
* Small user test comparing task success and/or completion time against the existing official-information workflow.
* Simple public deployment.

---

# 19. EXPLICIT V1 NON-GOALS

Unless evidence later establishes that one is required to satisfy a documented V1 requirement, the following are out of scope:

* general-purpose chatbot,
* native iOS application,
* native Android application,
* user accounts,
* authentication,
* resident profiles,
* saved history,
* personalization,
* location tracking,
* live GPS,
* route optimization,
* map interface,
* automatic pickup booking,
* reporting illegal dumping,
* autonomous government actions,
* automated emails or phone calls,
* donation marketplace,
* private recycler marketplace,
* commercial waste,
* construction/commercial regulatory guidance,
* every possible household item,
* image recognition,
* computer vision,
* multilingual support,
* autonomous agents,
* multi-agent systems,
* agent orchestration,
* microservices,
* Kubernetes,
* event-driven distributed architecture,
* custom model training,
* model fine-tuning,
* unnecessary vector databases,
* unnecessary embeddings,
* complex RAG infrastructure,
* background workers unless clearly required,
* real-time synchronization unless clearly required,
* complex role-based authorization,
* analytics platforms beyond what V1 needs,
* elaborate design systems.

Do not treat these as implied future requirements.

They are currently excluded.

---

# 20. REQUIRED TECHNOLOGY AND ENGINEERING CONSTRAINTS

The following project-level decisions have already been made.

## Source control

Use:

* **Git** for version control.
* **GitHub** as the remote repository and employer-facing source repository.

The repository should demonstrate a professional workflow involving:

requirement
→ backlog item / GitHub issue
→ branch
→ implementation
→ tests
→ pull request
→ review
→ merge
→ deployment

Do not commit directly to the production branch as the normal development workflow.

Document an appropriate lightweight workflow for a solo developer.

---

## Backend and database

Use:

**Supabase**

Use Supabase only for responsibilities that provide concrete V1 value.

The expected primary V1 use is:

**Supabase PostgreSQL**

for authoritative structured application data such as:

* canonical disposal categories,
* aliases,
* disposal methods,
* restrictions,
* source records,
* evidence/provenance,
* source verification metadata.

Do not add Supabase Auth merely because Supabase provides it.

V1 currently has no user-account requirement.

Do not add:

* Supabase Auth,
* Realtime,
* Storage,
* Edge Functions,
* Vector,
* or other Supabase services

unless a documented requirement establishes a need.

Prefer ordinary PostgreSQL relational modeling over unnecessary complexity.

Database migrations must be version-controlled.

Row Level Security and public/database access strategy must be deliberately documented even if no user authentication exists.

Do not expose elevated Supabase credentials to browser code.

---

## Hosting

Use:

**Vercel**

for the public web application.

Deployment architecture should remain as simple as practical.

Vercel should host the frontend and any minimal server-side application/API functionality justified by the architecture.

Do not introduce a separate server, container platform, cloud VM, Kubernetes cluster, or additional hosting platform unless a documented requirement later makes it necessary.

---

## Production topology target

The expected conceptual V1 topology is approximately:

**Browser**
→ **Vercel-hosted application**
→ **server-side application/API boundary where required**
→ **Supabase PostgreSQL**

and, only where AI functionality genuinely adds value:

**server-side AI request**
→ **model provider**
→ **structured validated result**

Client-side code must not expose private model-provider keys or privileged Supabase credentials.

The exact framework and implementation details should be evaluated during Stage 1 against the existing repository rather than assumed blindly.

---

# 21. OBSERVABILITY SCOPE PROTECTION

V1 needs enough observability to diagnose failures.

It does **not** require an enterprise observability platform unless justified.

Prefer first-party/platform capabilities such as:

* Vercel request/deployment logs,
* Supabase database/platform logs,
* structured application logging,
* safe server-side AI metadata logging,
* simple operational metrics.

Only recommend an additional observability vendor if there is a concrete V1 need that existing platform capabilities cannot reasonably meet.

For AI operations, consider capturing where appropriate:

* model/provider,
* latency,
* success/failure,
* validation outcome,
* token usage,
* estimated inference cost,
* category/classification result,
* fallback path used.

Do not log:

* secrets,
* API keys,
* database service-role keys,
* raw authorization tokens,
* unnecessary personal information,
* full sensitive prompts if they are not necessary for diagnostics.

This application should not intentionally collect sensitive personal information.

---

# 22. DATA-FRESHNESS REQUIREMENT

Government information can change.

Data provenance and freshness are therefore part of the product, not just documentation.

Stage 1 should design a simple method for tracking data such as:

* authoritative source,
* source URL,
* evidence text,
* date retrieved or verified,
* apparent source update date when available,
* affected disposal category,
* review status.

V1 does not require autonomous website monitoring.

A documented manual source-review/update procedure is acceptable and probably preferable at Level 1.

---

# 23. MEASURABLE OUTCOME

The project must measure whether it actually helps.

The primary product question should be similar to:

> Can an Oʻahu resident correctly determine a valid disposal method for a supported household item more reliably and/or faster using this application than using the current official-information workflow alone?

Possible engineering metrics include:

* canonical-category classification accuracy,
* disposal-answer correctness,
* citation/source correctness,
* unsupported-claim rate,
* safe-abstention accuracy,
* task-completion rate,
* task-completion time,
* model latency,
* inference cost.

UX measurements should also consider:

* whether first-time users know what action to take,
* rate of invalid submissions,
* rate of successful recovery from ambiguous input,
* accessibility/usability failures,
* unnecessary interaction steps.

Thresholds must be explicitly defined during Stage 1 and justified rather than copied mechanically from examples.

---

# 24. TWO-STAGE DEVELOPMENT WORKFLOW

This project must use two distinct stages.

# STAGE 1 — PROJECT FOUNDATION

Do not begin application implementation during Stage 1.

Your first responsibility is to inspect the repository, understand what already exists, reconcile it with the project definition above, and build the engineering/documentation foundation that will control later implementation.

The objective is to make the project:

* clearly scoped,
* architecturally understandable,
* testable,
* secure,
* observable,
* accessible,
* usable,
* deployable,
* maintainable,
* resistant to scope creep,
* suitable for employer portfolio review,
* and appropriate as a Level 1 public-interest AI engineering project.

Once Stage 1 is complete:

**STOP.**

Do not automatically begin implementing application functionality.

Instead, recommend the first small bounded Stage 2 implementation task.

---

# STAGE 2 — CONTROLLED IMPLEMENTATION

Stage 2 occurs only after Stage 1 has been reviewed.

Future Codex sessions must not receive or act upon broad instructions such as:

> “Build the app.”

Implementation must proceed through small backlog items tied to requirements, acceptance criteria, architecture, and tests.

For every Stage 2 task:

1. Read `AGENTS.md`.
2. Read documentation relevant to the task.
3. Identify the requirement IDs being implemented.
4. Identify applicable acceptance criteria.
5. Inspect the existing implementation before changing it.
6. Implement only the requested scope.
7. Avoid unrelated refactoring.
8. Do not silently add architecture.
9. Do not silently add features.
10. Do not silently add abstractions.
11. Do not add dependencies without justification.
12. Add or update relevant tests.
13. Run the relevant test suite.
14. Verify the acceptance criteria.
15. Review relevant accessibility, security, and failure behavior.
16. Update documentation when implementation changes documented behavior.
17. Report exactly what changed.
18. Report tests executed and results.
19. Report unresolved risks or assumptions.
20. Recommend the next smallest logical task.
21. Do not automatically implement that next task.

Continue incrementally until the documented Version 1 Definition of Done is satisfied.

---

# 25. ENGINEERING PRINCIPLES

## Product and scope

* Solve the documented resident problem before adding features.
* Prefer the smallest viable intervention.
* Keep V1 deliberately small.
* Explicitly maintain non-goals.
* Do not silently expand scope.
* Attractive features are not automatically justified.
* Every feature must map to a requirement, acceptance criterion, defect, or documented technical necessity.

If a feature proposal arises, classify it as:

* Required for V1
* Useful but defer
* Future-level capability
* Unnecessary

---

## UX

* Optimize for successful task completion rather than visual novelty.
* Minimize the number of decisions required from the user.
* Prefer recognition over recall.
* Prefer visible choices over hidden interactions.
* Use plain language.
* Make errors recoverable.
* Do not make users learn the system's internal category vocabulary.
* Keep the primary task obvious.
* Treat broad age usability as a design-quality issue, not a special mode.
* Do not introduce complexity solely to make the UI look more sophisticated.

---

## Architecture

* Prefer the simplest architecture satisfying the requirements.
* Prefer deterministic software around bounded model reasoning.
* Avoid unnecessary frameworks and services.
* Avoid unnecessary abstractions.
* Avoid microservices.
* Optimize for a solo developer who must understand and maintain the entire system.
* Prefer boring and understandable technology.
* Document major architectural decisions.
* Do not redesign working architecture because another approach is fashionable.

---

## Requirements

* Define acceptance criteria before implementation.
* Separate functional and nonfunctional requirements.
* Requirements must be testable.
* Requirements must be unambiguous.
* Assign stable IDs.

Use:

`FR-001` — functional requirement
`NFR-001` — nonfunctional requirement

Never casually renumber requirements after implementation starts.

---

## Data

* Design the data model before database-dependent implementation.
* Preserve authoritative-source provenance.
* Define validation rules.
* Define relationships.
* Define ownership.
* Define lifecycle/update expectations.
* Avoid duplication.
* Use migrations.
* Prefer relational design where relational design is sufficient.

---

## APIs

Define contracts before or alongside API implementation.

Document:

* endpoint,
* method,
* purpose,
* authentication,
* authorization,
* request,
* response,
* validation,
* errors,
* timeouts,
* retries,
* pagination where applicable,
* idempotency where applicable.

Do not add API layers that serve no architectural purpose.

---

## AI systems

Do not add AI merely for portfolio optics.

Before using an LLM, establish that deterministic logic does not sufficiently solve the behavior.

Where AI is used:

* define its exact bounded responsibility,
* use structured output when application behavior depends upon it,
* validate outputs before use,
* prevent the model from becoming the authoritative source,
* define fallback behavior,
* define model failure behavior,
* define invalid-output behavior,
* define ambiguity behavior,
* define model-selection criteria,
* consider latency,
* consider token use,
* consider inference cost.

Prompts and model outputs are testable software components.

---

## Retrieval

Do not automatically introduce embeddings or a vector database.

The V1 authoritative corpus is intentionally small and structured.

Prefer deterministic database retrieval by canonical category.

Use semantic/vector retrieval only if evaluation later demonstrates that simpler approaches are insufficient.

---

## Evaluation

AI behavior must be evaluated rather than judged through demo impressions.

Create representative cases including:

* ordinary inputs,
* alternate wording,
* synonyms,
* spelling errors,
* ambiguous items,
* unsupported items,
* hazardous ambiguity,
* adversarial instructions,
* attempts to override system behavior,
* missing source data,
* model malformed output,
* conflicting evidence if encountered.

Maintain regression evaluations as AI behavior evolves.

---

## Testing

Use an appropriate combination of:

* unit tests,
* integration tests,
* API tests,
* database tests,
* end-to-end tests,
* validation tests,
* accessibility tests,
* security-relevant tests,
* regression tests,
* AI evaluations.

Do not create test categories solely for appearance.

Each test layer must have a clear purpose.

Never remove or weaken a legitimate test simply to make CI pass.

---

## Security

Treat as first-class concerns:

* least privilege,
* secrets management,
* environment variables,
* input validation,
* output encoding,
* dependency risk,
* data exposure,
* secure logging,
* privacy,
* error handling,
* database permissions,
* Supabase RLS/access policies,
* model-provider key security,
* abuse/rate considerations.

No privileged database credential or model API key may be exposed to client-side code.

For AI behavior consider:

* direct prompt injection,
* indirect prompt injection,
* malicious source text,
* attempts to override system rules,
* malformed structured output,
* excessive permissions,
* unintended data disclosure.

Because the authoritative corpus is controlled and curated, design to keep retrieved source material bounded rather than allowing arbitrary internet content into prompts.

---

## Reliability

Design failure behavior for:

* invalid input,
* empty input,
* excessively long input,
* unsupported item,
* ambiguous item,
* database failure,
* Supabase timeout,
* model-provider timeout,
* malformed model output,
* model refusal/error,
* absent authoritative evidence,
* partial failure,
* duplicate request where relevant,
* degraded service.

Prefer safe degradation.

A deterministic answer using authoritative data may be preferable to failing completely when an LLM is unavailable.

---

## Observability

A failed user request should be diagnosable.

At minimum, it should be possible to determine:

* when the failure occurred,
* which application operation failed,
* whether Supabase was involved,
* whether the AI provider was involved,
* relevant latency,
* high-level failure class,
* validation result,
* safe request/correlation identifier where appropriate.

Do not overbuild telemetry.

---

## Deployment

The project should eventually provide a reproducible path:

development
→ tests
→ GitHub
→ Vercel deployment
→ production verification

Document:

* environment configuration,
* Supabase migrations,
* secrets,
* preview deployments,
* production deployment,
* HTTPS,
* database backup/recovery considerations,
* rollback strategy,
* health verification,
* post-deployment checks.

Use Vercel preview deployments where they provide useful PR validation without adding unnecessary process.

---

# 26. GIT AND GITHUB WORKFLOW

Treat Git history as part of the portfolio evidence.

Design a professional but lightweight solo-development workflow.

Expected general pattern:

1. Requirement/backlog item exists.
2. Create a GitHub issue if appropriate.
3. Create a focused branch.
4. Implement one bounded change.
5. Add/update tests.
6. Run checks locally.
7. Commit coherent changes.
8. Push branch to GitHub.
9. Open a pull request.
10. Verify CI.
11. Review the diff and acceptance criteria.
12. Merge.
13. Deploy/verify when appropriate.

Document:

* branch naming,
* commit conventions,
* PR expectations,
* issue/backlog traceability,
* required checks,
* merge method,
* tagging/releases,
* Version 1 release strategy.

Do not introduce heavy enterprise process that creates ceremony without learning value.

---

# 27. STAGE 1 TASK

Begin by inspecting the existing repository.

Do **not** assume it is empty.

Before creating documentation:

1. Inspect the complete current file/directory structure.
2. Inspect existing documentation.
3. Identify application code.
4. Identify configuration.
5. Identify package/dependency files.
6. Identify existing tests.
7. Identify schemas/migrations.
8. Identify Vercel configuration if present.
9. Identify Supabase configuration if present.
10. Identify Git/GitHub configuration where inspectable.
11. Preserve valid existing work.
12. Identify contradictions with this project definition.
13. Reconcile existing information rather than blindly overwriting it.
14. Identify important missing project information.
15. Make conservative assumptions only where needed.
16. Label assumptions explicitly.
17. Do not invent requirements that expand the project.

During Stage 1, creating and editing documentation, repository metadata, and appropriate planning/configuration documentation is allowed.

Do **not** implement application features.

Do **not** build the database schema yet unless an existing project structure makes schema-as-documentation necessary. The data model and migration plan should be designed in Stage 1; actual implementation belongs to Stage 2.

Do **not** deploy the application during Stage 1.

Do **not** create external production resources merely because they will eventually be needed.

---

# 28. REQUIRED STAGE 1 DOCUMENTATION

Create `/docs` unless an equivalent professional structure already exists.

Generate or reconcile the following.

---

## 28.1 `docs/PROJECT_OVERVIEW.md`

Include:

* project name,
* public-interest purpose,
* problem statement,
* target user,
* user need,
* current workaround,
* value proposition,
* Level 1 rationale,
* Version 1 objective,
* definition of project success,
* major assumptions,
* constraints,
* authoritative-source principle,
* usability/accessibility objective,
* portfolio/learning objective,
* current status.

Clearly distinguish evidence from assumptions.

---

## 28.2 `docs/SCOPE.md`

Include:

* V1 scope,
* in-scope functionality,
* explicit non-goals,
* deferred functionality,
* future ideas,
* scope boundaries,
* scope-creep rules,
* legitimate scope-change criteria.

Use the classifications:

* Required for V1
* Useful but defer
* Future-level capability
* Unnecessary

Preserve the narrow project scope described in this prompt.

---

## 28.3 `docs/REQUIREMENTS.md`

Create stable requirements.

Use:

* `FR-###`
* `NFR-###`

Each requirement should contain:

* ID,
* description,
* rationale where useful,
* priority,
* dependencies,
* verification/testability notes.

Include only requirements justified by the V1 problem and platform constraints.

Areas that may require requirements include:

* item input,
* one-step primary interaction,
* supported-category classification,
* canonical-category lookup,
* authoritative disposal information,
* provenance,
* ambiguity handling,
* unsupported-item handling,
* AI structured output,
* AI failure fallback,
* source freshness metadata,
* input validation,
* responsive behavior,
* accessibility,
* readability,
* touch-target sizing,
* keyboard support,
* plain-language output,
* Supabase data access,
* Vercel deployment,
* performance,
* security,
* logging,
* evaluation.

Do not automatically create requirements for excluded functionality.

---

## 28.4 `docs/USER_FLOWS.md`

Document:

* primary entry point,
* initial search,
* successful supported-item flow,
* exact/deterministic match,
* AI-assisted classification where necessary,
* ambiguous input,
* clarification selection,
* unsupported item,
* missing authoritative evidence,
* model failure,
* database failure,
* empty input,
* invalid input,
* retry behavior where appropriate,
* returning to start/searching another item.

Define the four primary UI states:

1. Initial
2. Success
3. Ambiguous
4. Unsupported/error

Use Mermaid diagrams where useful.

Keep the application focused on one primary resident task.

---

## 28.5 `docs/ACCEPTANCE_CRITERIA.md`

Map acceptance criteria directly to requirement IDs.

Prefer Given/When/Then where useful.

Example:

**AC-FR-001-01**

Given a supported household item description,
When the application successfully maps it to a canonical category,
Then the response uses disposal information associated with that canonical category rather than model-generated disposal knowledge.

Also include objectively testable UX/accessibility criteria such as:

* keyboard completion of core flow,
* clear validation errors,
* minimum touch-target expectations,
* readable zoom behavior,
* no critical icon-only action,
* responsive operation at representative mobile widths,
* visible focus indicators,
* source visibility.

Define explicit Version 1 acceptance criteria.

---

## 28.6 `docs/ARCHITECTURE.md`

Document:

* high-level architecture,
* frontend responsibilities,
* Vercel/server-side responsibilities,
* Supabase responsibilities,
* PostgreSQL responsibilities,
* AI-provider boundary,
* deterministic classification path,
* AI-assisted classification path,
* data flow,
* provenance flow,
* validation boundaries,
* trust boundaries,
* deployment boundaries,
* failure paths.

Include Mermaid architecture/data-flow diagrams.

For each significant choice record:

* choice,
* rationale,
* alternatives considered,
* tradeoffs.

Architecture should begin from the conceptual target:

Browser
→ Vercel application
→ controlled application/server boundary
→ Supabase PostgreSQL

Optional bounded AI path:

application/server boundary
→ model provider
→ structured result validation
→ canonical category lookup

Document why privileged credentials stay server-side.

Document technologies deliberately not used, including unnecessary:

* microservices,
* vector database,
* agents,
* background queues,
* separate backend host,
* Kubernetes,
* Supabase Auth if not needed.

Do not select additional infrastructure without requirement-backed justification.

---

## 28.7 `docs/DATA_MODEL.md`

Design the expected relational model before implementation.

Consider whether V1 needs concepts such as:

* disposal categories,
* item aliases,
* disposal methods,
* facilities only if needed,
* category/method relationships if justified,
* sources,
* source evidence,
* source verification/freshness metadata.

Do not use these names blindly; derive the simplest schema from requirements.

Document:

* entities,
* purpose,
* fields,
* data types where useful,
* primary keys,
* foreign keys,
* uniqueness,
* indexes,
* validation,
* nullability,
* ownership,
* provenance,
* update lifecycle,
* deletion behavior,
* source freshness,
* expected seed/reference data.

Include a Mermaid ER diagram.

---

## 28.8 `docs/API_CONTRACTS.md`

Document any required internal application/API boundary.

For each API/interface include where applicable:

* endpoint,
* HTTP method,
* purpose,
* authentication,
* authorization,
* request schema,
* response schema,
* validation,
* status codes,
* error schema,
* timeout,
* retry,
* idempotency,
* rate/abuse consideration.

If a separate public API is unnecessary, explicitly state that.

Do not create a public REST API merely for portfolio appearance.

Also document relevant external interfaces:

* Supabase/PostgreSQL,
* model provider if used.

---

## 28.9 `docs/AI_SYSTEM_DESIGN.md`

Document:

### Why AI is being considered

Natural-language descriptions can exceed deterministic alias matching.

### Exact AI responsibility

AI should perform only bounded language interpretation/classification and possibly grounded plain-language explanation.

### Deterministic responsibilities

Document all behavior that should remain conventional software.

### Classification design

Define:

* model input,
* allowed category identifiers,
* structured output,
* confidence/ambiguity handling if used,
* validation,
* invalid-output behavior,
* unsupported behavior.

### Grounding

The LLM must not become the source of disposal rules.

### UX behavior

AI uncertainty must translate into a clear user-facing clarification or abstention state rather than hidden uncertainty.

### Retrieval

Explain why the small structured V1 corpus probably does not require a vector database.

### Model selection

Define criteria such as:

* structured-output reliability,
* classification accuracy,
* latency,
* cost,
* API reliability.

### Failure handling

Define behavior when:

* model unavailable,
* timeout,
* malformed output,
* category not allowed,
* ambiguity remains,
* model attempts unsupported answer.

### Security

Include prompt injection and adversarial inputs.

### Cost and latency

Define what should eventually be measured.

### Known limitations

Document explicitly.

---

## 28.10 `docs/EVALUATION_PLAN.md`

Define a reproducible evaluation strategy.

Include deterministic and AI evaluation.

AI cases should cover:

* exact names,
* synonyms,
* colloquial descriptions,
* misspellings,
* ambiguous items,
* unsupported items,
* hazardous ambiguity,
* prompt injection,
* requests to ignore authoritative data,
* malformed/irrelevant input.

Metrics may include:

* canonical classification accuracy,
* safe-abstention behavior,
* disposal-answer support rate,
* citation correctness,
* unsupported-claim rate,
* malformed structured-output rate,
* latency,
* token use,
* estimated cost.

Also include UX/user evaluation.

Test whether representative users can:

* understand the initial task without instruction,
* submit an item successfully,
* interpret the result,
* identify the official source,
* recover from ambiguous input,
* understand unsupported-result messaging.

Compare:

official workflow alone

versus

navigator workflow.

Measure:

* task-completion rate,
* task-completion time,
* errors,
* recovery failures,
* source-identification success where useful.

Do not perform user testing during Stage 1.

---

## 28.11 `docs/TESTING_STRATEGY.md`

Document testing for:

* unit logic,
* input validation,
* category mapping,
* data transformation,
* integration,
* Supabase/database,
* API/server boundary,
* AI adapter,
* structured-output validation,
* failure fallback,
* end-to-end flow,
* responsive UI,
* keyboard interaction,
* basic accessibility,
* security-relevant behavior,
* regression evaluation.

Define:

* fixtures,
* canonical test records,
* test database strategy,
* model mocking,
* deterministic versus live-model tests,
* CI expectations,
* minimum passing-build conditions.

Do not require live paid model calls for every normal CI run unless justified.

---

## 28.12 `docs/SECURITY.md`

Document:

* threat assumptions,
* public unauthenticated model,
* authorization implications,
* Supabase access design,
* RLS decision,
* least privilege,
* service-role handling,
* environment variables,
* model API keys,
* Vercel secrets,
* input validation,
* output encoding,
* dependency security,
* rate/abuse considerations,
* privacy,
* secure logging,
* database exposure,
* error-message exposure.

AI-specific threats:

* prompt injection,
* indirect injection,
* malicious input,
* instruction override,
* sensitive-data leakage,
* excessive permissions,
* tool abuse.

No authentication should be added merely to demonstrate authentication knowledge.

---

## 28.13 `docs/OBSERVABILITY.md`

Define minimum viable operational visibility.

Document:

* structured logs,
* error logs,
* request/correlation strategy if useful,
* Vercel information,
* Supabase information,
* database failures,
* AI failures,
* latency,
* model/provider metadata,
* validation failures,
* token usage,
* estimated cost,
* evaluation outcomes where useful.

Define what must never be logged.

Answer:

> What minimum evidence would allow diagnosis of a failed resident request?

---

## 28.14 `docs/DEPLOYMENT.md`

Document:

### Local development

* prerequisites,
* dependencies,
* local environment,
* local Supabase strategy,
* environment variables.

### GitHub

* repository workflow,
* CI,
* branch protections if appropriate.

### Supabase

* environment model,
* migrations,
* seed/reference data,
* access,
* backups/recovery.

### Vercel

* GitHub integration,
* preview deployments,
* production deployment,
* environment variables,
* HTTPS,
* deployment verification.

### Production

* release,
* rollback,
* migrations,
* smoke tests,
* post-deployment verification.

---

## 28.15 `docs/DEVELOPMENT_WORKFLOW.md`

Document:

* requirement,
* backlog,
* GitHub issue if used,
* branch,
* implementation,
* tests,
* commit,
* push,
* PR,
* CI,
* self-review,
* acceptance verification,
* merge,
* deployment.

Define branch naming, commits, PR expectations, testing, documentation, and traceability.

---

## 28.16 `docs/CODING_AGENT_RULES.md`

Permanent rules:

* Read `AGENTS.md`.
* Read relevant `/docs`.
* Inspect implementation before editing.
* Identify requirement IDs.
* Identify acceptance criteria.
* Implement only requested scope.
* Do not silently expand scope.
* Do not change architecture without documentation.
* Do not add dependencies casually.
* Do not replace working architecture because another approach is fashionable.
* Do not remove tests to make builds pass.
* Prefer root-cause fixes.
* Avoid unrelated refactoring.
* Preserve compatibility.
* Validate external input.
* Preserve authoritative provenance.
* Never allow AI-generated disposal knowledge to replace authoritative data.
* Preserve UX simplicity.
* Do not introduce unnecessary interaction steps.
* Preserve accessibility requirements.
* Follow least privilege.
* Protect secrets.
* Run relevant tests.
* Update documentation.
* Report modified files.
* Report tests.
* Report assumptions.
* Report unresolved risks.
* Report technical debt.
* Recommend one next task.
* Do not automatically execute that task.

---

## 28.17 `docs/DECISIONS.md`

Use ADR-style entries.

Possible early decisions:

* GitHub/Git workflow,
* Supabase PostgreSQL,
* Vercel hosting,
* no V1 authentication,
* deterministic authoritative lookup,
* bounded AI,
* no vector database,
* source freshness strategy,
* non-chat primary UI,
* one-input primary UX,
* mobile-responsive single-column design,
* framework selection after repository inspection.

---

## 28.18 `docs/RISKS.md`

Track:

* product risks,
* source-data risk,
* stale information,
* classification risk,
* hallucination risk,
* false confidence,
* hazardous ambiguity,
* usability risk,
* accessibility risk,
* database risk,
* vendor risk,
* Supabase risk,
* Vercel risk,
* model-provider risk,
* security risk,
* privacy risk,
* dependency risk,
* deployment risk,
* operational risk,
* evaluation risk,
* user-testing risk.

A critical risk is:

> A fluent but unsupported disposal instruction appears authoritative.

Another important risk is:

> The product technically works but is too confusing for residents with lower technical familiarity to use successfully.

Design mitigations accordingly.

---

## 28.19 `docs/ROADMAP.md`

Use restrained milestones:

### Foundation

Stage 1.

### Authoritative data

Source inventory and canonical dataset.

### Deterministic baseline

Non-AI lookup.

### Core UX

Initial, result, ambiguity, unsupported states.

### AI-assisted interpretation

Only if baseline shows measurable need.

### Provenance

Inspectable evidence.

### Evaluation

Regression and failure testing.

### User validation

Small comparative test across users with varied levels of technical familiarity.

### Deployment

Vercel + Supabase.

### V1.0

Requirements and Definition of Done satisfied.

### Retrospective

Completed before Level 2.

Do not populate future versions with speculative features.

---

## 28.20 `docs/BACKLOG.md`

Each item:

* Backlog ID,
* title,
* description,
* requirement IDs,
* acceptance criteria,
* dependencies,
* priority,
* complexity S/M/L,
* testing expectations.

Prefer vertical slices.

The progression should approximately follow:

authoritative data
→ deterministic behavior
→ basic usable interface
→ measured baseline
→ bounded AI value
→ provenance
→ evaluation
→ user testing
→ deployment

rather than infrastructure for its own sake.

---

## 28.21 `docs/DEFINITION_OF_DONE.md`

Backlog completion requires:

* requirement implemented,
* acceptance criteria satisfied,
* tests updated,
* tests pass,
* validation,
* error handling,
* security reviewed,
* accessibility reviewed where relevant,
* observability where appropriate,
* documentation updated,
* no unresolved high-severity defect,
* no unexplained architecture deviation.

V1 should require:

* frozen supported domain,
* authoritative sources documented,
* data provenance preserved,
* deterministic baseline implemented,
* core UX states implemented,
* responsive/mobile usability,
* agreed accessibility criteria met,
* bounded AI justified and evaluated,
* important claims sourced,
* ambiguity/unsupported handling,
* evaluation thresholds met,
* user test completed,
* production deployment functioning,
* security review,
* operational behavior documented,
* README complete,
* known limitations documented,
* retrospective ready to begin.

Deployment alone does not mean V1 is finished.

---

## 28.22 Root `README.md`

Include:

* project title,
* problem,
* target user,
* public-interest purpose,
* V1 behavior,
* exclusions,
* status,
* architecture,
* authoritative-source approach,
* responsible AI boundary,
* accessibility/usability philosophy,
* technologies,
* GitHub/Supabase/Vercel target,
* testing/evaluation overview,
* `/docs`,
* portfolio objective.

Keep concise.

---

## 28.23 Root `AGENTS.md`

Create a compact persistent operating manual containing:

* project objective,
* Level 1 constraint,
* V1 scope,
* explicit exclusions,
* authoritative-source rules,
* AI role,
* UX simplicity requirement,
* accessibility requirement,
* architecture constraints,
* Git/GitHub workflow,
* Supabase constraints,
* Vercel constraints,
* testing,
* security,
* documentation,
* Stage 2 bounded-task workflow.

Point agents to `/docs`.

---

# 29. TRACEABILITY

Maintain:

Problem
↓
Requirements
↓
Acceptance Criteria
↓
Architecture / UX Design
↓
Backlog
↓
Implementation
↓
Tests / Evaluations
↓
Definition of Done

Requirement IDs should be referenced wherever relevant.

Avoid orphan requirements and unjustified backlog items.

---

# 30. PORTFOLIO EVIDENCE

Eventually preserve:

* problem definition,
* scope,
* source inventory,
* requirements,
* architecture diagrams,
* user-flow/wireframe documentation,
* data model,
* prompt/system design,
* evaluation set,
* evaluation results,
* failure analysis,
* testing evidence,
* accessibility decisions,
* security decisions,
* deployment architecture,
* screenshots,
* README,
* ADRs,
* production notes,
* retrospective.

Do not manufacture documentation solely for volume.

---

# 31. STAGE 1 COMPLETION REQUIREMENTS

Stage 1 is complete only when:

1. Repository inspected.
2. Existing valid work preserved/reconciled.
3. Problem documented.
4. Scope explicit.
5. V1 non-goals explicit.
6. Functional requirements exist.
7. Nonfunctional requirements exist.
8. UX/accessibility requirements exist.
9. Acceptance criteria exist.
10. User flows and core interface states documented.
11. Architecture documented.
12. GitHub/Git strategy documented.
13. Supabase role documented.
14. Vercel role documented.
15. Data model documented.
16. API contracts documented where applicable.
17. AI behavior documented.
18. Deterministic versus AI responsibilities documented.
19. Evaluation strategy exists.
20. Testing strategy exists.
21. Security strategy exists.
22. Observability strategy exists.
23. Deployment approach exists.
24. Development workflow exists.
25. Coding-agent rules exist.
26. ADRs exist.
27. Risks documented.
28. Roadmap restrained.
29. Backlog prioritized.
30. Definition of Done exists.
31. README exists.
32. AGENTS.md exists.
33. Traceability is internally consistent.
34. No application functionality was implemented during Stage 1.

Then:

**STOP.**

---

# 32. STAGE 1 FINAL REPORT

Provide:

## A. Repository file tree

Relevant repository structure.

## B. Project summary

One concise paragraph.

## C. Version 1 summary

Exactly what V1 will and will not do.

## D. Five most important assumptions

Clearly identify assumptions.

## E. Unresolved decisions

Only genuine unresolved questions.

## F. Architecture summary

Explain:

* browser/frontend,
* Vercel,
* server boundary,
* Supabase/PostgreSQL,
* AI provider,
* authoritative source data.

## G. UX summary

Explain:

* primary interaction,
* four interface states,
* low-barrier design,
* accessibility approach,
* mobile behavior,
* why the product is not designed as a chatbot.

## H. Highest risks

Prioritized risks.

## I. Stage 2 starting point

Recommend the first implementation milestone.

Then give the exact first bounded Stage 2 task with:

* backlog ID,
* requirement IDs,
* acceptance criteria,
* documentation,
* boundaries,
* expected tests,
* exclusions.

Do not implement it.

---

# 33. TEMPLATE FOR FUTURE STAGE 2 TASKS

Implement `[BACKLOG-ID]: [TASK NAME]`.

## Before changing code

1. Read `AGENTS.md`.
2. Read relevant documentation.
3. Inspect implementation.
4. Identify requirements.
5. Identify acceptance criteria.

## Scope

Implement only this backlog item.

### Relevant requirements

* `[FR-XXX]`
* `[NFR-XXX]`

### Acceptance criteria

* `[AC-...]`

### Relevant documentation

* `[FILE]`

## Constraints

* Do not implement later backlog items.
* Do not introduce unrelated refactors.
* Do not change architecture without requirement justification.
* Do not add dependencies unless necessary.
* Preserve existing behavior.
* Preserve authoritative provenance.
* Do not replace authoritative data with model knowledge.
* Preserve UX simplicity.
* Preserve accessibility.

## Testing

* Add/update tests.
* Run relevant tests.
* Verify acceptance criteria.
* Do not weaken tests.

## Security, accessibility, and reliability review

Review as applicable:

* validation,
* permissions,
* secrets,
* database access,
* data exposure,
* accessibility,
* error handling,
* AI validation,
* degraded behavior.

## Completion report

Report:

1. What was implemented.
2. Files changed.
3. Requirement IDs.
4. Acceptance criteria.
5. Tests added/changed.
6. Tests executed.
7. Results.
8. Acceptance verification.
9. Architecture/documentation changes.
10. Assumptions.
11. Remaining risks/technical debt.
12. Next smallest backlog item.

Do not automatically implement the next item.

---

# 34. WORKING PHILOSOPHY

The purpose of this project is not merely to produce a website.

It is to demonstrate the complete engineering process of turning a real public-interest problem into a small, measurable, usable, accessible, trustworthy software system while using AI coding agents extensively but responsibly.

Treat Codex as an engineering resource operating inside a defined system.

Codex is not a substitute for:

* discovery,
* evidence,
* product judgment,
* requirements,
* UX judgment,
* accessibility,
* architecture,
* source authority,
* data design,
* testing,
* evaluation,
* security,
* review,
* deployment discipline,
* human responsibility.

The finished portfolio project should demonstrate that I can:

* identify and define a real problem,
* separate evidence from assumptions,
* control scope,
* preserve authoritative sources,
* translate needs into requirements,
* design a low-friction user experience,
* make software accessible to a broad population,
* design suitable architecture,
* model data,
* define APIs,
* determine where AI is and is not useful,
* construct grounded model behavior,
* define structured outputs,
* design evaluations,
* direct coding agents,
* inspect generated work,
* test system behavior,
* analyze failures,
* secure application boundaries,
* manage Git/GitHub workflow,
* use Supabase responsibly,
* deploy through Vercel,
* observe production behavior,
* measure user outcomes,
* and finish a bounded Version 1.

Prefer:

**simple usable system
→ tested system
→ evaluated system
→ deployed system
→ finished system**

over:

**large partially implemented system.**

---

# 35. FINAL INSTRUCTION

Begin with **Stage 1 only**.

Inspect the repository first.

Then construct and reconcile the project foundation described above.

Do not begin application implementation.

Do not deploy.

Do not create unnecessary infrastructure.

Do not expand V1.

When Stage 1 is complete, provide the required Stage 1 Final Report and the exact first bounded Stage 2 task.

Then stop.
