import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import { NextResponse ,NextRequest} from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/User";
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since');

    const cutoff = since
      ? new Date(Number(since))
      : new Date(Date.now() - 5 * 60 * 1000);

    const recentReports = await Report.find({
      createdAt: { $gte: cutoff },
      status: 'active',
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(
      '📦 Fetched recent reports since:',
      cutoff,
      '| Count:',
      recentReports.length
    );
    return NextResponse.json(recentReports);
  } catch (error) {
    console.error('Failed to fetch recent reports:', error);
    return NextResponse.json([], { status: 500 });
  }
}
