/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Match from "@/models/Match"
import { getAuthUser } from "@/lib/auth"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/User";
export async function GET() {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching matches for user:", userId)

    await connectDB()

    // Find matches where user is involved and status is NOT resolved
    const matches = await Match.find({
      $and: [
        {
          $or: [{ reportId: { $exists: true } }, { matchedReportId: { $exists: true } }],
        },
        {
          status: { $ne: "resolved" }, // Exclude resolved matches
        },
      ],
    })
      .populate({
        path: "reportId",
        select: "brand color type location description dateLostFound imageUrl userId status",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "matchedReportId",
        select: "brand color type location description dateLostFound imageUrl userId status",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .lean()

    console.log("📊 Found matches before filtering:", matches.length)

    // Filter matches where user owns either report and exclude resolved reports
    const userMatches = matches
      .filter((match: any) => {
        const reportId = match.reportId
        const matchedReportId = match.matchedReportId

        // Check if user owns either report
        const userOwnsReport =
          reportId?.userId?._id?.toString() === userId || matchedReportId?.userId?._id?.toString() === userId

        // Check if either report is resolved
        const reportResolved = reportId?.status === "resolved" || matchedReportId?.status === "resolved"

        // Only include if user owns and neither report is resolved
        return userOwnsReport && !reportResolved && match.status !== "resolved"
      })
      .map((match: any) => {
        const reportId = match.reportId
        const matchedReportId = match.matchedReportId

        return {
          _id: match._id?.toString(),
          reportId: reportId?._id?.toString() || null,
          matchedReportId: matchedReportId?._id?.toString() || null,
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
                type: reportId.type,
                location: reportId.location,
                description: reportId.description,
                dateLostFound: reportId.dateLostFound,
                imageUrl: reportId.imageUrl,
                status: reportId.status,
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
                type: matchedReportId.type,
                location: matchedReportId.location,
                description: matchedReportId.description,
                dateLostFound: matchedReportId.dateLostFound,
                imageUrl: matchedReportId.imageUrl,
                status: matchedReportId.status,
                userId: matchedReportId.userId._id.toString(),
                user: {
                  _id: matchedReportId.userId._id.toString(),
                  name: matchedReportId.userId.name,
                  email: matchedReportId.userId.email,
                },
              }
            : null,
        }
      })

    console.log("✅ Active user matches found:", userMatches.length)
    return NextResponse.json(userMatches)
  } catch (error) {
    console.error("❌ Get matches error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
