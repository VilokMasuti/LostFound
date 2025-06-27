import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Get matches from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentMatches = await Match.find({
      createdAt: { $gte: fiveMinutesAgo },
      status: 'pending',
    })
      .populate('reportId', 'userId brand color')
      .populate('matchedReportId', 'userId brand color')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Transform data for easier use
    const transformedMatches = recentMatches.map((match) => ({
      ...match,
      reportUserId: match.reportId.userId,
      reportBrand: match.reportId.brand,
      reportColor: match.reportId.color,
      matchedUserId: match.matchedReportId.userId,
      matchedBrand: match.matchedReportId.brand,
      matchedColor: match.matchedReportId.color,
    }));

    return NextResponse.json(transformedMatches);
  } catch (error) {
    console.error('Failed to fetch recent matches:', error);
    return NextResponse.json([], { status: 500 });
  }
}
