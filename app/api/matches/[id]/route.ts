import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import Reports from '@/models/Reports';
import { type NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!['confirmed', 'rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    // Find the match and verify user ownership
    const match = await Match.findById(params.id)
      .populate('reportId')
      .populate('matchedReportId');
    if (!match) {
      return NextResponse.json({ message: 'Match not found' }, { status: 404 });
    }

    // Check if user owns either report in the match
    const userOwnsReport =
      match.reportId.userId.toString() === userId ||
      match.matchedReportId.userId.toString() === userId;

    if (!userOwnsReport) {
      return NextResponse.json(
        { message: 'Unauthorized to update this match' },
        { status: 403 }
      );
    }

    // Update match status
    match.status = status;
    if (notes) {
      match.notes = notes;
    }

    // Add user to viewedBy if not already there
    const hasViewed = match.viewedBy.some(
      (view: { userId: { toString: () => string } }) =>
        view.userId.toString() === userId
    );
    if (!hasViewed) {
      match.viewedBy.push({ userId, viewedAt: new Date() });
    }

    await match.save();

    // If confirmed, update both reports to resolved
    if (status === 'confirmed') {
      await Reports.updateMany(
        { _id: { $in: [match.reportId._id, match.matchedReportId._id] } },
        { status: 'resolved' }
      );
    }

    return NextResponse.json({ message: 'Match updated successfully' });
  } catch (error) {
    console.error('Update match error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
