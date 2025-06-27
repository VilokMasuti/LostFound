import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import Report from '@/models/Report';
import { type NextRequest, NextResponse } from 'next/server';
import "@/models/User";
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { matchId, confirmed } = await request.json();

    const match = await Match.findById(matchId)
      .populate('reportId')
      .populate('matchedReportId');

    if (!match) {
      return NextResponse.json({ message: 'Match not found' }, { status: 404 });
    }

    // Verify user has permission to confirm this match
    const userOwnsReport =
      match.reportId.userId.toString() === userId ||
      match.matchedReportId.userId.toString() === userId;

    if (!userOwnsReport) {
      return NextResponse.json(
        { message: 'Unauthorized to confirm this match' },
        { status: 403 }
      );
    }

    // Update match status
    match.status = confirmed ? 'confirmed' : 'rejected';
    match.notes = confirmed
      ? 'Match confirmed by user'
      : 'Match rejected by user';
    await match.save();

    if (confirmed) {
      // Mark both reports as resolved
      await Report.findByIdAndUpdate(match.reportId._id, {
        status: 'resolved',
      });
      await Report.findByIdAndUpdate(match.matchedReportId._id, {
        status: 'resolved',
      });
    }

    return NextResponse.json({
      message: confirmed ? 'Match confirmed successfully!' : 'Match rejected',
      match,
    });
  } catch (error) {
    console.error('Confirm match error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
