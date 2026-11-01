import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, signInWithGoogle, logout } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

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

// User creation must comply with firestore.rules: a new profile can only
// create itself with role === 'user'. Owner privileges are derived separately
// from Firebase's verified email claim, as the Firestore admin rules already do.
const initialProfile = (user: FirebaseUser): UserProfile => ({
  uid: user.uid,
  email: user.email || '',
  displayName: user.displayName || user.email?.split('@')[0] || 'User',
  role: 'user',
  createdAt: Timestamp.now(),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let authGeneration = 0;

    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      const currentGeneration = ++authGeneration;
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Authentication is complete as soon as Firebase confirms the user.
      // Do not make navigation depend on a separate Firestore request.
      const fallback = initialProfile(firebaseUser);
      setProfile(fallback);
      setLoading(false);

      void (async () => {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const existing = await getDoc(userRef);
          if (!existing.exists()) {
            // First-time users, including the verified owner, must be created
            // with the regular role or Firestore denies the write.
            await setDoc(userRef, fallback);
          }
          if (!active || currentGeneration !== authGeneration) return;
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
          // Firestore outages/permissions should not undo valid Google
          // authentication or leave the personal dashboard blank.
          console.error('Unable to synchronize Google user profile:', error);
        }
      })();
    }, error => {
      console.error('Firebase authentication state could not initialize:', error);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      authGeneration++;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await logout();
  }, []);

  const isAdmin = profile?.role === 'admin' ||
    (user?.email?.toLowerCase() === OWNER_EMAIL && user.emailVerified);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    isAdmin: Boolean(isAdmin),
    signIn,
    signOut,
  }), [user, profile, loading, isAdmin, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
