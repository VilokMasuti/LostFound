/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"

import { getAuthUser } from "@/lib/auth"
import { Notification } from "@/models/Notification"

export async function GET(request: NextRequest) {
  try {
    // Use the same auth function as other APIs
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectDB()

    // Fetch notifications for the authenticated user
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean()

    // Transform the data to ensure proper serialization
    const transformedNotifications = notifications.map((notification: any) => ({
      _id: notification._id.toString(),
      userId: notification.userId.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      relatedId: notification.relatedId?.toString(),
      relatedType: notification.relatedType,
    }))

    console.log(`✅ Found ${transformedNotifications.length} notifications for user ${userId}`)
    return NextResponse.json(transformedNotifications)
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use the same auth function as other APIs
    const userId = await getAuthUser()
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, message, relatedId, relatedType } = body

    await connectDB()

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      read: false,
    })

    await notification.save()

    // Transform response
    const transformedNotification = {
      _id: notification._id.toString(),
      userId: notification.userId.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      relatedId: notification.relatedId?.toString(),
      relatedType: notification.relatedType,
    }

    console.log(`✅ Created notification for user ${userId}`)
    return NextResponse.json(transformedNotification, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
