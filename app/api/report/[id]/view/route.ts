import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const report = await Report.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } }, { new: true })

    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    console.log(`👁️ View recorded for report ${params.id}, new count: ${report.viewCount}`)

    return NextResponse.json({ viewCount: report.viewCount })
  } catch (error) {
    console.error("Record view error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
