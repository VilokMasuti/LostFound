import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import "@/models/User";
import { getAuthUser } from "@/lib/auth"
import { Notification } from "@/models/Notification"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const notification = await Notification.findOneAndUpdate(
      { _id: params.id, userId },
      { read: true, readAt: new Date() },
      { new: true },
    )

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
