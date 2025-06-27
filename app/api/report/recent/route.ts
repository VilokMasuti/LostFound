import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"

export async function GET() {
  try {
    await connectDB()

    // Get reports from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const recentReports = await Report.find({
      createdAt: { $gte: fiveMinutesAgo },
      status: "active",
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return NextResponse.json(recentReports)
  } catch (error) {
    console.error("Failed to fetch recent reports:", error)
    return NextResponse.json([], { status: 500 })
  }
}
