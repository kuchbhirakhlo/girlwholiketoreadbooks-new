'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getAuthInstance, getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, BookOpen } from 'lucide-react';

type UserRole = 'admin' | 'editor' | 'reader';

interface AuthUser extends User {
  role?: UserRole;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in with valid role
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
            // Fetch user role from Firestore
            const userDoc = await getDoc(doc(dbInstance, 'users', firebaseUser.uid));
            const userData = userDoc.data();
            const role = userData?.role as UserRole | undefined;

            if (role === 'admin' || role === 'editor') {
              // User is already authenticated with valid role, redirect
              router.push(role === 'admin' ? '/admin' : '/editor');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!isFirebaseConfigured) {
      setError('Firebase is not configured');
      return;
    }

    setLoading(true);

    try {
      const authInstance = await getAuthInstance();
      const dbInstance = await getDbInstance();

      if (!authInstance || !dbInstance) {
        setError('Authentication service unavailable');
        setLoading(false);
        return;
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(dbInstance, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      const role = userData?.role as UserRole | undefined;

      // Validate role - only admin and editor are allowed
      if (!role || (role !== 'admin' && role !== 'editor')) {
        // Sign out unauthorized user
        await authInstance.signOut();
        setError('Access denied. Your account does not have admin or editor privileges.');
        setLoading(false);
        return;
      }

      // Redirect based on role
      router.push(role === 'admin' ? '/admin' : '/editor');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError(err.message || 'Failed to sign in');
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
          <h1 className="font-serif text-3xl font-bold text-foreground"> Login</h1>
          <p className="text-muted-foreground mt-2">Sign in to access the book review portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-background border-border"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-background border-border"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © {new Date().getFullYear()} Book Review Platform. Staff access only.
        </p>
      </div>
    </div>
  );
}
