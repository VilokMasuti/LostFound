// src/app/api/auth/me/route.ts
import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('GET /api/auth/me - checking authentication');
    const userId = await getAuthUser();
    console.log('User ID from token:', userId);

    if (!userId) {
      console.log('No user ID found, returning 401');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userId).select(
      '-password -emailVerificationToken -passwordResetToken -passwordResetExpires'
    );

    if (!user) {
      console.log('User not found in database:', userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user.name);
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
