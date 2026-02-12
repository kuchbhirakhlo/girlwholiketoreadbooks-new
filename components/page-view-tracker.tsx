'use client';

import { useEffect, useState } from 'react';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, increment, doc, Timestamp } from 'firebase/firestore';

export default function PageViewTracker(): null {
  const [pathname, setPathname] = useState<string>('');
  const [hasLogged, setHasLogged] = useState(false);

  useEffect(() => {
    // Set initial pathname after mount to avoid hydration mismatch
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    if (!pathname || hasLogged) return;

    const trackView = async (): Promise<void> => {
      // Check if Firebase is configured
      if (!isFirebaseConfigured) {
        console.warn('[PageViewTracker] Firebase not configured - skipping view tracking');
        return;
      }

      try {
        const firestoreDb = await getDbInstance();
        if (!firestoreDb) {
          console.warn('[PageViewTracker] Firestore not available');
          return;
        }
        
        const pageViewsRef = collection(firestoreDb, 'pageViews');
        const today = new Date().toISOString().split('T')[0];
        
        // Track homepage views specifically for "Active Readers" count
        const isHomepage = pathname === '/' || pathname === '/index';
        
        if (isHomepage) {
          // Track homepage views separately
          const homeQuery = query(pageViewsRef, where('date', '==', today), where('page', '==', 'home'));
          const homeSnapshot = await getDocs(homeQuery);
          
          console.log('[PageViewTracker] Tracking homepage view, today:', today);
          
          if (homeSnapshot.empty) {
            console.log('[PageViewTracker] Creating new pageViews doc for today');
            await addDoc(pageViewsRef, {
              date: today,
              page: 'home',
              views: 1,
              createdAt: Timestamp.now()
            });
          } else {
            const docRef = doc(firestoreDb, 'pageViews', homeSnapshot.docs[0].id);
            await updateDoc(docRef, { views: increment(1) });
            console.log('[PageViewTracker] Incremented pageViews');
          }
        }
        
        // Also track general page views
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
        
        setHasLogged(true);
      } catch (error) {
        console.error('[PageViewTracker] Error tracking view:', error);
      }
    };
    
    // Small delay to ensure Firebase is initialized
    const timer = setTimeout(trackView, 500);
    return () => clearTimeout(timer);
  }, [pathname, hasLogged]);

  return null;
}
