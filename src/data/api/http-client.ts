/**
 * Minimal HTTP client for the VPS API (see `src/data/api/README.md`).
 *
 * - Speaks HTTP only; never imports Firebase.
 * - Always sends cookies (`credentials: 'include'`) so the admin session
 *   cookie authenticates read-admin (includeInactive), write and media calls.
 * - Translates the backend error envelope
 *   `{ error: { code, message, details } }` into a typed {@link ApiError}
 *   whose `message` is safe to surface in a toast.
 */

import { apiConfig } from '../../config/api';

/**
 * Pendengar global untuk respons `401` (sesi admin habis atau dicabut).
 *
 * `ApiAuthService` mendaftar di sini supaya status login di UI ikut turun
 * begitu API menolak sesi. Tanpa ini, UI tetap menampilkan admin sebagai
 * login dan setiap aksi baru gagal dengan toast sampai halaman di-reload.
 *
 * `POST /auth/login` dikecualikan: `401` di sana berarti password salah,
 * bukan sesi yang berakhir.
 */
const UNAUTHORIZED_EXEMPT_PATHS = ['/auth/login'];

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/** Daftarkan pendengar 401; nilai kembaliannya untuk melepas pendaftaran. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function isUnauthorizedExempt(path: string): boolean {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return UNAUTHORIZED_EXEMPT_PATHS.some(
    (exempt) => normalized === exempt || normalized.startsWith(`${exempt}/`)
  );
}

function notifyUnauthorized(): void {
  for (const listener of unauthorizedListeners) listener();
}

export interface ApiFieldDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiFieldDetail[];

  constructor(
    status: number,
    code: string,
    message: string,
    details: ApiFieldDetail[] = []
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** True when the request was rejected for a missing/expired session. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True when the requested record does not exist. */
  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Query params; `undefined`/`null`/`''` entries are omitted. */
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: ApiRequestOptions['query']): string {
  if (!apiConfig.baseUrl) {
    throw new Error(
      '[api] VITE_API_BASE_URL is not set; cannot reach the API backend.'
    );
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const search = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  // Concatenate instead of `new URL(...)`: the base may be absolute
  // (`https://api.example.com/api/v1`) or relative (`/api/v1`, the production
  // shape where Caddy serves the site and `/api/*` from one origin). A
  // relative base has no origin of its own, so `new URL` would throw.
  return `${apiConfig.baseUrl}${normalized}${qs ? `?${qs}` : ''}`;
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string; details?: ApiFieldDetail[] };
}

function toApiError(status: number, parsed: unknown): ApiError {
  const envelope = (parsed ?? {}) as ErrorEnvelope;
  const code = envelope.error?.code ?? 'http_error';
  const details = envelope.error?.details ?? [];
  const fieldText = details
    .map((detail) => `${detail.field}: ${detail.message}`)
    .join('; ');
  const message =
    fieldText ||
    envelope.error?.message ||
    `Permintaan gagal dengan status ${status}`;
  return new ApiError(status, code, message, details);
}

/**
 * Perform a request and return the parsed JSON body.
 * Returns `undefined` for `204 No Content`.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', query, body, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    // Sesi habis/dicabut di tengah pemakaian: beri tahu lapisan auth dulu
    // supaya UI ikut turun ke keadaan logged-out.
    if (response.status === 401 && !isUnauthorizedExempt(path)) {
      notifyUnauthorized();
    }
    throw toApiError(response.status, parsed);
  }

  return (parsed ?? undefined) as T;
}
