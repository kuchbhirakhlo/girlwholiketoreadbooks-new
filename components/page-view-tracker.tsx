'use client';

import { useEffect } from 'react';
import { getDbInstance } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, increment, doc, Timestamp } from 'firebase/firestore';

export default function PageViewTracker() {
  useEffect(() => {
    const trackView = async () => {
      try {
        const firestoreDb = await getDbInstance();
        if (!firestoreDb) return;
        
        const pageViewsRef = collection(firestoreDb, 'pageViews');
        const today = new Date().toISOString().split('T')[0];
        
        const q = query(pageViewsRef, where('date', '==', today));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          await addDoc(pageViewsRef, {
            date: today,
            views: 1,
            createdAt: Timestamp.now()
          });
        } else {
          const docRef = doc(firestoreDb, 'pageViews', snapshot.docs[0].id);
          await updateDoc(docRef, { views: increment(1) });
        }
      } catch (error) {
        // Silently handle error
      }
    };
    
    // Small delay to ensure Firebase is initialized
    const timer = setTimeout(trackView, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
