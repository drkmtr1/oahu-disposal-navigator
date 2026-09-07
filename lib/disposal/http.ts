import { randomUUID } from "node:crypto";

import {
  resolveDisposalLookup,
  type LookupOutcome,
  type LookupRows,
} from "./domain.ts";
import { createSupabaseLookupRows } from "./supabase.ts";
import {
  createInMemoryRateLimiter,
  logLookupEvent,
  runtimeContext,
  type EventLogger,
  type LookupEvent,
  type RateLimiter,
} from "./operations.ts";

const MAX_REQUEST_BODY_BYTES = 4_096;

type HandlerDependencies = {
  eventLogger?: EventLogger;
  lookupRows?: LookupRows;
  now?: () => number;
  rateLimiter?: RateLimiter;
  requestIdFactory?: () => string;
  today?: () => string;
};

type ApiResponse = (LookupOutcome | InvalidInputResponse | InternalErrorResponse) & {
  requestId: string;
};

type InvalidInputResponse = {
  status: "error";
  reasonCode: "INVALID_INPUT";
  retryable: false;
  message: string;
};

type InternalErrorResponse = {
  status: "error";
  reasonCode: "INTERNAL";
  retryable: false;
  message: string;
};

type RateLimitedResponse = {
  status: "error";
  reasonCode: "RATE_LIMITED";
  retryable: true;
  message: string;
};

class RequestBodyError extends Error {
  readonly httpStatus: 400 | 413;

  constructor(
    httpStatus: 400 | 413,
    message: string,
  ) {
    super(message);
    this.httpStatus = httpStatus;
  }
}

const defaultRateLimiter = createInMemoryRateLimiter();

export function createDisposalPostHandler(dependencies: HandlerDependencies = {}) {
  const eventLogger = dependencies.eventLogger ?? logLookupEvent;
  const now = dependencies.now ?? Date.now;
  const rateLimiter = dependencies.rateLimiter ?? defaultRateLimiter;
  const requestIdFactory = dependencies.requestIdFactory ?? randomUUID;
  const today = dependencies.today ?? (() => new Date().toISOString().slice(0, 10));

  return async function POST(request: Request): Promise<Response> {
    const requestId = requestIdFactory();
    const startedAt = now();
    const rateDecision = rateLimiter(request, startedAt);

    if (!rateDecision.allowed) {
      emitEvent(eventLogger, requestId, startedAt, now(), {
        event: "rate_limited",
        operation: "rate_limit",
        outcome: "rate_limited",
        reasonCode: "RATE_LIMITED",
        databaseAttempted: false,
        modelAttempted: false,
        databaseDurationMs: null,
        validationResult: "not_attempted",
        classificationPath: "none",
        categoryId: null,
        sourceDataVersion: null,
        sourceReviewOutcome: "not_applicable",
        errorClass: "rate_limit",
        fallbackOutcome: "retry",
      });
      return jsonResponse(
        {
          requestId,
          status: "error",
          reasonCode: "RATE_LIMITED",
          retryable: true,
          message: "Too many requests. Please wait a moment and try again.",
        },
        429,
        { "Retry-After": String(rateDecision.retryAfterSeconds) },
      );
    }

    try {
      const body = await parseRequestBody(request);
      const lookupRows = dependencies.lookupRows ?? defaultLookupRows;
      const outcome = await resolveDisposalLookup(body.item, lookupRows, {
        signal: request.signal,
        today: today(),
        selectedCategoryId: body.selectedCategoryId,
      });

      if ("ok" in outcome) {
        emitEvent(eventLogger, requestId, startedAt, now(), eventFields("INVALID_INPUT", false));
        return jsonResponse(
          {
            requestId,
            status: "error",
            reasonCode: "INVALID_INPUT",
            retryable: false,
            message: outcome.message,
          },
          400,
        );
      }

      const response = { requestId, ...outcome } as ApiResponse;
      const httpStatus = response.status === "error" ? 503 : 200;
      emitEvent(eventLogger, requestId, startedAt, now(), outcomeEventFields(outcome));
      return jsonResponse(response, httpStatus);
    } catch (error) {
      if (error instanceof RequestBodyError) {
        emitEvent(eventLogger, requestId, startedAt, now(), eventFields("INVALID_INPUT", false));
        return jsonResponse(
          {
            requestId,
            status: "error",
            reasonCode: "INVALID_INPUT",
            retryable: false,
            message: error.message,
          },
          error.httpStatus,
        );
      }

      emitEvent(eventLogger, requestId, startedAt, now(), {
        ...eventFields("INTERNAL", false),
        errorClass: "internal",
      });
      return jsonResponse(
        {
          requestId,
          status: "error",
          reasonCode: "INTERNAL",
          retryable: false,
          message: "The request could not be completed.",
        },
        500,
      );
    }
  };
}

async function defaultLookupRows(normalizedAlias: string, signal?: AbortSignal) {
  const lookupRows = createSupabaseLookupRows({
    url: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  });
  return lookupRows(normalizedAlias, signal);
}

async function parseRequestBody(
  request: Request,
): Promise<{ item: unknown; selectedCategoryId?: string }> {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    throw new RequestBodyError(400, "Send one household item as JSON.");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const bytes = Number(contentLength);
    if (Number.isFinite(bytes) && bytes > MAX_REQUEST_BODY_BYTES) {
      throw new RequestBodyError(413, "The request is too large.");
    }
  }

  const text = await readBoundedText(request);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new RequestBodyError(400, "Send one household item as valid JSON.");
  }

  if (!isRecord(body) || !("item" in body)) {
    throw new RequestBodyError(400, "Send one item field.");
  }

  const keys = Object.keys(body);
  const hasOnlyAllowedKeys = keys.every(
    (key) => key === "item" || key === "selectedCategoryId",
  );
  if (keys.length < 1 || keys.length > 2 || !hasOnlyAllowedKeys) {
    throw new RequestBodyError(400, "Send one item and, only after clarification, one category choice.");
  }

  if (!("selectedCategoryId" in body)) {
    return { item: body.item };
  }

  if (
    typeof body.selectedCategoryId !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.selectedCategoryId)
  ) {
    throw new RequestBodyError(400, "Send a valid clarification choice.");
  }

  return { item: body.item, selectedCategoryId: body.selectedCategoryId };
}

async function readBoundedText(request: Request): Promise<string> {
  if (request.body === null) {
    throw new RequestBodyError(400, "Send one household item as valid JSON.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BODY_BYTES) {
      await reader.cancel();
      throw new RequestBodyError(413, "The request is too large.");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new RequestBodyError(400, "Send one household item as valid UTF-8 JSON.");
  }
}

function jsonResponse(
  body: ApiResponse | RateLimitedResponse & { requestId: string },
  status: number,
  additionalHeaders: Record<string, string> = {},
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": body.requestId,
      ...additionalHeaders,
    },
  });
}

function eventFields(reasonCode: string, databaseAttempted: boolean): Omit<LookupEvent,
  "timestamp" | "requestId" | "applicationVersion" | "environment" | "route" | "totalDurationMs"
> {
  return {
    event: "lookup_failed",
    operation: databaseAttempted ? "retrieve" : "validate",
    outcome: "error",
    reasonCode,
    databaseAttempted,
    modelAttempted: false,
    databaseDurationMs: databaseAttempted ? 0 : null,
    validationResult: databaseAttempted ? "accepted" : "rejected",
    classificationPath: databaseAttempted ? "deterministic" : "none",
    categoryId: null,
    sourceDataVersion: null,
    sourceReviewOutcome: "not_applicable",
    errorClass: databaseAttempted ? "database" : "validation",
    fallbackOutcome: databaseAttempted ? "retry" : "none",
  };
}

function outcomeEventFields(outcome: LookupOutcome): ReturnType<typeof eventFields> {
  if (outcome.status === "success") {
    return {
      ...eventFields("MATCHED", true),
      event: "lookup_completed",
      operation: "assemble",
      outcome: "success",
      databaseDurationMs: 0,
      categoryId: outcome.category.id,
      sourceDataVersion: outcome.source.verifiedOn,
      sourceReviewOutcome: "eligible",
      errorClass: null,
      fallbackOutcome: "guidance",
    };
  }
  if (outcome.status === "ambiguous") {
    return {
      ...eventFields("AMBIGUOUS", true),
      event: "lookup_ambiguous",
      operation: "classify",
      outcome: "ambiguous",
      databaseDurationMs: 0,
      errorClass: null,
      fallbackOutcome: "clarification",
    };
  }
  if (outcome.status === "unsupported") {
    const evidenceRejected = outcome.reasonCode === "EVIDENCE_UNAVAILABLE";
    return {
      ...eventFields(outcome.reasonCode, true),
      event: evidenceRejected ? "evidence_rejected" : "lookup_unsupported",
      operation: evidenceRejected ? "assemble" : "classify",
      outcome: "unsupported",
      databaseDurationMs: 0,
      sourceReviewOutcome: evidenceRejected ? "rejected" : "not_applicable",
      errorClass: evidenceRejected ? "evidence" : null,
      fallbackOutcome: "official_fallback",
    };
  }
  return eventFields(outcome.reasonCode, true);
}

function emitEvent(
  logger: EventLogger,
  requestId: string,
  startedAt: number,
  endedAt: number,
  fields: Omit<LookupEvent,
    "timestamp" | "requestId" | "applicationVersion" | "environment" | "route" | "totalDurationMs"
  >,
): void {
  const totalDurationMs = Math.max(0, Math.round(endedAt - startedAt));
  try {
    logger({
      ...runtimeContext(),
      ...fields,
      timestamp: new Date().toISOString(),
      requestId,
      route: "/api/disposal-options",
      totalDurationMs,
      databaseDurationMs: fields.databaseDurationMs === null ? null : totalDurationMs,
    });
  } catch {
    // Diagnostics must never change the safe resident response.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
