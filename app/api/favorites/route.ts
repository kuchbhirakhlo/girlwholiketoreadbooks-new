import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

const db = getAdminDb();

if (!db) {
  console.error('Firebase Admin SDK not initialized');
}

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { postId, userId } = body;

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const { getDocs, query, where, addDoc, collection, serverTimestamp } = require('firebase-admin/firestore');
    
    const favoritesRef = collection(db, 'favorites');
    const existingFavorite = await getDocs(
      query(
        favoritesRef,
        where('postId', '==', postId),
        where('userId', '==', userId)
      )
    );

    if (existingFavorite.docs.length > 0) {
      return NextResponse.json(
        { error: 'Already favorited' },
        { status: 400 }
      );
    }

    const favoriteRef = await addDoc(favoritesRef, {
      postId,
      userId,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      id: favoriteRef.id,
      postId,
      userId,
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { getDocs, query, where, collection, Timestamp } = require('firebase-admin/firestore');
    
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const favorites = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      };
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { postId, userId } = body;

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { getDocs, query, where, collection, deleteDoc } = require('firebase-admin/firestore');
    
    const favoritesRef = collection(db, 'favorites');
    const favorite = await getDocs(
      query(
        favoritesRef,
        where('postId', '==', postId),
        where('userId', '==', userId)
      )
    );

    if (favorite.docs.length === 0) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    await deleteDoc(favorite.docs[0].ref);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
