// src/lib/auth.ts
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key'
);

export async function generateTokens(userId: string) {
  console.log('Generating tokens for user:', userId);

  const accessToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2hr')
    .sign(JWT_SECRET);

  const refreshToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET);

  console.log('Generated access token:', accessToken.substring(0, 20) + '...');
  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string) {
  try {
    console.log('Verifying token:', token.substring(0, 20) + '...');
    // This is only used in Node.js environment (API routes)
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('Token verified successfully for user:', payload.userId);
    return { userId: payload.userId as string };
  } catch (error) {
    console.log(
      'Token verification failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    // This is only used in Node.js environment (API routes)
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('accessToken')?.value;
    console.log('Getting auth user, token exists:', !!accessToken);

    if (!accessToken) return null;

    const payload = await verifyAccessToken(accessToken);
    return payload?.userId || null;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}
