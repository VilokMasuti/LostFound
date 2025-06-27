import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import Match from "@/models/Match"
import { getAuthUser } from "@/lib/auth"
import Message from "@/models/Message"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/User";
export async function GET() {
  try {
    console.log("📊 GET /api/reports/stats - Fetching user stats")

    const userId = await getAuthUser()
    if (!userId) {
      console.log("❌ No authentication found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("🔐 Authenticated user:", userId)
    await connectDB()

    const [totalReports, lostReports, foundReports, matches, unreadMessages] = await Promise.all([
      Report.countDocuments({ userId }),
      Report.countDocuments({ userId, type: "lost" }),
      Report.countDocuments({ userId, type: "found" }),
      Match.countDocuments({
        $or: [
          { reportId: { $in: await Report.find({ userId }).distinct("_id") } },
          { matchedReportId: { $in: await Report.find({ userId }).distinct("_id") } },
        ],
      }),
      Message.countDocuments({ to: userId, read: false }),
    ])

    const stats = {
      totalReports,
      lostReports,
      foundReports,
      matches,
      unreadMessages,
    }

    console.log("📈 User stats:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Get user stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
