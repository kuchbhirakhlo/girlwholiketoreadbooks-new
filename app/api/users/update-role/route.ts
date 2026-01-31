import { doc, updateDoc } from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';

async function verifyAdminToken(token: string): Promise<string | null> {
  // In production, verify the Firebase ID token
  // For now, this is a placeholder - implement proper token verification
  return null;
}

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 503 }
      );
    }

    const { userId, newRole, adminToken } = await request.json();

    if (!userId || !newRole || !['admin', 'editor', 'reader'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const db = await getDbInstance();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 503 }
      );
    }

    // Verify admin token (implement proper verification in production)
    // const adminId = await verifyAdminToken(adminToken);
    // For now, we rely on Firestore security rules
    
    // Update user role
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, message: 'User role updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
