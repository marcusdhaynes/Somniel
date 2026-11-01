import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: any;
}
interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const OWNER_EMAIL = 'marcusdhaynes@gmail.com';

const initialProfile = (user: FirebaseUser): UserProfile => ({
  uid: user.uid,
  email: user.email || '',
  displayName: user.displayName || user.email?.split('@')[0] || 'User',
  role: 'user', // Firestore only permits newly-created profiles with this role.
  createdAt: new Date(), // Firestore encodes Date as a timestamp on write.
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const sdkRef = useRef<typeof import('../firebase') | null>(null);

  useEffect(() => {
    let active = true;
    let generation = 0;
    let unsubscribe: () => void = () => {};

    // The public site paints before loading Firebase's heavier SDK. The login
    // page waits for this subscription to initialize, keeping popup creation
    // synchronous with the user's click in Safari and other strict browsers.
    void Promise.all([
      import('../firebase'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]).then(([sdk, authApi, store]) => {
      if (!active) return;
      sdkRef.current = sdk;
      unsubscribe = authApi.onAuthStateChanged(sdk.auth, firebaseUser => {
        const current = ++generation;
        setUser(firebaseUser);
        if (!firebaseUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const fallback = initialProfile(firebaseUser);
        setProfile(fallback);
        setLoading(false); // Never gate navigation on a separate Firestore read.

        void (async () => {
          try {
            const userRef = store.doc(sdk.db, 'users', firebaseUser.uid);
            const existing = await store.getDoc(userRef);
            if (!existing.exists()) await store.setDoc(userRef, fallback);
            if (!active || current !== generation) return;
            if (existing.exists()) {
              const data = existing.data() as Partial<UserProfile>;
              setProfile({
                ...fallback,
                ...data,
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: data.displayName || fallback.displayName,
                role: data.role === 'admin' ? 'admin' : 'user',
              });
            }
          } catch (error) {
            console.error('Unable to synchronize Google user profile:', error);
          }
        })();
      }, error => {
        console.error('Firebase authentication initialization failed:', error);
        if (active) setLoading(false);
      });
    }).catch(error => {
      console.error('Could not initialize Google sign-in:', error);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      generation++;
      unsubscribe();
      sdkRef.current = null;
    };
  }, []);

  const signIn = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk) throw new Error('Google sign-in has not initialized. Reload and try again.');
    // Direct call is essential: do not await an import before opening OAuth.
    await sdk.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk) throw new Error('Sign-out is unavailable while authentication initializes.');
    await sdk.logout();
  }, []);

  const isAdmin = profile?.role === 'admin' ||
    (user?.email?.toLowerCase() === OWNER_EMAIL && user.emailVerified);

  const value = useMemo(() => ({
    user, profile, loading, isAdmin: Boolean(isAdmin), signIn, signOut,
  }), [user, profile, loading, isAdmin, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
