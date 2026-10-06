/**
 * API backend configuration.
 *
 * Env boundary: this is one of the few places allowed to read
 * `import.meta.env` (see docs/ARCHITECTURE.md and scripts/check-boundaries.sh).
 *
 * The migration to the VPS backend is **staged**, so the switch is split per
 * concern instead of a single on/off:
 *
 * - `VITE_API_BASE_URL`  base URL of the API (e.g. `/api/v1` in production,
 *                        `http://localhost:8080/api/v1` in dev). Empty means
 *                        "API disabled" → Firebase stays the backend.
 * - `VITE_AUTH_BACKEND`  `firebase` | `api`. Default when a base URL is set:
 *                        `api`. Set to `firebase` to keep Firebase Auth while
 *                        the rest already runs on the API.
 * - `VITE_MEDIA_BACKEND` `firebase` | `api`. Same default rule. Set to
 *                        `firebase` to keep uploading through the legacy
 *                        ImageKit signature endpoint (Cloudflare Worker) while
 *                        data/auth already run on the API.
 *
 * Switching a concern is an env change only — both implementations stay in the
 * repo, and flipping the value back is an instant rollback.
 */

export type BackendMode = 'firebase' | 'api';

export interface ApiConfig {
  /** Normalized base URL without a trailing slash ('' when the API is off). */
  baseUrl: string;
  authBackend: BackendMode;
  mediaBackend: BackendMode;
}

function read(key: string): string {
  return (import.meta.env as Record<string, string | undefined>)[key] ?? '';
}

function parseMode(raw: string): BackendMode | null {
  const value = raw.trim().toLowerCase();
  if (value === 'firebase' || value === 'api') return value;
  return null; // unset or unrecognised → follow the base URL
}

const baseUrl = read('VITE_API_BASE_URL').trim().replace(/\/+$/, '');
const apiEnabled = baseUrl !== '';

function resolveMode(overrideKey: string): BackendMode {
  // Without a base URL the API cannot be reached, so the concern must stay on
  // Firebase regardless of the override.
  if (!apiEnabled) return 'firebase';
  return parseMode(read(overrideKey)) ?? 'api';
}

export const apiConfig: ApiConfig = {
  baseUrl,
  authBackend: resolveMode('VITE_AUTH_BACKEND'),
  mediaBackend: resolveMode('VITE_MEDIA_BACKEND'),
};

/** True when an API base URL is configured. */
export const isApiEnabled = apiEnabled;
