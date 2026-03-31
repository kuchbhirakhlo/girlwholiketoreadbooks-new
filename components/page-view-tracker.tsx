'use client';

import { useEffect, useState } from 'react';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, increment, doc, Timestamp } from 'firebase/firestore';

export default function PageViewTracker(): null {
  const [pathname, setPathname] = useState<string>('');

  useEffect(() => {
    // Set initial pathname after mount to avoid hydration mismatch
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    if (!pathname) return;

    const trackView = async (): Promise<void> => {
      // Check if Firebase is configured
      if (!isFirebaseConfigured) return;

      try {
        const firestoreDb = await getDbInstance();
        if (!firestoreDb) return;
        
        const pageViewsRef = collection(firestoreDb, 'pageViews');
        const today = new Date().toISOString().split('T')[0];
        
        // Track general page views only (not homepage for "active readers" count)
        // The active readers count now comes from unique users in favorites/comments
        const q = query(pageViewsRef, where('date', '==', today), where('page', '==', 'all'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          await addDoc(pageViewsRef, {
            date: today,
            page: 'all',
            views: 1,
            createdAt: Timestamp.now()
          });
        } else {
          const docRef = doc(firestoreDb, 'pageViews', snapshot.docs[0].id);
          await updateDoc(docRef, { views: increment(1) });
        }
      } catch {
        // Silently handle errors
      }
    };
    
    // Small delay to ensure Firebase is initialized
    const timer = setTimeout(trackView, 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
