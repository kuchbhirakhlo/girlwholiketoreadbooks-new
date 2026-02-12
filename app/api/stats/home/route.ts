import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, Timestamp, addDoc, updateDoc, increment, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase is properly configured
const isFirebaseConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
);

let dbInstance: any = null;

function getDb() {
  if (dbInstance) return dbInstance;
  
  try {
    if (!isFirebaseConfigured) {
      console.warn('[Stats API] Firebase not configured');
      return null;
    }
    
    const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.error('[Stats API] Error initializing Firestore:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  console.log('[Stats API] Fetching homepage stats...');
  
  const firestoreDb = getDb();
  
  // Default response
  const responseData = {
    stats: {
      totalReviews: 0,
      activeUsers: 0,
      averageRating: '4.9',
      totalGenres: 0,
      topGenres: [] as { name: string; count: number }[],
    },
  };

  // If Firestore is not available, return defaults
  if (!firestoreDb) {
    console.warn('[Stats API] Firestore not available, returning defaults');
    return NextResponse.json(responseData);
  }

  try {
    // Fetch published posts count
    const postsQuery = query(
      collection(firestoreDb, 'posts'),
      where('status', '==', 'published')
    );
    const postsSnapshot = await getDocs(postsQuery);
    const totalReviews = postsSnapshot.size;
    console.log('[Stats API] Total reviews:', totalReviews);

    // Calculate average rating from published posts
    let totalRating = 0;
    let ratingCount = 0;
    const genreCounts: Record<string, number> = {};
    
    postsSnapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      
      if (data.rating) {
        totalRating += data.rating;
        ratingCount++;
      }
      
      // Count genres
      if (data.genre) {
        const genres = Array.isArray(data.genre) ? data.genre : [data.genre];
        genres.forEach((g: string) => {
          const genreKey = g.trim();
          genreCounts[genreKey] = (genreCounts[genreKey] || 0) + 1;
        });
      }
    });

    // Use calculated rating or default to 4.9
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '4.9';
    const totalGenres = Object.keys(genreCounts).length;
    
    // Get top genres sorted by count
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Get homepage views for "active readers" - count increases on each visit/refresh
    let activeUsers = 0;
    try {
      const pageViewsRef = collection(firestoreDb, 'pageViews');
      const today = new Date().toISOString().split('T')[0];
      
      // Get homepage-specific views (increases on each visit/refresh)
      const homeQuery = query(pageViewsRef, where('page', '==', 'home'));
      const homeSnapshot = await getDocs(homeQuery);
      
      console.log('[Stats API] Found', homeSnapshot.size, 'pageViews docs');
      
      homeSnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        console.log('[Stats API] PageViews doc:', data.date, '- views:', data.views);
        if (data.date === today) {
          activeUsers = data.views || 0;
        }
      });
      
      console.log('[Stats API] Active users for today:', activeUsers);
      
      // Fallback: if no views today, use last 7 days average
      if (activeUsers === 0) {
        let totalViews7Days = 0;
        let daysWithViews = 0;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        
        homeSnapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (data.date >= sevenDaysAgoStr) {
            totalViews7Days += data.views || 0;
            daysWithViews++;
          }
        });
        
        activeUsers = daysWithViews > 0 ? Math.round(totalViews7Days / daysWithViews) : 100;
        console.log('[Stats API] Using 7-day average:', activeUsers);
      }
    } catch (viewsError) {
      console.error('[Stats API] Error fetching page views:', viewsError);
      // Use default
      activeUsers = 100;
    }

    return NextResponse.json({
      stats: {
        totalReviews,
        activeUsers,
        averageRating,
        totalGenres,
        topGenres,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });
  } catch (error) {
    console.error('[Stats API] Error fetching stats:', error);
    return NextResponse.json(responseData);
  }
}
