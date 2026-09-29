/**
 * Application-level authentication contract.
 *
 * Feature code (hooks, pages, layouts) must depend on these domain
 * concepts only — never on Firebase Auth SDK types. The current
 * implementation is `FirebaseAuthService` (`src/data/firebase/`);
 * a future backend-session adapter can replace it without touching
 * the UI (see issue #1).
 */
export interface AuthUser {
  uid: string;
  email: string | null;
}

export interface AuthService {
  /**
   * Subscribe to session changes. The returned function unsubscribes.
   * Implementations must invoke the callback asynchronously at least
   * once with the current session (user or null).
   */
  onSessionChange(callback: (user: AuthUser | null) => void): () => void;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}
