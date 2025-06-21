// src/app/api/auth/login/route.ts
import { generateTokens } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { loginSchema } from "@/lib/validations"
import User from "@/models/User"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Login attempt started")
    const body = await request.json()

    // Validate input
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error)
      return NextResponse.json(
        {
          message: "Invalid input data",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { email, password } = validationResult.data
    console.log("Login attempt for email:", email)

    await connectDB()

    // Find user and check password
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      console.log("User not found:", email)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    console.log("Password valid, updating last login")
    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user._id.toString())
    console.log("Tokens generated, setting cookies")

    // Create response with user data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    const response = NextResponse.json(userData)

    // Set cookies directly on the response
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60, // 15 minutes
      path: "/",
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("Login successful for user:", user.name)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
