/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { messageSchema } from '@/lib/validations';
import Message from '@/models/Message';
import Report from '@/models/Report';

import '@/models/User';
import User from '@/models/User';
import type { Types } from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';
// Define interfaces for populated documents
interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedReport {
  _id: Types.ObjectId;
  brand: string;
  color: string;
  type: string;
  contactEmail?: string;
  contactPhone?: string;
  model?: string;
  location: string;
  description: string;
  userId: PopulatedUser;
}

interface PopulatedMessage {
  _id: Types.ObjectId;
  from: PopulatedUser;
  to: PopulatedUser;
  reportId: PopulatedReport;
  subject?: string;
  message: string;
  read: boolean;
  readAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  messageType: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const messages = await Message.find({ to: userId, deleted: false })
      .populate('from', 'name email')
      .populate({
        path: 'reportId',
        select:
          'brand color type contactEmail contactPhone model location description',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to match our Message type
    const transformedMessages = messages.map((msg: any) => {
      const report = msg.reportId;

      return {
        ...msg,
        _id: msg._id.toString(),
        from: {
          _id: msg.from._id.toString(),
          name: msg.from.name,
          email: msg.from.email,
        },
        to: {
          _id: userId,
        },
        reportId: report?._id?.toString() || null,
        report: report
          ? {
              ...report,
              _id: report._id.toString(),
              userId: report.userId?._id?.toString() || null,
            }
          : null,
      };
    });

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received message data:', body); // Debug logging

    // Validate input with better error handling
    const validationResult = messageSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.flatten());
      return NextResponse.json(
        {
          message: 'Invalid input data',
          errors: validationResult.error.flatten().fieldErrors,
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { reportId, message, subject, messageType, priority } =
      validationResult.data;

    await connectDB();

    // Get the report and verify it exists
    const report = await Report.findById(reportId).populate(
      'userId',
      'name email'
    );
    if (!report) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if report is active
    if (report.status !== 'active') {
      return NextResponse.json(
        { message: 'Cannot message about inactive reports' },
        { status: 400 }
      );
    }

    // Prevent users from messaging their own reports
    if (report.userId._id.toString() === userId) {
      return NextResponse.json(
        { message: 'You cannot message your own report' },
        { status: 400 }
      );
    }

    // Get sender information
    const sender = await User.findById(userId).select('name email');
    if (!sender) {
      return NextResponse.json(
        { message: 'Sender not found' },
        { status: 404 }
      );
    }

    // Create the message
    const newMessage = await Message.create({
      from: userId,
      to: report.userId._id,
      reportId,
      subject:
        subject ||
        `Message about your ${report.type} ${report.brand} ${report.color} phone`,
      message,
      messageType: messageType || 'inquiry',
      priority: priority || 'normal',
    });

    // Populate the created message for response
    const populatedMessage = (await Message.findById(newMessage._id)
      .populate('from', 'name email')
      .populate('to', 'name email')
      .populate({
        path: 'reportId',
        select:
          'brand color type contactEmail contactPhone model location description',
      })
      .lean()) as PopulatedMessage | null;

    if (!populatedMessage) {
      return NextResponse.json(
        { message: 'Failed to retrieve created message' },
        { status: 500 }
      );
    }

    // Transform response
    const responseMessage = {
      ...populatedMessage,
      _id: populatedMessage._id.toString(),
      from: {
        _id: populatedMessage.from._id.toString(),
        name: populatedMessage.from.name,
        email: populatedMessage.from.email,
      },
      to: {
        _id: populatedMessage.to._id.toString(),
        name: populatedMessage.to.name,
        email: populatedMessage.to.email,
      },
      reportId: populatedMessage.reportId._id.toString(),
      report: {
        ...populatedMessage.reportId,
        _id: populatedMessage.reportId._id.toString(),
      },
    };

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        data: responseMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
