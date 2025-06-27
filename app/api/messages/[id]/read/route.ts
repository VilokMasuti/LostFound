import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { type NextRequest, NextResponse } from 'next/server';
import "@/models/User";
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const message = await Message.findOneAndUpdate(
      { _id: params.id, to: userId },
      { read: true },
      { new: true }
    );

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
