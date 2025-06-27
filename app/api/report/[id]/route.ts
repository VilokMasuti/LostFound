import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import Match from "@/models/Match"
import Message from "@/models/Message"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const report = await Report.findById(params.id).populate("userId", "name email").lean()

    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    // Increment view count
    await Report.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } })

    if (Array.isArray(report)) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...report,
      _id: report._id?.toString(),
      userId: (report.userId && typeof report.userId === "object" && "_id" in report.userId)
        ? report.userId._id.toString()
        : report.userId?.toString(),
    })
  } catch (error) {
    console.error("Get report error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const report = await Report.findById(params.id)
    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    // Check if user owns this report
    if (report.userId.toString() !== userId) {
      return NextResponse.json({ message: "Unauthorized - not your report" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    // Update report status
    const updatedReport = await Report.findByIdAndUpdate(
      params.id,
      { status, resolvedAt: status === "resolved" ? new Date() : undefined },
      { new: true },
    )

    // If marking as resolved, clean up related data
    if (status === "resolved") {
      // Delete related matches
      await Match.deleteMany({
        $or: [{ reportId: params.id }, { matchedReportId: params.id }],
      })

      // Delete related messages
      await Message.deleteMany({ reportId: params.id })

      console.log(`Cleaned up resolved case: ${params.id}`)
    }

    return NextResponse.json({
      message: "Report updated successfully",
      report: updatedReport,
    })
  } catch (error) {
    console.error("Update report error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const report = await Report.findById(params.id)
    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    // Check if user owns this report
    if (report.userId.toString() !== userId) {
      return NextResponse.json({ message: "Unauthorized - not your report" }, { status: 403 })
    }

    // Delete the report and all related data
    await Report.findByIdAndDelete(params.id)
    await Match.deleteMany({
      $or: [{ reportId: params.id }, { matchedReportId: params.id }],
    })
    await Message.deleteMany({ reportId: params.id })

    return NextResponse.json({ message: "Report deleted successfully" })
  } catch (error) {
    console.error("Delete report error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
