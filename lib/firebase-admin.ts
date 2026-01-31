import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminDb: ReturnType<typeof getFirestore> | null = null;
let initAttempted = false;

export const initAdmin = (): ReturnType<typeof getFirestore> | null => {
  if (adminDb) return adminDb;
  if (initAttempted) return null;
  
  initAttempted = true;
  
  try {
    // Only initialize if we have environment variables set
    if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      const { cert } = require('firebase-admin/app');
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      
      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: projectId ? `https://${projectId}.firebaseio.com` : undefined,
      });
      adminDb = getFirestore(app);
      return adminDb;
    }
  } catch (error) {
    console.warn('Firebase Admin SDK initialization skipped:', error);
  }
  
  return null;
};

export const getAdminDb = (): ReturnType<typeof getFirestore> | null => {
  return initAdmin();
};
