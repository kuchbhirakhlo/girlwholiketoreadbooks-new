import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, userId, rating } = body;

    if (!postId || !userId || rating === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already rated this post
    const existingRating = await getDocs(
      query(
        collection(db, 'ratings'),
        where('postId', '==', postId),
        where('userId', '==', userId)
      )
    );

    if (existingRating.docs.length > 0) {
      // Delete existing rating
      await deleteDoc(existingRating.docs[0].ref);
    }

    // Add new rating
    const ratingRef = await addDoc(collection(db, 'ratings'), {
      postId,
      userId,
      rating: parseInt(rating, 10),
      createdAt: serverTimestamp() as FieldValue,
    });

    return NextResponse.json({
      id: ratingRef.id,
      postId,
      userId,
      rating: parseInt(rating, 10),
    });
  } catch (error) {
    console.error('Error rating post:', error);
    return NextResponse.json(
      { error: 'Failed to rate post' },
      { status: 500 }
    );
  }
}
