import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { Notification } from "@/models/Notification"

import { getAuthUser } from "@/lib/auth"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/User";
export async function PATCH() {
  try {
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    await Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() })

    return NextResponse.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
