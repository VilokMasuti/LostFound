import { clearAuthCookies } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    clearAuthCookies();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
