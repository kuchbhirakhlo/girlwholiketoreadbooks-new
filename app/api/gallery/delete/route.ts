'use server';

import { NextRequest, NextResponse } from 'next/server';
import { doc, deleteDoc } from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';

export async function DELETE(request: NextRequest) {
  if (!isFirebaseConfigured) {
    return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
  }

  try {
    const dbInstance = await getDbInstance();
    if (!dbInstance) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    await deleteDoc(doc(dbInstance, 'gallery', id));

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
