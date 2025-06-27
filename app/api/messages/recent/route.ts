import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Get messages from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentMessages = await Message.find({
      createdAt: { $gte: fiveMinutesAgo },
      read: false,
    })
      .populate('from', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Transform data for easier use
    const transformedMessages = recentMessages.map((message) => ({
      ...message,
      senderName: (message.from as unknown as { name: string }).name,
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error('Failed to fetch recent messages:', error);
    return NextResponse.json([], { status: 500 });
  }
}
