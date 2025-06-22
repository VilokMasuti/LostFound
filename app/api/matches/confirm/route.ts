import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Match from "@/models/Match"
import Report from "@/models/Report"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { matchId, confirmed } = await request.json()

    const match = await Match.findById(matchId).populate("reportId").populate("matchedReportId")

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    // Update match status
    match.status = confirmed ? "confirmed" : "rejected"
    await match.save()

    if (confirmed) {
      // Mark both reports as resolved
      await Report.findByIdAndUpdate(match.reportId._id, { status: "resolved" })
      await Report.findByIdAndUpdate(match.matchedReportId._id, { status: "resolved" })
    }

    return NextResponse.json({
      message: confirmed ? "Match confirmed successfully!" : "Match rejected",
      match,
    })
  } catch (error) {
    console.error("Confirm match error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
