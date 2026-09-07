import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";

import { resolveDisposalLookup } from "../lib/disposal/domain.ts";
import {
  loadEvaluationInputs,
  validateEvaluationDataset,
} from "./validate-deterministic-evaluation.mjs";

function percent(numerator, denominator) {
  return denominator === 0 ? null : Number(((numerator / denominator) * 100).toFixed(2));
}

function percentile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return Number(sorted[Math.ceil(sorted.length * fraction) - 1].toFixed(3));
}

function outcomeDecision(result) {
  if ("ok" in result && result.ok === false) return "invalid";
  if (result.status === "unsupported" && result.reasonCode === "EVIDENCE_UNAVAILABLE") {
    return "evidence_unavailable";
  }
  if (result.status === "error") return "database_error";
  return result.status;
}

function sameValues(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isCorrect(caseRecord, result) {
  const actualDecision = outcomeDecision(result);
  if (actualDecision !== caseRecord.expected.decision) return false;
  if (actualDecision === "success") {
    return result.category.id === caseRecord.expected.category_id;
  }
  if (actualDecision === "ambiguous") {
    return sameValues(
      result.candidates.map((candidate) => candidate.id).toSorted(),
      caseRecord.expected.candidate_category_ids.toSorted(),
    );
  }
  return true;
}

function responseHasNoGuidance(result) {
  return !("guidance" in result) && !("source" in result) && !("evidence" in result);
}

function buildRepository(canonical, simulation) {
  const sources = new Map(canonical.sources.map((source) => [source.id, source]));
  const evidence = canonical.evidence;
  const aliasMatches = new Map();
  for (const category of canonical.categories) {
    for (const alias of category.aliases) {
      const matches = aliasMatches.get(alias.normalized_alias) ?? [];
      matches.push({ category, alias });
      aliasMatches.set(alias.normalized_alias, matches);
    }
  }

  return async (normalizedAlias) => {
    if (simulation === "database_failure") throw new Error("Synthetic database failure");
    return (aliasMatches.get(normalizedAlias) ?? []).flatMap(({ category, alias }) =>
      evidence
        .filter((record) => category.guidance.evidence_ids.includes(record.id))
        .map((record) => {
          const source = sources.get(record.source_id);
          return {
            category_id: category.id,
            category_name: category.display_name,
            alias: alias.alias,
            normalized_alias: alias.normalized_alias,
            locale: alias.locale,
            guidance_id: `guidance-${category.id}`,
            action_summary: category.guidance.action_summary,
            requirements: category.guidance.requirements,
            where_summary: category.guidance.where_summary,
            escalation_url: category.guidance.escalation_url,
            source_id: source.id,
            source_organization: source.organization,
            source_title: source.title,
            source_url: source.url,
            source_apparent_updated_on: source.apparent_updated_on,
            source_verified_on:
              simulation === "future_source" ? "2026-09-07" : source.last_human_verified_on,
            source_review_by:
              simulation === "stale_source" ? "2026-09-05" : source.review_by,
            evidence_id: record.id,
            evidence_summary:
              simulation === "malformed_evidence" ? "" : record.supporting_summary,
            evidence_locator: record.locator,
            evidence_claim_scope: record.claim_scope,
            evidence_reviewed_on: record.human_reviewed_on,
          };
        }),
    );
  };
}

function supportedResponseAudit(result, expectedCategory, canonical) {
  if (outcomeDecision(result) !== "success") {
    return { citationAssociated: false, unsupportedClaim: false };
  }
  if (!expectedCategory) {
    return { citationAssociated: false, unsupportedClaim: true };
  }

  const expectedEvidence = canonical.evidence
    .filter((record) => expectedCategory.guidance.evidence_ids.includes(record.id))
    .toSorted((left, right) => left.id.localeCompare(right.id));
  const expectedSource = canonical.sources.find(
    (source) => source.id === expectedEvidence[0]?.source_id,
  );
  const guidanceMatches = sameValues(result.guidance, {
    action: expectedCategory.guidance.action_summary,
    requirements: expectedCategory.guidance.requirements,
    where: expectedCategory.guidance.where_summary,
  });
  const sourceMatches = sameValues(result.source, {
    organization: expectedSource?.organization,
    title: expectedSource?.title,
    url: expectedSource?.url,
    apparentUpdatedOn: expectedSource?.apparent_updated_on,
    verifiedOn: expectedSource?.last_human_verified_on,
    reviewBy: expectedSource?.review_by,
  });
  const evidenceMatches = sameValues(
    result.evidence,
    expectedEvidence.map((record) => ({
      id: record.id,
      summary: record.supporting_summary,
      locator: record.locator,
      claimScope: record.claim_scope,
      reviewedOn: record.human_reviewed_on,
    })),
  );

  return {
    citationAssociated: sourceMatches && evidenceMatches,
    unsupportedClaim: !(guidanceMatches && sourceMatches && evidenceMatches),
  };
}

function metricFor(cases, predicate) {
  const cohort = cases.filter(predicate);
  return {
    correct: cohort.filter((record) => record.correct).length,
    total: cohort.length,
    percent: percent(cohort.filter((record) => record.correct).length, cohort.length),
  };
}

export async function runEvaluation() {
  const { evaluation, canonical } = await loadEvaluationInputs();
  const validationErrors = validateEvaluationDataset(evaluation, canonical);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid evaluation data:\n${validationErrors.join("\n")}`);
  }

  const categories = new Map(
    canonical.categories.map((category) => [category.id, category]),
  );
  const caseResults = [];

  for (const caseRecord of evaluation.cases) {
    const started = performance.now();
    const result = await resolveDisposalLookup(
      caseRecord.input,
      buildRepository(canonical, caseRecord.simulation),
      { today: evaluation.evaluation_date },
    );
    const durationMs = performance.now() - started;
    const correct = isCorrect(caseRecord, result);
    const expectedCategory = categories.get(caseRecord.expected.category_id);
    const responseAudit = supportedResponseAudit(result, expectedCategory, canonical);
    const safeCritical =
      !caseRecord.critical_safety ||
      (correct &&
        (caseRecord.expected.decision === "success" || responseHasNoGuidance(result)));

    caseResults.push({
      id: caseRecord.id,
      subset: caseRecord.subset,
      caseType: caseRecord.case_type,
      expectedDecision: caseRecord.expected.decision,
      actualDecision: outcomeDecision(result),
      expectedCategoryId: caseRecord.expected.category_id,
      actualCategoryId: result.status === "success" ? result.category.id : null,
      correct,
      criticalSafety: caseRecord.critical_safety,
      safeCritical,
      citationAssociated: responseAudit.citationAssociated,
      unsupportedClaim: responseAudit.unsupportedClaim,
      durationMs,
    });
  }

  const successful = caseResults.filter((record) => record.actualDecision === "success");
  const expectedSupported = caseResults.filter(
    (record) => record.expectedDecision === "success",
  );
  const unexpectedSuccesses = caseResults.filter(
    (record) => record.expectedDecision !== "success" && record.actualDecision === "success",
  );
  const critical = caseResults.filter((record) => record.criticalSafety);
  const durations = caseResults.map((record) => record.durationMs);

  const correctnessMetrics = {
    overall_case_accuracy: metricFor(caseResults, () => true),
    canonical_alias_accuracy: metricFor(
      caseResults,
      (record) => record.caseType === "canonical_alias",
    ),
    supported_classification_accuracy: metricFor(
      caseResults,
      (record) => record.expectedDecision === "success",
    ),
    ambiguity_accuracy: metricFor(
      caseResults,
      (record) => record.expectedDecision === "ambiguous",
    ),
    unsupported_abstention_accuracy: metricFor(
      caseResults,
      (record) => record.expectedDecision === "unsupported",
    ),
    invalid_input_accuracy: metricFor(
      caseResults,
      (record) => record.expectedDecision === "invalid",
    ),
    failure_containment_accuracy: metricFor(
      caseResults,
      (record) =>
        record.expectedDecision === "evidence_unavailable" ||
        record.expectedDecision === "database_error",
    ),
    development_accuracy: metricFor(
      caseResults,
      (record) => record.subset === "development",
    ),
    holdout_accuracy: metricFor(
      caseResults,
      (record) => record.subset === "holdout",
    ),
  };

  return {
    evaluationId: evaluation.evaluation_id,
    evaluationStatus: evaluation.status,
    evaluationDate: evaluation.evaluation_date,
    sourceDataVersion: evaluation.source_data_version,
    nodeVersion: process.version,
    caseCount: caseResults.length,
    metrics: {
      ...correctnessMetrics,
      coverage: {
        resolved: expectedSupported.filter((record) => record.actualDecision === "success")
          .length,
        expected_supported: expectedSupported.length,
        percent: percent(
          expectedSupported.filter((record) => record.actualDecision === "success").length,
          expectedSupported.length,
        ),
      },
      false_supported_rate: {
        false_supported: unexpectedSuccesses.length,
        expected_non_success: caseResults.length - expectedSupported.length,
        percent: percent(
          unexpectedSuccesses.length,
          caseResults.length - expectedSupported.length,
        ),
      },
      citation_association: {
        associated: successful.filter((record) => record.citationAssociated).length,
        successful: successful.length,
        percent: percent(
          successful.filter((record) => record.citationAssociated).length,
          successful.length,
        ),
      },
      unsupported_claim_count: successful.filter((record) => record.unsupportedClaim).length,
      critical_safe_handling: {
        safe: critical.filter((record) => record.safeCritical).length,
        critical: critical.length,
        percent: percent(
          critical.filter((record) => record.safeCritical).length,
          critical.length,
        ),
      },
      latency_ms: {
        median: percentile(durations, 0.5),
        p95: percentile(durations, 0.95),
        max: Number(Math.max(...durations).toFixed(3)),
        sample_size: durations.length,
        scope: "In-process deterministic resolver with versioned in-memory repository fixture; excludes HTTP, network, and PostgreSQL latency.",
      },
    },
    mismatches: caseResults
      .filter((record) => !record.correct)
      .map((record) => Object.fromEntries(
        Object.entries(record).filter(([key]) => key !== "durationMs"),
      )),
    cases: caseResults,
  };
}

function gates(result) {
  return [
    ["canonical alias accuracy", result.metrics.canonical_alias_accuracy.percent === 100],
    ["ambiguity accuracy", result.metrics.ambiguity_accuracy.percent === 100],
    ["unsupported abstention", result.metrics.unsupported_abstention_accuracy.percent === 100],
    ["invalid input", result.metrics.invalid_input_accuracy.percent === 100],
    ["failure containment", result.metrics.failure_containment_accuracy.percent === 100],
    ["citation association", result.metrics.citation_association.percent === 100],
    ["unsupported claims", result.metrics.unsupported_claim_count === 0],
    ["critical safe handling", result.metrics.critical_safe_handling.percent === 100],
  ];
}

async function main() {
  const result = await runEvaluation();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Deterministic baseline evaluation completed.");
    console.log(`Status: ${result.evaluationStatus}`);
    console.log(`Cases: ${result.caseCount}`);
    console.log(
      `Overall accuracy: ${result.metrics.overall_case_accuracy.correct}/${result.metrics.overall_case_accuracy.total} (${result.metrics.overall_case_accuracy.percent}%)`,
    );
    console.log(
      `Supported classification: ${result.metrics.supported_classification_accuracy.correct}/${result.metrics.supported_classification_accuracy.total} (${result.metrics.supported_classification_accuracy.percent}%)`,
    );
    console.log(
      `Unsupported abstention: ${result.metrics.unsupported_abstention_accuracy.correct}/${result.metrics.unsupported_abstention_accuracy.total} (${result.metrics.unsupported_abstention_accuracy.percent}%)`,
    );
    console.log(
      `Citation association: ${result.metrics.citation_association.associated}/${result.metrics.citation_association.successful} (${result.metrics.citation_association.percent}%)`,
    );
    console.log(`Unsupported claims: ${result.metrics.unsupported_claim_count}`);
    console.log(
      `Critical safe handling: ${result.metrics.critical_safe_handling.safe}/${result.metrics.critical_safe_handling.critical} (${result.metrics.critical_safe_handling.percent}%)`,
    );
    console.log(
      `Resolver latency: median ${result.metrics.latency_ms.median} ms; p95 ${result.metrics.latency_ms.p95} ms; max ${result.metrics.latency_ms.max} ms`,
    );
    console.log(`Mismatches: ${result.mismatches.length}`);
  }

  const failed = gates(result).filter(([, passed]) => !passed);
  if (failed.length > 0) {
    failed.forEach(([name]) => console.error(`Safety gate failed: ${name}`));
    process.exitCode = 1;
  } else {
    console.log("All deterministic safety gates passed.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
