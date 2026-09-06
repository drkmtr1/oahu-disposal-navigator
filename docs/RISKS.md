# Risk register

Scale: severity and likelihood are High/Medium/Low before mitigation. Priority follows potential resident harm first.

| ID | Risk | Type | Sev | Likelihood | Mitigation / detection | Trigger or owner action |
|---|---|---|---:|---:|---|---|
| R-001 | Fluent but unsupported disposal instruction appears authoritative. | AI/product/safety | High | Medium | AI cannot write guidance; allowlisted classification; evidence join; 0-claim gate | Any unsupported claim blocks release and disables affected path |
| R-002 | Guidance is stale after an official change. | Source/operational | High | Medium | verification history, review_by, manual review, expired exclusion | Changed/unavailable/overdue source deactivates guidance |
| R-003 | Source is misread or evidence does not support the displayed claim. | Data/evaluation | High | Medium | bounded evidence and claim scope, human review, provenance tests | Conflict goes to authority; no answer until resolved |
| R-004 | Hazardous/unknown item is confidently misclassified. | Classification/safety | High | Medium | critical cases, ambiguity/abstention, no inferred chemical safety | Any critical failure blocks release |
| R-005 | Technically working UI confuses residents with lower technical familiarity. | UX/product | High | Medium | one task/four states/plain language, comparative test, recovery metrics | Failure of 80% comprehension/completion gate creates blocking UX item |
| R-006 | Accessibility barriers prevent completion. | Accessibility | High | Medium | WCAG 2.2 AA criteria, semantic UI, manual/automated checks | Serious/critical or blocking manual finding prevents release |
| R-007 | Public database access permits writes or exposes unintended data. | Supabase/database/security | High | Medium | least privilege, explicit grants/RLS, allow/deny tests, server route | Anonymous write or unintended read blocks release; rotate/review |
| R-008 | Model/database secret reaches browser, logs, or Git. | Security/privacy | High | Low | server-only env, scans, bundle/log review, rotation plan | Suspected exposure: revoke/rotate, remove data, incident review |
| R-009 | Model/provider outage, drift, latency, or cost harms service. | Vendor/reliability/cost | Medium | Medium | optional adapter, pinned config, timeout, deterministic fallback, metrics | Breach disables AI path without blocking deterministic service |
| R-010 | Supabase or Vercel outage/config drift breaks lookup. | Vendor/deployment | Medium | Medium | safe error, platform logs, smoke tests, environment records, rollback | Sustained failure uses official fallback and incident checklist |
| R-011 | Abuse creates denial of service or unexpected model charges. | Security/operations | Medium | Medium | limits, rate controls, no retry loops, budget/cost alerts | Threshold breach rate-limits/disables AI |
| R-012 | Raw input/logs capture personal or sensitive information. | Privacy | High | Low | no account/location, no raw input by default, redaction/retention review | Any sensitive record is removed per incident process and design reviewed |
| R-013 | Dependency vulnerability or supply-chain drift. | Dependency/security | Medium | Medium | minimal pinned dependencies, lockfile, automated audit, reviewed updates | Exploitable high severity blocks release |
| R-014 | Migration/data release corrupts or separates guidance from provenance. | Database/deployment | High | Low | declarative schema, reviewed migration, constraints, backup, forward fix, smoke test | Failed integrity check halts app promotion |
| R-015 | Evaluation set is too small/biased and inflates performance. | Evaluation | Medium | Medium | frozen holdout, critical cases, failure analysis, raw counts/limits | Large production/user-test gap triggers dataset revision |
| R-016 | Small user test is treated as representative proof. | User research/portfolio | Medium | Medium | directional language, varied sample, disclose size/tasks/raw results | Claims exceeding evidence are corrected |
| R-017 | Scope creep prevents a finished Level 1 project. | Product/delivery | Medium | High | SCOPE classifications, one BL per PR, ADR/change gate | Unmapped feature deferred/rejected |
| R-018 | Official URL becomes unavailable or redirects to non-authority. | Source/operational | Medium | Medium | URL/authority verification and fallback contact | Mark unavailable and suppress affected success |
| R-019 | Public launch implies government endorsement. | Trust/legal | Medium | Medium | clear independent-project language and official-source attribution | User-test confusion prompts content correction |
| R-020 | Hawaiʻi visual identity becomes stereotypical/tourist-oriented. | UX/trust | Medium | Low | restrained civic design review | Remove decorative motif not serving usability |

The maintainer owns risk review. Reassess at source freeze, AI gate, pre-user-test, and pre-production. High residual safety/security/accessibility risks block release.
