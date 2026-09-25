import { Auth, getAuth } from 'firebase/auth';
import { getFirebaseApp } from './firebase';

let auth: Auth | null = null;

export function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
