<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f05238cd-8ec5-4740-b243-5ab5bc76c427

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Google sign-in configuration

Somniel signs in using Firebase Authentication with a Google popup. The
web app currently uses the Firebase project configured in
`firebase-applet-config.json`. Verify that this project is the intended
Somniel backend before changing its project ID or API keys.

In the **Firebase Console → Authentication**:

1. Under **Sign-in method**, enable the **Google** provider.
2. Under **Settings → Authorized domains**, add each live hostname where
   visitors sign in: `marcusdhaynes.github.io`, `somniel.com`, and
   `www.somniel.com` if the www hostname is actually served. Do not
   enter schemes, paths, or port numbers.
3. Check the site's Firebase configuration matches that Firebase project.
4. Test sign-in from the real deployed domain (and allow popup windows).

The initial user document is always saved with role `user`, which matches
the checked-in Firestore rules. The verified owner receives admin access
through the verified Firebase email claim; this matches the server-side
Firestore `isAdmin` rule. Do not grant elevated rights from an unverified
email address or client-provided role.

## Google sign-in without authorizing the custom domain

The `somniel.com` and `www.somniel.com` login buttons use Somniel's
existing **authorized** GitHub Pages origin
(`https://marcusdhaynes.github.io/Somniel/auth-bridge`) as a first-party
Google OAuth relay. The user presses **Continue with Google** on Somniel and
then once more in the opened bridge window to start Google's popup.

On successful Google popup authentication, the trusted bridge returns only
the Google credential to the exact calling origin via `postMessage`. The
caller checks the source window, sender origin and unique one-time nonce,
then calls `signInWithCredential` to establish its **own** Firebase session.
No credentials are included in URLs, local storage, or logs. The relay
only accepts `somniel.com` and `www.somniel.com` as return origins.

The relay needs GitHub Pages to remain hosted at
`marcusdhaynes.github.io` and already authorized in Firebase. It uses a
popup window for Google authentication, so browsers must permit popups for
the two Somniel origins; certain isolated/mobile browser contexts may still
restrict popup-to-opener communication. The preferred long-term solution is
to authorize the custom domain directly when Firebase console access exists.
