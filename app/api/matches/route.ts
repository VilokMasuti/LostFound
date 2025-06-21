/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import { NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/auth';
import Reports from '@/models/Report';
import type { Types } from 'mongoose';

// Define interfaces for populated documents
interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedReportInMatch {
  _id: Types.ObjectId;
  brand: string;
  color: string;
  type: string;
  location: string;
  description: string;
  dateLostFound: Date;
  imageUrl?: string;
  userId: PopulatedUser;
}

interface PopulatedMatch {
  _id: Types.ObjectId;
  reportId: PopulatedReportInMatch;
  matchedReportId: PopulatedReportInMatch;
  similarity: number;
  matchedBy: string;
  status: string;
  confidence: string;
  matchCriteria: any;
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

    // Get user's reports
    const userReports = await Reports.find({ userId }).select('_id');
    const userReportIds = userReports.map((report) => report._id);

    // Find matches for user's reports
    const matches = (await Match.find({
      $or: [
        { reportId: { $in: userReportIds } },
        { matchedReportId: { $in: userReportIds } },
      ],
      status: 'pending',
    })
      .populate({
        path: 'reportId',
        select:
          'brand color type location description dateLostFound imageUrl userId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate({
        path: 'matchedReportId',
        select:
          'brand color type location description dateLostFound imageUrl userId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .sort({ similarity: -1, createdAt: -1 })
      .lean()) as unknown as PopulatedMatch[];

    // Transform the data
    const transformedMatches = matches.map((match) => ({
      ...match,
      _id: match._id.toString(),
      reportId: match.reportId._id.toString(),
      matchedReportId: match.matchedReportId._id.toString(),
      report: {
        ...match.reportId,
        _id: match.reportId._id.toString(),
        userId: match.reportId.userId._id.toString(),
        user: {
          _id: match.reportId.userId._id.toString(),
          name: match.reportId.userId.name,
          email: match.reportId.userId.email,
        },
      },
      matchedReport: {
        ...match.matchedReportId,
        _id: match.matchedReportId._id.toString(),
        userId: match.matchedReportId.userId._id.toString(),
        user: {
          _id: match.matchedReportId.userId._id.toString(),
          name: match.matchedReportId.userId.name,
          email: match.matchedReportId.userId.email,
        },
      },
    }));

    return NextResponse.json(transformedMatches);
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
