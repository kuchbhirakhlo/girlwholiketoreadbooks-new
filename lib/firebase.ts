import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

// Check if Firebase config is complete BEFORE importing Firebase modules
export const isFirebaseConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

// Only import Firebase if configured
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _initialized = false;

const initializeFirebase = async () => {
  // Don't initialize if already attempted or config not complete
  if (_initialized || !isFirebaseConfigured) {
    if (!isFirebaseConfigured) {
      console.warn('[v0] Firebase not configured. Please add environment variables.');
    }
    return;
  }

  _initialized = true;

  try {
    // Dynamically import Firebase modules only when needed
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    };

    // Validate config before initializing
    if (!firebaseConfig.projectId) {
      throw new Error('Firebase projectId is required');
    }

    if (getApps().length === 0) {
      _app = initializeApp(firebaseConfig);
    } else {
      _app = getApps()[0];
    }

    // Only try to initialize auth if app was created successfully
    if (_app) {
      try {
        _auth = getAuth(_app);
        _db = getFirestore(_app);
        _storage = getStorage(_app);
      } catch (authError) {
        console.error('[v0] Error initializing Firebase services:', authError);
        // Continue without these services
      }
    }
  } catch (error) {
    console.error('[v0] Firebase initialization error:', error);
    _initialized = false;
    _auth = null;
    _db = null;
    _storage = null;
  }
};

export const getApp = async (): Promise<FirebaseApp | null> => {
  if (!_app && !_initialized) {
    await initializeFirebase();
  }
  return _app;
};

export const getAuthInstance = async (): Promise<Auth | null> => {
  if (!_auth) {
    if (!_initialized) {
      await initializeFirebase();
    }
    // If still null after initialization attempt, try one more time
    if (!_auth && _initialized) {
      await initializeFirebase();
    }
  }
  return _auth;
};

export const getDbInstance = async (): Promise<Firestore | null> => {
  if (!_db) {
    if (!_initialized) {
      await initializeFirebase();
    }
    // If still null after initialization attempt, try one more time
    if (!_db && _initialized) {
      await initializeFirebase();
    }
  }
  return _db;
};

export const getStorageInstance = async (): Promise<FirebaseStorage | null> => {
  if (!_storage && !_initialized) {
    await initializeFirebase();
  }
  return _storage;
};
