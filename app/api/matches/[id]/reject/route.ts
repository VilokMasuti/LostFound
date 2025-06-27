import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Match from "@/models/Match"
import { getAuthUser } from "@/lib/auth"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/User";
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await connectDB()

    // Find the match
    const match = await Match.findById(id).populate("reportId").populate("matchedReportId")

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    // Check if user is the owner of the lost report
    const lostReport = match.reportId?.type === "lost" ? match.reportId : match.matchedReportId

    if (lostReport?.userId?.toString() !== userId) {
      return NextResponse.json({ message: "Only the owner of the lost item can reject matches" }, { status: 403 })
    }

    // Update match status to rejected
    match.status = "rejected"
    await match.save()

    console.log(`✅ Match ${id} rejected by user ${userId}`)

    return NextResponse.json({
      message: "Match rejected successfully",
      match: {
        _id: match._id,
        status: match.status,
        updatedAt: match.updatedAt,
      },
    })
  } catch (error) {
    console.error("Reject match error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
