import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, FieldValue, doc, getDoc, Timestamp } from 'firebase/firestore';

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
    
    // Map editor form fields to API expected fields
    const { 
      title, 
      title: bookTitle = title, 
      author: authorName, 
      review: content, 
      userId, 
      userName, 
      rating, 
      genre, 
      bookCover, 
      publicationYear, 
      status, 
      slug,
      idToken,
      tags
    } = body;

    // Validate required fields
    if (!bookTitle || !content || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: bookTitle, content, userId' },
        { status: 400 }
      );
    }

    // Validate rating
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 50) {
      return NextResponse.json(
        { error: 'Content must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Get user's role from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userRole = userData?.role;

    // Only admin or editor can create posts
    if (userRole !== 'admin' && userRole !== 'editor') {
      return NextResponse.json(
        { error: 'Only admins and editors can create posts' },
        { status: 403 }
      );
    }

    // Editors can only create drafts or submit for review
    const postStatus = userRole === 'editor' 
      ? (status === 'published' ? 'review' : status || 'draft')
      : (status || 'published');

    // Generate slug from bookTitle if not provided
    const postSlug = slug || (bookTitle || title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Ensure slug is at least 3 characters
    if (postSlug.length < 3) {
      return NextResponse.json(
        { error: 'Generated slug is too short' },
        { status: 400 }
      );
    }

    // Validate authorName
    const finalAuthorName = authorName || userName;
    if (!finalAuthorName || finalAuthorName.length < 2) {
      return NextResponse.json(
        { error: 'Author name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Validate genre is an array with 1-5 items
    let genreArray = Array.isArray(genre) ? genre : [genre || 'General'];
    if (genreArray.length < 1 || genreArray.length > 5) {
      return NextResponse.json(
        { error: 'Genre must have between 1 and 5 items' },
        { status: 400 }
      );
    }

    // Create excerpt from content
    const excerptText = content.substring(0, 297) + '...';
    if (excerptText.length < 10) {
      return NextResponse.json(
        { error: 'Excerpt must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Create post document (updatedAt will be set on first update per Firestore rules)
    const postData = {
      title: bookTitle,
      slug: postSlug,
      excerpt: excerptText,
      content,
      bookTitle,
      authorName: finalAuthorName,
      genre: genreArray,
      rating: parsedRating,
      coverImage: bookCover || null,
      publicationYear: publicationYear || null,
      status: postStatus,
      authorId: userId,
      authorRole: userRole,
      createdAt: serverTimestamp(),
      author: finalAuthorName,
      review: content,
      bookCover: bookCover || null,
      likesCount: 0,
      commentsCount: 0,
      tags: Array.isArray(tags) ? tags : [],
    };

    // Use addDoc with the authenticated context if ID token provided
    // Otherwise, try without (for testing with permissive rules)
    const docRef = await addDoc(collection(db, 'posts'), postData);

    return NextResponse.json({
      id: docRef.id,
      ...postData,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create post: ' + errorMessage },
      { status: 500 }
    );
  }
}
