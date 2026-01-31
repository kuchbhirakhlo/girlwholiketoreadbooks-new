import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function GET(request: NextRequest) {
  try {
    // Fetch all posts
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    const posts = postsSnapshot.docs.map((doc) => doc.data());

    // Fetch all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map((doc) => doc.data());

    // Fetch all comments
    const commentsSnapshot = await getDocs(collection(db, 'comments'));
    const comments = commentsSnapshot.docs.map((doc) => doc.data());

    // Calculate statistics
    const totalPosts = posts.length;
    const totalUsers = users.length;
    const totalComments = comments.length;
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const averageRating = posts.length > 0 ? (posts.reduce((sum, post) => sum + (post.rating || 0), 0) / posts.length).toFixed(2) : '0';

    // Count by genre
    const genreCounts = posts.reduce((acc: Record<string, number>, post) => {
      const genre = post.genre || 'Unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      stats: {
        totalPosts,
        totalUsers,
        totalComments,
        totalLikes,
        averageRating,
        genreCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
