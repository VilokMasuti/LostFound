import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Reports from "@/models/Reports"
import Match from "@/models/Match"
import { getAuthUser } from "@/lib/auth"
import Message from "@/models/Message"


export async function GET() {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const [totalReports, lostReports, foundReports, matches, unreadMessages] = await Promise.all([
      Reports.countDocuments({ userId }),
      Reports.countDocuments({ userId, type: "lost" }),
      Reports.countDocuments({ userId, type: "found" }),
      Match.countDocuments({
        $or: [
          { reportId: { $in: await Reports.find({ userId }).distinct("_id") } },
          { matchedReportId: { $in: await Reports.find({ userId }).distinct("_id") } },
        ],
      }),
      Message.countDocuments({ to: userId, read: false }),
    ])

    return NextResponse.json({
      totalReports,
      lostReports,
      foundReports,
      matches,
      unreadMessages,
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
