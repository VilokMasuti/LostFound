import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Message from "@/models/Message";

export async function GET() {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const unreadCount = await Message.getUnreadCount(userId);

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("❌ Error in /messages/count:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
