import type { z } from "zod/mini";

/** Schemas are imported lazily, so zod never lands in first-load JS; responses are still validated. */
type Schemas = typeof import("./schemas");
type SchemaPick<T extends z.ZodMiniType> = (s: Schemas) => T;
const loadSchemas = () => import("./schemas");

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
export const MOCKING = process.env.NEXT_PUBLIC_API_MOCKING !== "disabled";

/** Cookie the mock session lives in. Only used while MOCKING; the real API uses httpOnly JWT cookies. */
export const MOCK_SESSION_COOKIE = "cf_mock_session";

const isServer = typeof window === "undefined";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | string[] | undefined | null>;

export interface RequestOptions<T extends z.ZodMiniType> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  /** Picks the response schema, e.g. `(s) => s.problemSchema`. */
  schema?: SchemaPick<T>;
  signal?: AbortSignal;
  /**
   * Server-side only: the incoming request's Cookie header, forwarded so the
   * Django session/JWT cookies reach the API during SSR. Pass from next/headers.
   */
  cookie?: string;
  /** ISR revalidation window for server fetches, in seconds. */
  revalidate?: number | false;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}/api${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) url.searchParams.set(key, value.join(","));
    } else url.searchParams.set(key, String(value));
  }
  return url;
}

function readCookie(name: string) {
  if (isServer) return undefined;
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

async function send(url: URL, init: RequestInit, opts: { cookie?: string; revalidate?: number | false }) {
  if (MOCKING) {
    const headers = new Headers(init.headers);
    // Browsers drop a manual Cookie header, so the mock session travels in its own header.
    const session = isServer
      ? opts.cookie?.match(new RegExp(`${MOCK_SESSION_COOKIE}=([^;]+)`))?.[1]
      : readCookie(MOCK_SESSION_COOKIE);
    if (session) headers.set("x-mock-session", session);
    const [{ getResponse }, { handlers }] = await Promise.all([import("msw"), import("@/mocks/handlers")]);
    const res = await getResponse(handlers, new Request(url, { ...init, headers }));
    return res ?? new Response(JSON.stringify({ code: "not_found", message: "No mock handler" }), { status: 404 });
  }

  const headers = new Headers(init.headers);
  if (isServer && opts.cookie) headers.set("cookie", opts.cookie);
  if (!isServer && init.method && init.method !== "GET") {
    const csrf = readCookie("csrftoken");
    if (csrf) headers.set("X-CSRFToken", decodeURIComponent(csrf));
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    // Personalised (cookie-bearing) server requests are never cached.
    ...(isServer ? (opts.cookie ? { cache: "no-store" as const } : { next: { revalidate: opts.revalidate ?? 60 } }) : {}),
  });
}

const NO_REFRESH = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]);
let refreshing: Promise<boolean> | null = null;

/** One refresh at a time; concurrent 401s wait for the same attempt. */
function refreshSession() {
  refreshing ??= send(buildUrl("/auth/refresh"), { method: "POST" }, {})
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function request<T extends z.ZodMiniType>(
  path: string,
  opts: RequestOptions<T> = {},
): Promise<z.infer<T>> {
  const url = buildUrl(path, opts.query);
  const init: RequestInit = {
    method: opts.method ?? "GET",
    signal: opts.signal,
    headers: { Accept: "application/json", ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  };

  let res = await send(url, init, opts);

  // Access token expired: refresh once (browser only — the server can't set cookies here), then retry.
  if (res.status === 401 && !isServer && !NO_REFRESH.has(path)) {
    if (await refreshSession()) res = await send(url, init, opts);
  }

  if (!res.ok) {
    const raw = await res.json().catch(() => null);
    const parsed = (await loadSchemas()).apiErrorSchema.safeParse(raw);
    throw parsed.success
      ? new ApiError(res.status, parsed.data.code, parsed.data.message, parsed.data.fields)
      : new ApiError(res.status, "http_error", `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as z.infer<T>;
  const json: unknown = await res.json();
  return opts.schema ? opts.schema(await loadSchemas()).parse(json) : (json as z.infer<T>);
}
