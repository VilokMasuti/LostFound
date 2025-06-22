/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Match from "@/models/Match"
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching matches for user:", userId)

    await connectDB()

    // Find matches where user owns either report
    const matches = await Match.find({
      $or: [{ reportId: { $exists: true } }, { matchedReportId: { $exists: true } }],
    })
      .populate({
        path: "reportId",
        select: "brand color type location description dateLostFound imageUrl userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "matchedReportId",
        select: "brand color type location description dateLostFound imageUrl userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .lean()

    console.log("📊 Found matches:", matches.length)

    // Filter matches where user owns either report and transform data
    const userMatches = matches
      .filter((match) => {
        const reportId = match.reportId as any
        const matchedReportId = match.matchedReportId as any

        return reportId?.userId?._id?.toString() === userId || matchedReportId?.userId?._id?.toString() === userId
      })
      .map((match) => {
        const reportId = match.reportId as any
        const matchedReportId = match.matchedReportId as any

        return {
          _id: (match._id as any)?.toString(),
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

    console.log("✅ User matches found:", userMatches.length)
    return NextResponse.json(userMatches)
  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
