import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  auth, googleProvider,
  AUTH_ALLOWED_RETURN_ORIGINS, AUTH_BRIDGE_MESSAGE, AUTH_BRIDGE_ORIGIN,
} from '../../firebase';

// This page exists ONLY on the authorized, first-party GitHub Pages domain.
// No credentials are placed in a URL, written to storage, or sent to other sites.
const AuthBridge: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state') || '';
  const returnOrigin = params.get('origin') || '';
  const trustedCaller =
    window.location.origin === AUTH_BRIDGE_ORIGIN &&
    (AUTH_ALLOWED_RETURN_ORIGINS as readonly string[]).includes(returnOrigin) &&
    /^[0-9a-f-]{36}$/i.test(state) &&
    !!window.opener;
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const continueWithGoogle = async () => {
    if (!trustedCaller || working) return;
    setError('');
    setWorking(true);
    try {
      // This popup originates from GitHub Pages, an already-authorized host.
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.idToken && !credential?.accessToken) {
        throw new Error('Google did not provide a usable sign-in credential.');
      }

      // postMessage enforces the exact trusted destination origin, while the
      // calling site separately checks source window, origin, and state nonce.
      window.opener.postMessage({
        type: AUTH_BRIDGE_MESSAGE,
        state,
        idToken: credential.idToken,
        accessToken: credential.accessToken,
      }, returnOrigin);
      setDone(true);
      window.setTimeout(() => window.close(), 1500);
    } catch (cause) {
      const code = cause && typeof cause === 'object' && 'code' in cause
        ? String(cause.code) : 'auth/internal-error';
      const message = code === 'auth/popup-blocked'
        ? 'Please allow pop-ups for this page and try again.'
        : code === 'auth/popup-closed-by-user'
          ? 'Google sign-in was cancelled. Try again.'
          : 'Unable to connect to Google (' + code + '). Try again.';
      setError(message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-fg">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 font-serif text-xl font-bold text-accent">S</div>
        <h1 className="font-serif text-2xl font-bold">Somniel Google Sign-In</h1>
        {!trustedCaller ? (
          <p role="alert" className="mt-4 text-sm text-muted">
            This secure sign-in window must be opened from the Somniel website.
            Return to somniel.com and select Continue with Google.
          </p>
        ) : done ? (
          <p role="status" className="mt-5 text-sm text-muted">
            Sign-in completed. You can return to Somniel; this window will close.
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Complete Google sign-in on this authorized Somniel page.
              Your Somniel tab will sign in automatically.
            </p>
            <button
              type="button"
              disabled={working}
              onClick={continueWithGoogle}
              className="mt-6 w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-bg hover:opacity-90 disabled:opacity-60"
            >
              {working ? 'Connecting to Google...' : 'Continue with Google'}
            </button>
            {error && <p role="alert" className="mt-4 text-sm text-red-500">{error}</p>}
          </>
        )}
      </div>
    </main>
  );
};

export default AuthBridge;
