'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getAuthInstance, getDbInstance, isFirebaseConfigured } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export type UserRole = 'admin' | 'editor' | 'reader';

export interface AuthUser extends User {
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase isn't configured, don't try to initialize auth
    if (!isFirebaseConfigured) {
      console.warn('[v0] Firebase not configured - auth disabled');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const setupAuth = async () => {
      try {
        const authInstance = await getAuthInstance();
        const dbInstance = await getDbInstance();

        if (!authInstance || !dbInstance) {
          console.warn('[v0] Auth or DB not initialized - continuing without auth');
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              // Fetch user role from Firestore
              const userDoc = await getDoc(doc(dbInstance, 'users', firebaseUser.uid));
              const userData = userDoc.data();
              
              if (isMounted) {
                setUser({
                  ...firebaseUser,
                  role: userData?.role || 'reader',
                });
              }
            } else {
              if (isMounted) {
                setUser(null);
              }
            }
          } catch (error) {
            console.error('[v0] Error fetching user data:', error);
            if (isMounted) {
              setUser(firebaseUser ? { ...firebaseUser, role: 'reader' } : null);
            }
          }
          if (isMounted) {
            setLoading(false);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('[v0] Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    let unsubscribe: (() => void) | undefined;
    setupAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase not configured');
    }
    const authInstance = await getAuthInstance();
    if (!authInstance) {
      throw new Error('Firebase auth not initialized');
    }
    try {
      const result = await createUserWithEmailAndPassword(authInstance, email, password);
      // User role is set by Firestore trigger or API in production
      setUser({
        ...result.user,
        role: 'reader',
      });
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase not configured');
    }
    const authInstance = await getAuthInstance();
    if (!authInstance) {
      throw new Error('Firebase auth not initialized');
    }
    try {
      await signInWithEmailAndPassword(authInstance, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase not configured');
    }
    const authInstance = await getAuthInstance();
    if (!authInstance) {
      throw new Error('Firebase auth not initialized');
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(authInstance, provider);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    const authInstance = await getAuthInstance();
    if (!isFirebaseConfigured || !authInstance) {
      setUser(null);
      return;
    }
    try {
      await signOut(authInstance);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  // If Firebase isn't configured or we're outside the AuthProvider, return a safe default
  if (context === undefined) {
    if (!isFirebaseConfigured) {
      return {
        user: null,
        loading: false,
        signUp: async () => { throw new Error('Firebase not configured'); },
        signIn: async () => { throw new Error('Firebase not configured'); },
        signInWithGoogle: async () => { throw new Error('Firebase not configured'); },
        logout: async () => { throw new Error('Firebase not configured'); },
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
