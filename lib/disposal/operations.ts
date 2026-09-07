import { createHash, randomBytes } from "node:crypto";

export type LookupEvent = {
  event:
    | "lookup_completed"
    | "lookup_ambiguous"
    | "lookup_unsupported"
    | "lookup_failed"
    | "evidence_rejected"
    | "rate_limited";
  timestamp: string;
  requestId: string;
  applicationVersion: string;
  environment: "development" | "preview" | "production" | "test" | "unknown";
  route: "/api/disposal-options";
  operation: "validate" | "classify" | "retrieve" | "assemble" | "rate_limit";
  outcome: "success" | "ambiguous" | "unsupported" | "error" | "rate_limited";
  reasonCode: string;
  databaseAttempted: boolean;
  modelAttempted: false;
  totalDurationMs: number;
  databaseDurationMs: number | null;
  validationResult: "accepted" | "rejected" | "not_attempted";
  classificationPath: "deterministic" | "none";
  categoryId: string | null;
  sourceDataVersion: string | null;
  sourceReviewOutcome: "eligible" | "rejected" | "not_applicable";
  errorClass: "validation" | "rate_limit" | "database" | "evidence" | "internal" | null;
  fallbackOutcome: "guidance" | "clarification" | "official_fallback" | "retry" | "none";
};

export type EventLogger = (event: LookupEvent) => void;

export function logLookupEvent(event: LookupEvent): void {
  const method = event.outcome === "error" ? "error" : "info";
  console[method](JSON.stringify(event));
}

export type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = (request: Request, nowMs: number) => RateLimitDecision;

type RateLimitEntry = { count: number; windowStartedAt: number };

export function createInMemoryRateLimiter(options: {
  limit?: number;
  windowMs?: number;
  maxKeys?: number;
} = {}): RateLimiter {
  const limit = options.limit ?? 60;
  const windowMs = options.windowMs ?? 60_000;
  const maxKeys = options.maxKeys ?? 1_000;
  const processSalt = randomBytes(32);
  const entries = new Map<string, RateLimitEntry>();

  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1) {
    throw new Error("Invalid rate-limit configuration");
  }

  return (request, nowMs) => {
    const key = requestKey(request, processSalt);
    const existing = entries.get(key);
    const entry =
      existing && nowMs - existing.windowStartedAt < windowMs
        ? existing
        : { count: 0, windowStartedAt: nowMs };

    entry.count += 1;
    entries.delete(key);
    entries.set(key, entry);

    while (entries.size > maxKeys) {
      const oldestKey = entries.keys().next().value;
      if (oldestKey === undefined) break;
      entries.delete(oldestKey);
    }

    if (entry.count <= limit) return { allowed: true };
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.windowStartedAt + windowMs - nowMs) / 1_000)),
    };
  };
}

function requestKey(request: Request, salt: Buffer): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for");
  const address = forwarded?.split(",", 1)[0]?.trim().slice(0, 64) || "shared-local-client";
  return createHash("sha256").update(salt).update(address).digest("base64url");
}

export function runtimeContext(): Pick<LookupEvent, "applicationVersion" | "environment"> {
  const versionCandidate = process.env.VERCEL_GIT_COMMIT_SHA;
  const applicationVersion =
    typeof versionCandidate === "string" && /^[a-f0-9]{7,64}$/i.test(versionCandidate)
      ? versionCandidate
      : "unknown";
  const environmentCandidate = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  const environment = ["development", "preview", "production", "test"].includes(
    environmentCandidate ?? "",
  )
    ? (environmentCandidate as LookupEvent["environment"])
    : "unknown";
  return { applicationVersion, environment };
}
