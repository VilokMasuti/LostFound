import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Match from "@/models/Match"
import Report from "@/models/Report"

import { getAuthUser } from "@/lib/auth"
import { Notification } from "@/models/Notification"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // FIXED: Await params in Next.js 15
    const { id } = await params

    await connectDB()

    const match = await Match.findById(id).populate("reportId").populate("matchedReportId")

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Either user can mark as returned
    const isAuthorized =
      match.reportId?.userId?.toString() === userId || match.matchedReportId?.userId?.toString() === userId

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    console.log(`🔄 Marking match ${id} as returned...`)

    // FIXED: Update match status to "confirmed" instead of "resolved"
    // The Match model only accepts: pending, confirmed, rejected, expired
    match.status = "confirmed"
    match.resolvedAt = new Date()
    await match.save()

    // Mark BOTH reports as resolved
    if (match.reportId?._id) {
      await Report.findByIdAndUpdate(match.reportId._id, {
        status: "resolved",
        resolvedAt: new Date(),
      })
      console.log(`✅ Report ${match.reportId._id} marked as resolved`)
    }

    if (match.matchedReportId?._id) {
      await Report.findByIdAndUpdate(match.matchedReportId._id, {
        status: "resolved",
        resolvedAt: new Date(),
      })
      console.log(`✅ Report ${match.matchedReportId._id} marked as resolved`)
    }

    // Create success notifications for both users
    const otherUserId =
      match.reportId?.userId?.toString() === userId
        ? match.matchedReportId?.userId?.toString()
        : match.reportId?.userId?.toString()

    if (otherUserId) {
      await Notification.create({
        userId: otherUserId,
        type: "case_resolved",
        title: "Phone Successfully Returned!",
        message: `The case for ${match.reportId?.brand || match.matchedReportId?.brand} has been resolved. Thanks for helping!`,
        relatedId: match._id,
        relatedType: "match",
      })
      console.log(`✅ Notification created for user ${otherUserId}`)
    }

    // Create notification for current user too
    await Notification.create({
      userId: userId,
      type: "case_resolved",
      title: "Case Marked as Resolved!",
      message: `You've successfully marked the ${match.reportId?.brand || match.matchedReportId?.brand} case as resolved. Thank you for contributing to the community!`,
      relatedId: match._id,
      relatedType: "match",
    })
    console.log(`✅ Notification created for current user ${userId}`)

    console.log(`🎉 Match ${id} successfully resolved!`)

    return NextResponse.json({
      success: true,
      message: "Case successfully resolved!",
    })
  } catch (error) {
    console.error("❌ Error marking as returned:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
