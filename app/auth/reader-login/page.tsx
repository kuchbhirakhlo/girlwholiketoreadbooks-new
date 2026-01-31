'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuthInstance, getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen } from 'lucide-react';

export default function ReaderLoginPage() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in as a reader
    const checkAuth = async () => {
      if (!isFirebaseConfigured) {
        setInitializing(false);
        return;
      }

      try {
        const authInstance = await getAuthInstance();
        const dbInstance = await getDbInstance();
        
        if (!authInstance || !dbInstance) {
          setInitializing(false);
          return;
        }

        const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
          if (firebaseUser) {
            // Check if user is a reader
            const userDoc = await getDoc(doc(dbInstance, 'users', firebaseUser.uid));
            const userData = userDoc.data();
            const role = userData?.role;

            if (role === 'reader') {
              // Already logged in as reader, redirect to browse
              router.push('/browse');
              return;
            }
          }
          setInitializing(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Auth check error:', err);
        setInitializing(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      alert('Firebase is not configured');
      return;
    }

    setLoading(true);

    try {
      const authInstance = await getAuthInstance();
      const dbInstance = await getDbInstance();

      if (!authInstance || !dbInstance) {
        alert('Authentication service unavailable');
        setLoading(false);
        return;
      }

      // Sign in with Google
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(authInstance, provider);
      const firebaseUser = userCredential.user;

      // Check if user document exists, if not create one with reader role
      const userDoc = await getDoc(doc(dbInstance, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(dbInstance, 'users', firebaseUser.uid), {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'reader',
          createdAt: new Date().toISOString(),
        });
      }

      // Redirect to browse page
      router.push('/browse');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show error
      } else {
        alert(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Welcome, Reader!</h1>
          <p className="text-muted-foreground mt-2">Sign in to save your favorite reviews</p>
        </div>

        {/* Reader Login Card */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8">
          <div className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground text-sm">As a reader, you can:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Save your favorite book reviews
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Like reviews you enjoy
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Leave comments on reviews
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © {new Date().getFullYear()} Book Review Platform
        </p>
      </div>
    </div>
  );
}
