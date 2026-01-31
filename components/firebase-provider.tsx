'use client';

import React from "react"

import { isFirebaseConfigured } from '@/lib/firebase';
import { AuthProvider } from '@/lib/auth-context';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  // Only render AuthProvider if Firebase is properly configured
  // Otherwise, render children without auth context
  if (!isFirebaseConfigured) {
    return <>{children}</>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
