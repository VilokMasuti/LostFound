import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import { getAuthUser } from "@/lib/auth"
import { deleteImage } from "@/lib/cloudinary"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const report = await Report.findById(params.id).populate("userId", "name email").lean()

    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    // Convert ObjectId to string for JSON serialization
    if (Array.isArray(report)) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }
    const serializedReport = {
      ...report,
      _id: report._id?.toString(),
      userId: {
        _id: report.userId._id?.toString(),
        name: report.userId.name,
        email: report.userId.email,
      },
    }

    return NextResponse.json(serializedReport)
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

    const body = await request.json()
    const { status } = body

    const report = await Report.findOne({ _id: params.id, userId })
    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    report.status = status
    await report.save()

    return NextResponse.json({ message: "Report updated successfully", report })
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

    const report = await Report.findOne({ _id: params.id, userId })
    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    // Delete image from Cloudinary if exists
    if (report.imagePublicId) {
      try {
        await deleteImage(report.imagePublicId)
      } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error)
      }
    }

    await Report.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Report deleted successfully" })
  } catch (error) {
    console.error("Delete report error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
