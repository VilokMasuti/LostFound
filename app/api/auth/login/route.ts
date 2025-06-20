import { generateTokens, setAuthCookies } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { loginSchema } from '@/lib/validations';
import User from '@/models/User';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate input
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Invalid input data',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    await connectDB();
    // Find user and check password

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    // Set cookies
    setAuthCookies(accessToken, refreshToken);
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
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
