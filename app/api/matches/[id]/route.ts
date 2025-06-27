/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Match from "@/models/Match"
import Report from "@/models/Report"
import { getAuthUser } from "@/lib/auth"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/User";
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching match details for:", params.id)

    await connectDB()

    const matchResult = await Match.findById(params.id)
      .populate({
        path: "reportId",
        select: "brand color model type location description dateLostFound imageUrl userId contactEmail contactPhone",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "matchedReportId",
        select: "brand color model type location description dateLostFound imageUrl userId contactEmail contactPhone",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .lean()

    if (!matchResult || Array.isArray(matchResult)) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    const match = matchResult as Record<string, any>
    const reportId = match.reportId
    const matchedReportId = match.matchedReportId

    // Check if user owns either report
    const userOwnsReport =
      reportId?.userId?._id?.toString() === userId || matchedReportId?.userId?._id?.toString() === userId

    if (!userOwnsReport) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Transform the match data
    const transformedMatch = {
      _id: match._id.toString(),
      reportId: reportId?._id?.toString(),
      matchedReportId: matchedReportId?._id?.toString(),
      similarity: match.similarity,
      confidence: match.confidence,
      status: match.status,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      report: reportId
        ? {
            _id: reportId._id.toString(),
            brand: reportId.brand,
            color: reportId.color,
            model: reportId.model,
            type: reportId.type,
            location: reportId.location,
            description: reportId.description,
            dateLostFound: reportId.dateLostFound,
            imageUrl: reportId.imageUrl,
            contactEmail: reportId.contactEmail,
            contactPhone: reportId.contactPhone,
            userId: reportId.userId._id.toString(),
            user: {
              _id: reportId.userId._id.toString(),
              name: reportId.userId.name,
              email: reportId.userId.email,
            },
          }
        : null,
      matchedReport: matchedReportId
        ? {
            _id: matchedReportId._id.toString(),
            brand: matchedReportId.brand,
            color: matchedReportId.color,
            model: matchedReportId.model,
            type: matchedReportId.type,
            location: matchedReportId.location,
            description: matchedReportId.description,
            dateLostFound: matchedReportId.dateLostFound,
            imageUrl: matchedReportId.imageUrl,
            contactEmail: matchedReportId.contactEmail,
            contactPhone: matchedReportId.contactPhone,
            userId: matchedReportId.userId._id.toString(),
            user: {
              _id: matchedReportId.userId._id.toString(),
              name: matchedReportId.userId.name,
              email: matchedReportId.userId.email,
            },
          }
        : null,
    }

    console.log("✅ Match details loaded successfully")
    return NextResponse.json(transformedMatch)
  } catch (error) {
    console.error("Get match error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { status, notes } = await request.json()
    console.log("🔄 Updating match:", params.id, "Status:", status)

    if (!["confirmed", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    await connectDB()

    // Find the match
    const match = await Match.findById(params.id).populate("reportId matchedReportId")
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    const reportId = match.reportId as any
    const matchedReportId = match.matchedReportId as any

    // Verify user ownership
    const userOwnsReport = reportId?.userId?.toString() === userId || matchedReportId?.userId?.toString() === userId

    if (!userOwnsReport) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Update match status
    match.status = status
    if (notes) match.notes = notes
    await match.save()

    console.log("✅ Match status updated to:", status)

    // If confirmed, mark both reports as resolved
    if (status === "confirmed") {
      await Report.findByIdAndUpdate(match.reportId, { status: "resolved" })
      await Report.findByIdAndUpdate(match.matchedReportId, { status: "resolved" })
      console.log("✅ Both reports marked as resolved")
    }

    return NextResponse.json({
      message: "Match updated successfully",
      status: match.status,
    })
  } catch (error) {
    console.error("Update match error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
