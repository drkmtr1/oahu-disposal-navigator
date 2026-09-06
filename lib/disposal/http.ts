import { randomUUID } from "node:crypto";

import {
  resolveDisposalLookup,
  type LookupOutcome,
  type LookupRows,
} from "./domain.ts";
import { createSupabaseLookupRows } from "./supabase.ts";

const MAX_REQUEST_BODY_BYTES = 4_096;

type HandlerDependencies = {
  lookupRows?: LookupRows;
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

export function createDisposalPostHandler(dependencies: HandlerDependencies = {}) {
  const requestIdFactory = dependencies.requestIdFactory ?? randomUUID;
  const today = dependencies.today ?? (() => new Date().toISOString().slice(0, 10));

  return async function POST(request: Request): Promise<Response> {
    const requestId = requestIdFactory();

    try {
      const body = await parseRequestBody(request);
      const lookupRows = dependencies.lookupRows ?? defaultLookupRows;
      const outcome = await resolveDisposalLookup(body.item, lookupRows, {
        signal: request.signal,
        today: today(),
        selectedCategoryId: body.selectedCategoryId,
      });

      if ("ok" in outcome) {
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
      return jsonResponse(response, httpStatus);
    } catch (error) {
      if (error instanceof RequestBodyError) {
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

function jsonResponse(body: ApiResponse, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
