import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';

// ⚠️ SECURITY WARNING: This endpoint should be disabled in production!
// It's only for initial setup when no admin exists in the system.

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 503 }
      );
    }

    const { uid, email, name, role } = await request.json();

    if (!uid || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, email, role' },
        { status: 400 }
      );
    }

    // Only allow valid roles
    if (!['admin', 'editor', 'reader'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, editor, or reader' },
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

    // Check if user already exists
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      // Update existing user role
      await setDoc(doc(db, 'users', uid), {
        ...userDoc.data(),
        role,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      return NextResponse.json({
        success: true,
        message: `User role updated to ${role}`,
      });
    } else {
      // Create new user with specified role
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        name: name || email.split('@')[0],
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      return NextResponse.json({
        success: true,
        message: `User created with ${role} role`,
      });
    }
  } catch (error) {
    console.error('Set role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
