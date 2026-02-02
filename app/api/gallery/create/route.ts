'use server';

import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  if (!isFirebaseConfigured) {
    return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
  }

  try {
    const dbInstance = await getDbInstance();
    if (!dbInstance) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { imageUrl, title, description, bookTitle } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const galleryData = {
      imageUrl,
      title: title || '',
      description: description || '',
      bookTitle: bookTitle || '',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(dbInstance, 'gallery'), galleryData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'Image added to gallery successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding to gallery:', error);
    return NextResponse.json({ error: 'Failed to add image to gallery' }, { status: 500 });
  }
}

export async function GET() {
  if (!isFirebaseConfigured) {
    return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
  }

  try {
    const dbInstance = await getDbInstance();
    if (!dbInstance) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const galleryQuery = query(
      collection(dbInstance, 'gallery'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(galleryQuery);
    const galleryItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));

    return NextResponse.json({ gallery: galleryItems });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}
