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

let dbInstance: any = null;

function getDb() {
  if (dbInstance) return dbInstance;
  
  try {
    const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
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

    // Get page views for active users (from last 30 days)
    let activeUsers = 0;
    try {
      const pageViewsRef = collection(firestoreDb, 'pageViews');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      const pageViewsQuery = query(pageViewsRef);
      const pageViewsSnapshot = await getDocs(pageViewsQuery);
      
      let totalViews30Days = 0;
      let todayViews = 0;
      
      pageViewsSnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.date >= thirtyDaysAgoStr) {
          totalViews30Days += data.views || 0;
        }
        if (data.date === today) {
          todayViews = data.views || 0;
        }
      });

      // Use today's views as "active readers" (increases on each refresh)
      activeUsers = Math.max(todayViews, Math.round(totalViews30Days / 7));
    } catch (viewsError) {
      // Use default
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
    return NextResponse.json(responseData);
  }
}
