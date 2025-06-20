import connectDB from '@/lib/mongodb';
import { registerSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { generateTokens, setAuthCookies } from "@/lib/auth"
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    // / Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Invalid input data',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const { name, email, password } = validationResult.data;
    await connectDB();
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }
    // Create new user with name
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });
// Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Set cookies
    setAuthCookies(accessToken, refreshToken)

// / Return user data (password excluded by schema transform)
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })

  } catch (error) {
     console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })

  }
};
