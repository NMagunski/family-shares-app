import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

type ExtendedUser = User & {
  isAdmin?: boolean;
};

type AuthContextValue = {
  user: ExtendedUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const request = ++generation;
      setLoading(true);
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        let snapshot = await getDoc(userRef);

        // Ако няма документ → създаваме базов
        if (!snapshot.exists()) {
          await setDoc(
            userRef,
            {
              email: firebaseUser.email ?? '',
              createdAt: serverTimestamp(),
              isAdmin: false,
            },
            { merge: true }
          );
          snapshot = await getDoc(userRef);
        }

        // 👉 Винаги обновяваме lastLogin
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );

        // четем актуалните данни
        snapshot = await getDoc(userRef);
        const data = snapshot.data() || {};
        const claims = await firebaseUser.getIdTokenResult();
        const isAdmin = claims.claims.admin === true;
        void data;

        const extendedUser = firebaseUser as ExtendedUser;
        extendedUser.isAdmin = isAdmin;
        if (request !== generation) return;
        setUser(extendedUser);
      } catch (err) {
        console.error('Error loading user profile:', err);
        if (request === generation) setUser(firebaseUser as ExtendedUser);
      } finally {
        if (request === generation) setLoading(false);
      }
    });

    return () => { generation++; unsubscribe(); };
  }, []);

  async function logout() {
    await signOut(auth);
  }

  const value: AuthContextValue = { user, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
