import { lazy } from 'react';

/**
 * One-time hard reload for stale code-split chunks.
 *
 * Context: hashed chunks under `/assets/**` are served immutable with a
 * 1-year cache, while Firebase Hosting only keeps the latest deploy's
 * files. A visitor holding a cached entry chunk from a previous deploy
 * will request a chunk hash that no longer exists; Hosting answers with
 * `index.html` (SPA rewrite) and the dynamic `import()` fails.
 *
 * `lazyWithReload` is a drop-in replacement for `React.lazy` that reloads
 * the page exactly once per stale chunk (guarded via `sessionStorage`),
 * so the browser picks up the fresh entry chunk. Successful imports and
 * non-chunk errors are never reloaded — normal navigation stays
 * refresh-free. If the reload still fails, the error propagates to the
 * route `errorElement`.
 */
const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError/i;

const FLAG_PREFIX = 'chunk-reload:';

/** True only for code-split chunk load failures (never data errors). */
export function isChunkLoadError(error: unknown): boolean {
  let message: string;
  if (error instanceof Error) {
    message = `${error.message} ${String((error as { code?: unknown }).code ?? '')}`;
  } else if (typeof error === 'object' && error !== null) {
    message = `${String((error as { message?: unknown }).message ?? '')} ${String((error as { code?: unknown }).code ?? '')}`;
  } else {
    message = String(error ?? '');
  }
  return CHUNK_ERROR_PATTERN.test(message);
}

/**
 * Guard key per stale chunk (derived from the failed `.js` URL), so each
 * distinct stale chunk triggers at most one reload per tab. Future deploys
 * produce new hashes, hence fresh keys.
 */
export function getChunkReloadKey(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const url = message.match(/https?:\/\/[^\s)'"]+\.js/)?.[0];
  return `${FLAG_PREFIX}${url ?? 'unknown'}`;
}

function alreadyReloaded(key: string): boolean {
  try {
    return sessionStorage.getItem(key) !== null;
  } catch {
    // Storage unavailable: do not reload, avoids unguarded loops.
    return true;
  }
}

function markReloaded(key: string): void {
  try {
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // Ignore (private mode); the reload still happens once per failure.
  }
}

/** Clears chunk-reload guards (used by the manual retry button). */
export function clearChunkReloadFlags(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(FLAG_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Ignore.
  }
}

/** Drop-in `lazy()` that hard-reloads once on stale-chunk failures. */
export function lazyWithReload(
  importer: () => Promise<{ default: React.ComponentType<unknown> }>
) {
  return lazy(() =>
    importer().catch((error: unknown) => {
      if (!isChunkLoadError(error)) throw error;
      const key = getChunkReloadKey(error);
      if (alreadyReloaded(key)) throw error;
      markReloaded(key);
      window.location.reload();
      return new Promise<never>(() => {});
    })
  );
}
