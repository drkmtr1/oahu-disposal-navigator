"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";

import {
  normalizeItemInput,
  OFFICIAL_FALLBACK,
} from "../lib/disposal/domain";

type Fallback = {
  title: string;
  url: string;
};

type SuccessResponse = {
  requestId: string;
  status: "success";
  category: { id: string; name: string };
  guidance: {
    action: string;
    requirements: string[];
    where: string | null;
  };
  source: {
    organization: string;
    title: string;
    url: string;
    verifiedOn: string;
  };
  trustMessage: string;
};

type AmbiguousResponse = {
  requestId: string;
  status: "ambiguous";
  question: string;
  candidates: Array<{ id: string; name: string }>;
  allowUnsure: true;
  fallback: Fallback;
};

type UnsupportedResponse = {
  requestId: string;
  status: "unsupported";
  reasonCode: "UNSUPPORTED" | "EVIDENCE_UNAVAILABLE";
  message: string;
  fallback: Fallback;
};

type ErrorResponse = {
  requestId: string;
  status: "error";
  reasonCode: string;
  retryable: boolean;
  message: string;
};

type ApiResponse =
  | SuccessResponse
  | AmbiguousResponse
  | UnsupportedResponse
  | ErrorResponse;

type RequestPayload = {
  item: string;
  selectedCategoryId?: string;
};

type ViewState =
  | { kind: "initial" }
  | { kind: "loading" }
  | { kind: "response"; response: ApiResponse };

const GENERIC_ERROR: ErrorResponse = {
  requestId: "unavailable",
  status: "error",
  reasonCode: "NETWORK_UNAVAILABLE",
  retryable: true,
  message: "The lookup could not be completed. Check your connection and try again.",
};

const CATEGORY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UNSUPPORTED_REASON_CODES = new Set(["UNSUPPORTED", "EVIDENCE_UNAVAILABLE"]);
const ERROR_REASON_CODES = new Set([
  "INVALID_INPUT",
  "DATABASE_UNAVAILABLE",
  "RATE_LIMITED",
  "INTERNAL",
]);

export function DisposalNavigator() {
  const [item, setItem] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>({ kind: "initial" });
  const [retryUsed, setRetryUsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<RequestPayload | null>(null);

  useEffect(() => {
    if (view.kind === "response") {
      resultHeadingRef.current?.focus();
    }
  }, [view]);

  useEffect(
    () => () => {
      activeRequestRef.current?.abort();
    },
    [],
  );

  async function runLookup(payload: RequestPayload, isRetry = false) {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    lastRequestRef.current = payload;
    if (!isRetry) setRetryUsed(false);
    setView({ kind: "loading" });

    try {
      const response = await fetch("/api/disposal-options", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      });
      const value: unknown = await response.json();
      const parsed = parseApiResponse(value);
      setView({
        kind: "response",
        response: parsed ?? { ...GENERIC_ERROR, retryable: false },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setView({ kind: "response", response: GENERIC_ERROR });
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (view.kind === "loading") return;

    const validation = normalizeItemInput(item);
    if (!validation.ok) {
      setFieldError(validation.message);
      setView({ kind: "initial" });
      inputRef.current?.focus();
      return;
    }

    setFieldError(null);
    void runLookup({ item });
  }

  function handleEdit() {
    setView({ kind: "initial" });
    setFieldError(null);
    inputRef.current?.focus();
  }

  function handleSearchAnother() {
    setItem("");
    setView({ kind: "initial" });
    setFieldError(null);
    inputRef.current?.focus();
  }

  function handleRetry() {
    const lastRequest = lastRequestRef.current;
    if (retryUsed || lastRequest === null) return;
    setRetryUsed(true);
    void runLookup(lastRequest, true);
  }

  const statusMessage = getStatusMessage(view);

  return (
    <>
      <section className="lookup-card" aria-labelledby="lookup-heading">
        <h2 id="lookup-heading">What item do you need to dispose of?</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="item-description">Household item</label>
          <input
            ref={inputRef}
            id="item-description"
            name="item"
            type="text"
            value={item}
            onChange={(event) => {
              setItem(event.target.value);
              if (fieldError !== null) setFieldError(null);
            }}
            aria-describedby={fieldError ? "item-hint item-error" : "item-hint"}
            aria-invalid={fieldError !== null}
            autoComplete="off"
            spellCheck="true"
          />
          <p id="item-hint" className="field-hint">
            Enter one item in plain language, up to 200 characters. For example: old
            mattress or battery.
          </p>
          {fieldError ? (
            <p id="item-error" className="field-error" role="alert">
              {fieldError}
            </p>
          ) : null}
          <button className="button-primary" type="submit" disabled={view.kind === "loading"}>
            {view.kind === "loading" ? "Finding options…" : "Find disposal options"}
          </button>
        </form>
      </section>

      <p className="live-status" role="status" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </p>

      {view.kind === "response" ? (
        <ResultPanel
          response={view.response}
          resultHeadingRef={resultHeadingRef}
          retryUsed={retryUsed}
          onSelectCandidate={(categoryId) =>
            void runLookup({
              item: lastRequestRef.current?.item ?? item,
              selectedCategoryId: categoryId,
            })
          }
          onUnsure={() =>
            setView({
              kind: "response",
              response: {
                requestId: view.response.requestId,
                status: "unsupported",
                reasonCode: "UNSUPPORTED",
                message: "No disposal instruction was selected because the item type is unclear.",
                fallback:
                  view.response.status === "ambiguous"
                    ? view.response.fallback
                    : OFFICIAL_FALLBACK,
              },
            })
          }
          onRetry={handleRetry}
          onEdit={handleEdit}
          onSearchAnother={handleSearchAnother}
        />
      ) : null}
    </>
  );
}

type ResultPanelProps = {
  response: ApiResponse;
  resultHeadingRef: RefObject<HTMLHeadingElement | null>;
  retryUsed: boolean;
  onSelectCandidate: (categoryId: string) => void;
  onUnsure: () => void;
  onRetry: () => void;
  onEdit: () => void;
  onSearchAnother: () => void;
};

function ResultPanel({
  response,
  resultHeadingRef,
  retryUsed,
  onSelectCandidate,
  onUnsure,
  onRetry,
  onEdit,
  onSearchAnother,
}: ResultPanelProps) {
  if (response.status === "success") {
    return (
      <section className="result-card" aria-labelledby="result-heading">
        <p className="result-kicker">Item identified as</p>
        <h2 ref={resultHeadingRef} id="result-heading" tabIndex={-1}>
          {response.category.name}
        </h2>

        <div className="result-section">
          <h3>What to do</h3>
          <p>{response.guidance.action}</p>
        </div>

        <div className="result-section">
          <h3>Important requirements</h3>
          <ul>
            {response.guidance.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>

        {response.guidance.where ? (
          <div className="result-section">
            <h3>Where</h3>
            <p>{response.guidance.where}</p>
          </div>
        ) : null}

        <div className="source-panel">
          <h3>Official source</h3>
          <p>{response.source.organization}</p>
          <p>
            <a href={response.source.url}>{response.source.title}</a>
          </p>
          <p className="source-date">
            Project verified: {formatDate(response.source.verifiedOn)}
          </p>
          <p className="source-trust">{response.trustMessage}</p>
        </div>

        <ResultActions onEdit={onEdit} onSearchAnother={onSearchAnother} />
      </section>
    );
  }

  if (response.status === "ambiguous") {
    return (
      <section className="result-card" aria-labelledby="result-heading">
        <p className="result-kicker">A little more information is needed</p>
        <h2 ref={resultHeadingRef} id="result-heading" tabIndex={-1}>
          {response.question}
        </h2>
        <p>Choose the closest option. No disposal instruction is shown until the item is clear.</p>
        <div className="choice-list" aria-label="Item types">
          {response.candidates.map((candidate) => (
            <button
              className="choice-button"
              key={candidate.id}
              type="button"
              onClick={() => onSelectCandidate(candidate.id)}
            >
              {candidate.name}
            </button>
          ))}
          <button className="choice-button choice-unsure" type="button" onClick={onUnsure}>
            I’m not sure
          </button>
        </div>
        <button className="button-link" type="button" onClick={onEdit}>
          Edit my description
        </button>
      </section>
    );
  }

  if (response.status === "unsupported") {
    const evidenceUnavailable = response.reasonCode === "EVIDENCE_UNAVAILABLE";
    return (
      <section className="result-card" aria-labelledby="result-heading">
        <p className="result-kicker">No disposal instruction shown</p>
        <h2 ref={resultHeadingRef} id="result-heading" tabIndex={-1}>
          {evidenceUnavailable ? "Reviewed guidance is unavailable" : "No reliable match yet"}
        </h2>
        <p>{response.message}</p>
        <p>
          <a href={response.fallback.url}>{response.fallback.title}</a>
        </p>
        <ResultActions onEdit={onEdit} onSearchAnother={onSearchAnother} />
      </section>
    );
  }

  return (
    <section className="result-card result-error" aria-labelledby="result-heading">
      <p className="result-kicker">Lookup not completed</p>
      <h2 ref={resultHeadingRef} id="result-heading" tabIndex={-1}>
        We couldn’t complete the lookup
      </h2>
      <p>{response.message}</p>
      {response.retryable && !retryUsed ? (
        <button className="button-primary" type="button" onClick={onRetry}>
          Try once more
        </button>
      ) : null}
      <p>
        <a href={OFFICIAL_FALLBACK.url}>{OFFICIAL_FALLBACK.title}</a>
      </p>
      <ResultActions onEdit={onEdit} onSearchAnother={onSearchAnother} />
    </section>
  );
}

function ResultActions({
  onEdit,
  onSearchAnother,
}: {
  onEdit: () => void;
  onSearchAnother: () => void;
}) {
  return (
    <div className="result-actions">
      <button className="button-secondary" type="button" onClick={onEdit}>
        Edit description
      </button>
      <button className="button-link" type="button" onClick={onSearchAnother}>
        Search another item
      </button>
    </div>
  );
}

function getStatusMessage(view: ViewState): string {
  if (view.kind === "loading") return "Finding disposal options…";
  if (view.kind !== "response") return "";

  if (view.response.status === "success") {
    return `Disposal guidance found for ${view.response.category.name}.`;
  }
  if (view.response.status === "ambiguous") return "More information is needed.";
  if (view.response.status === "unsupported") return "No disposal instruction is available.";
  return "The lookup could not be completed.";
}

function parseApiResponse(value: unknown): ApiResponse | null {
  if (!isRecord(value) || !isString(value.requestId) || !isString(value.status)) return null;

  if (value.status === "success") {
    if (
      !isNamedId(value.category) ||
      !isRecord(value.guidance) ||
      !isString(value.guidance.action) ||
      !isStringArray(value.guidance.requirements) ||
      !(value.guidance.where === null || isString(value.guidance.where)) ||
      !isRecord(value.source) ||
      !isString(value.source.organization) ||
      !isString(value.source.title) ||
      !isOfficialUrl(value.source.url) ||
      !isIsoDate(value.source.verifiedOn) ||
      !isString(value.trustMessage)
    ) {
      return null;
    }
    return value as SuccessResponse;
  }

  if (value.status === "ambiguous") {
    if (
      !isString(value.question) ||
      !Array.isArray(value.candidates) ||
      value.candidates.length < 1 ||
      value.candidates.length > 4 ||
      !value.candidates.every(isNamedId) ||
      value.allowUnsure !== true ||
      !isFallback(value.fallback)
    ) {
      return null;
    }
    return value as AmbiguousResponse;
  }

  if (value.status === "unsupported") {
    if (
      !isString(value.reasonCode) ||
      !UNSUPPORTED_REASON_CODES.has(value.reasonCode) ||
      !isString(value.message) ||
      !isFallback(value.fallback)
    ) {
      return null;
    }
    return value as UnsupportedResponse;
  }

  if (value.status === "error") {
    if (
      !isString(value.reasonCode) ||
      !ERROR_REASON_CODES.has(value.reasonCode) ||
      typeof value.retryable !== "boolean" ||
      !isString(value.message)
    ) {
      return null;
    }
    return value as ErrorResponse;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim() === value && value.length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isString);
}

function isNamedId(value: unknown): value is { id: string; name: string } {
  return (
    isRecord(value) &&
    isString(value.id) &&
    CATEGORY_ID_PATTERN.test(value.id) &&
    isString(value.name)
  );
}

function isFallback(value: unknown): value is Fallback {
  return isRecord(value) && isString(value.title) && isOfficialUrl(value.url);
}

function isOfficialUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLocaleLowerCase("en-US");
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      ["honolulu.gov", "hawaii.gov"].some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
      )
    );
  } catch {
    return false;
  }
}

function isIsoDate(value: unknown): value is string {
  if (!isString(value) || !ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
