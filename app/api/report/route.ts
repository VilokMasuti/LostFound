import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import type { Types } from "mongoose"
import "@/models/User";
// Define interface for populated report
interface PopulatedReport {
  _id: Types.ObjectId
  userId: {
    _id: Types.ObjectId
    name: string
    email: string
  }
  type: string
  brand: string
  color: string
  location: string
  description: string
  dateLostFound: Date
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export async function GET() {
  try {
    console.log("📋 GET /api/reports - Fetching all reports")

    await connectDB()

    const reports = (await Report.find({ status: "active" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean()) as unknown as PopulatedReport[]

    console.log(`✅ Found ${reports.length} reports`)

    // Transform the data to match frontend expectations
    const transformedReports = reports.map((report) => ({
      ...report,
      _id: report._id.toString(),
      userId: report.userId._id.toString(),
      user: {
        _id: report.userId._id.toString(),
        name: report.userId.name,
        email: report.userId.email,
      },
    }))

    return NextResponse.json(transformedReports)
  } catch (error) {
    console.error("❌ Get reports error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
