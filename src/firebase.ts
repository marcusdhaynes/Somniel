import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firebase OAuth popup checks its calling domain against Firebase's allowlist.
// Somniel's GitHub Pages origin is already authorized, but somniel.com is not.
// On the custom domain use that trusted first-party origin to complete Google
// OAuth and securely relay the Google credential to this page (never via URL).
export const AUTH_BRIDGE_ORIGIN = 'https://marcusdhaynes.github.io';
export const AUTH_BRIDGE_PATH = '/Somniel/auth-bridge';
export const AUTH_BRIDGE_MESSAGE = 'somniel:google-credential:v1';
export const AUTH_ALLOWED_RETURN_ORIGINS = [
  'https://somniel.com',
  'https://www.somniel.com',
] as const;

function bridgeSignIn(): Promise<import('firebase/auth').User> {
  const origin = window.location.origin;
  if (!(AUTH_ALLOWED_RETURN_ORIGINS as readonly string[]).includes(origin)) {
    return Promise.reject(new Error('Google sign-in is not supported from this origin.'));
  }

  const state = window.crypto.randomUUID();
  const bridgeUrl = new URL(AUTH_BRIDGE_PATH, AUTH_BRIDGE_ORIGIN);
  bridgeUrl.searchParams.set('state', state);
  bridgeUrl.searchParams.set('origin', origin);

  // Must open synchronously inside the login click to avoid popup blocking.
  const popup = window.open(bridgeUrl.toString(), '_blank', 'popup=yes,width=520,height=700');
  if (!popup) {
    return Promise.reject(Object.assign(new Error('Allow pop-ups for Somniel and try again.'), {
      code: 'auth/popup-blocked',
    }));
  }
  popup.focus();

  return new Promise((resolve, reject) => {
    let receivedCredential = false;
    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(checkClosed);
      window.clearTimeout(deadline);
      if (!popup.closed) popup.close();
    };
    const fail = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== AUTH_BRIDGE_ORIGIN || event.source !== popup) return;
      const data = event.data;
      if (!data || data.type !== AUTH_BRIDGE_MESSAGE || data.state !== state) return;
      if (receivedCredential) return;

      if (data.error) {
        fail(Object.assign(new Error(String(data.error).slice(0, 250)), {
          code: typeof data.code === 'string' ? data.code : 'auth/internal-error',
        }));
        return;
      }

      const idToken = typeof data.idToken === 'string' ? data.idToken : undefined;
      const accessToken = typeof data.accessToken === 'string' ? data.accessToken : undefined;
      if (!idToken && !accessToken) {
        fail(new Error('Google did not return an authentication credential. Try again.'));
        return;
      }
      receivedCredential = true;
      // This API exchanges an actual Google credential with Firebase for the
      // custom site's session; unlike popup OAuth it does not require the
      // calling hostname to be on the OAuth popup authorized-domain list.
      void signInWithCredential(auth, GoogleAuthProvider.credential(idToken, accessToken))
        .then(result => {
          cleanup();
          resolve(result.user);
        })
        .catch(error => fail(error instanceof Error ? error : new Error(String(error))));
    };

    window.addEventListener('message', onMessage);
    const checkClosed = window.setInterval(() => {
      if (!receivedCredential && popup.closed) {
        fail(Object.assign(new Error('Google sign-in was cancelled.'), { code: 'auth/popup-closed-by-user' }));
      }
    }, 500);
    const deadline = window.setTimeout(() => {
      fail(new Error('Google sign-in timed out. Please try again.'));
    }, 180000);
  });
}

// Auth Helpers
export const signInWithGoogle = async () => {
  if ((AUTH_ALLOWED_RETURN_ORIGINS as readonly string[]).includes(window.location.origin)) {
    return bridgeSignIn();
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logout = () => signOut(auth);

// Activity Logging Helper
export const logActivity = async (action: string, details: string) => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      action,
      details,
      userEmail: auth.currentUser?.email || 'Unknown',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
