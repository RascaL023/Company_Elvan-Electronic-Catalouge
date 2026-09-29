import { useRouteError } from 'react-router-dom';
import { ErrorState } from '../components/feedback/ErrorState';
import { clearChunkReloadFlags, isChunkLoadError } from './lazyWithReload';

/**
 * Route-level error UI (see the `errorElement` entries in `router.tsx`).
 * Chunk-load failures (stale hashed asset after a deploy) get a reload
 * action; the one-time auto-reload in `lazyWithReload` already ran by the
 * time this renders, so this is the manual fallback. All other errors
 * render their message with the same retry affordance.
 */
export function RouteErrorElement() {
  const error = useRouteError();

  if (isChunkLoadError(error)) {
    return (
      <ErrorState
        message="This page failed to load. A new version may be available or the connection dropped."
        onRetry={() => {
          clearChunkReloadFlags();
          window.location.reload();
        }}
      />
    );
  }

  const message =
    error instanceof Error && error.message
      ? error.message
      : 'Unexpected Application Error!';
  return (
    <ErrorState
      message={message}
      onRetry={() => window.location.reload()}
    />
  );
}
