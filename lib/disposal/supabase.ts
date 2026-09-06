import type { LookupRows } from "./domain.ts";

const LOOKUP_COLUMNS = [
  "category_id",
  "category_name",
  "alias",
  "normalized_alias",
  "locale",
  "guidance_id",
  "action_summary",
  "requirements",
  "where_summary",
  "escalation_url",
  "source_id",
  "source_organization",
  "source_title",
  "source_url",
  "source_verified_on",
  "source_review_by",
  "evidence_id",
  "evidence_summary",
  "evidence_locator",
  "evidence_claim_scope",
  "evidence_reviewed_on",
].join(",");

const DEFAULT_TIMEOUT_MS = 1_200;
const MAX_LOOKUP_ROWS = 32;

type FetchLike = typeof fetch;

export type SupabaseLookupConfiguration = {
  url: string | undefined;
  publishableKey: string | undefined;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

export function createSupabaseLookupRows(
  configuration: SupabaseLookupConfiguration,
): LookupRows {
  const baseUrl = parseSupabaseUrl(configuration.url);
  const publishableKey = requiredEnvironmentValue(configuration.publishableKey);
  const fetchImpl = configuration.fetchImpl ?? fetch;
  const timeoutMs = configuration.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5_000) {
    throw new Error("Invalid database timeout configuration");
  }

  return async (normalizedAlias, requestSignal) => {
    const url = new URL("rest/v1/disposal_lookup", baseUrl);
    url.searchParams.set("select", LOOKUP_COLUMNS);
    url.searchParams.set("normalized_alias", `eq.${normalizedAlias}`);
    url.searchParams.set("limit", String(MAX_LOOKUP_ROWS));

    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const signal = requestSignal
      ? AbortSignal.any([requestSignal, timeoutSignal])
      : timeoutSignal;

    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Profile": "api",
        apikey: publishableKey,
      },
      cache: "no-store",
      redirect: "error",
      signal,
    });

    if (!response.ok) {
      throw new Error("Supabase lookup failed");
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data) || data.length >= MAX_LOOKUP_ROWS) {
      throw new Error("Supabase lookup returned an invalid row set");
    }

    return data;
  };
}

function parseSupabaseUrl(value: string | undefined): URL {
  const candidate = requiredEnvironmentValue(value);
  let url: URL;
  try {
    url = new URL(candidate.endsWith("/") ? candidate : `${candidate}/`);
  } catch {
    throw new Error("Invalid Supabase URL configuration");
  }

  const localHttp =
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname.toLocaleLowerCase("en-US"));

  if (
    (url.protocol !== "https:" && !localHttp) ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== "" ||
    url.pathname !== "/"
  ) {
    throw new Error("Invalid Supabase URL configuration");
  }

  return url;
}

function requiredEnvironmentValue(value: string | undefined): string {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new Error("Missing database configuration");
  }
  return value;
}
