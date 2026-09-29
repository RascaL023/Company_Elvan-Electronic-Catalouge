import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getAuthInstance } from '../../config/firebaseAuth';
import type {
  AuthService,
  AuthUser,
} from '../../core/auth/auth-service';

/**
 * Firebase-backed `AuthService` (current implementation).
 *
 * This is the only non-config place allowed to touch the Firebase Auth
 * SDK. It translates Firebase sessions into the application-level
 * `AuthUser` DTO so the UI never sees Firebase types.
 */
function toAuthUser(user: FirebaseUser): AuthUser {
  return { uid: user.uid, email: user.email };
}

export class FirebaseAuthService implements AuthService {
  onSessionChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(getAuthInstance(), (user) => {
      callback(user ? toAuthUser(user) : null);
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(getAuthInstance(), email, password);
  }

  async logout(): Promise<void> {
    await signOut(getAuthInstance());
  }
}
