import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import { getAuthUser } from "@/lib/auth"
import "@/models/User";
export async function GET() {
  try {
    console.log("👤 GET /api/reports/user - Fetching user reports")

    const userId = await getAuthUser()
    if (!userId) {
      console.log("❌ No authentication found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("🔐 Authenticated user:", userId)
    await connectDB()

    const reports = await Report.find({ userId }).sort({ createdAt: -1 }).lean()
    console.log(`✅ Found ${reports.length} user reports`)

    // Convert ObjectIds to strings for frontend compatibility
    const formattedReports = reports.map((report) => ({
      ...report,
      _id: (report._id as { toString: () => string }).toString(),
      userId: (report.userId as { toString: () => string } | undefined)?.toString() ?? null,
    }))

    return NextResponse.json(formattedReports)
  } catch (error) {
    console.error("❌ Get user reports error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
