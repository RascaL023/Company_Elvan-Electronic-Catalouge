/**
 * `AuthService` backed by the VPS API session cookie.
 *
 * The backend sets an HttpOnly cookie on login; `onSessionChange` resolves the
 * current session with `GET /auth/me` (401 → logged out) and re-emits on
 * login/logout. `AuthUser.uid` is the backend admin id.
 *
 * No Firebase import — the Firebase adapter stays available in
 * `src/data/firebase/firebase-auth.adapter.ts`.
 */

import type {
  AuthService,
  AuthUser,
} from '../../core/auth/auth-service';
import { apiRequest, ApiError, onUnauthorized } from './http-client';
import type { AdminDto, SessionDto } from './mappers';

function toAuthUser(admin: AdminDto): AuthUser {
  return { uid: admin.id, email: admin.email || null };
}

export class ApiAuthService implements AuthService {
  private listeners = new Set<(user: AuthUser | null) => void>();
  private current: AuthUser | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Sesi bisa berakhir di tengah pemakaian (TTL habis atau dicabut): begitu
    // ada 401 dari endpoint selain login, UI langsung diturunkan ke keadaan
    // logged-out. Pendaftaran ini berumur sepanjang umur halaman — service-nya
    // singleton dari composition root, jadi tidak perlu dilepas.
    onUnauthorized(() => {
      if (this.current) this.emit(null);
    });
  }

  onSessionChange(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback);

    if (!this.initPromise) {
      // First subscriber triggers the initial `me` lookup; everyone is
      // notified once it resolves.
      this.initPromise = this.refresh();
    } else {
      // Contract: the callback must be invoked asynchronously at least once.
      void Promise.resolve().then(() => callback(this.current));
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  async login(email: string, password: string): Promise<void> {
    const session = await apiRequest<SessionDto>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.emit(toAuthUser(session.admin));
  }

  async logout(): Promise<void> {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
    this.emit(null);
  }

  private async refresh(): Promise<void> {
    try {
      const admin = await apiRequest<AdminDto>('/auth/me');
      this.emit(toAuthUser(admin));
    } catch (error) {
      // 401 (no session) and transient errors both start the UI logged out;
      // an admin call that still fails later surfaces through its own error.
      if (!(error instanceof ApiError)) {
        console.warn('[api-auth] gagal memeriksa sesi:', error);
      }
      this.emit(null);
    }
  }

  private emit(user: AuthUser | null): void {
    this.current = user;
    for (const listener of this.listeners) listener(user);
  }
}
