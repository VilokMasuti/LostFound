import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Match from "@/models/Match"
import { getAuthUser } from "@/lib/auth"
import "@/models/User";
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await connectDB()

    // Find the match with populated reports
    const match = await Match.findById(id)
      .populate({
        path: "reportId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "matchedReportId",
        populate: { path: "userId", select: "name email" },
      })

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    // Find the lost report (the one that needs confirmation)
    const lostReport = match.reportId?.type === "lost" ? match.reportId : match.matchedReportId
    const foundReport = match.reportId?.type === "found" ? match.reportId : match.matchedReportId

    if (!lostReport || !foundReport) {
      return NextResponse.json({ message: "Invalid match - missing reports" }, { status: 400 })
    }

    // Check if user is the owner of the lost report
    if (lostReport.userId._id.toString() !== userId) {
      return NextResponse.json({ message: "Only the owner of the lost item can confirm matches" }, { status: 403 })
    }

    // Update match status to confirmed
    match.status = "confirmed"
    await match.save()

    console.log(`✅ Match ${id} confirmed by lost phone owner ${userId}`)

    return NextResponse.json({
      message: "Match confirmed successfully",
      match: {
        _id: match._id,
        status: match.status,
        updatedAt: match.updatedAt,
        lostReport: {
          _id: lostReport._id,
          brand: lostReport.brand,
          color: lostReport.color,
          user: lostReport.userId,
        },
        foundReport: {
          _id: foundReport._id,
          brand: foundReport.brand,
          color: foundReport.color,
          user: foundReport.userId,
        },
      },
    })
  } catch (error) {
    console.error("Confirm match error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
