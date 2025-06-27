/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import type { Types } from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface PopulatedReportSearch {
  _id: Types.ObjectId;
  userId:
    | {
        _id: Types.ObjectId;
        name: string;
        email: string;
      }
    | Types.ObjectId;
  type: string;
  brand: string;
  model?: string;
  color: string;
  location: string;
  description: string;
  dateLostFound: Date;
  contactEmail?: string;
  contactPhone?: string;
  imageUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount?: number;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/report/search - Searching reports');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') || '50');
    const page = Number.parseInt(searchParams.get('page') || '1');

    await connectDB();

    const searchQuery: any = {};

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      searchQuery.$or = [
        { brand: searchRegex },
        { model: searchRegex },
        { color: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }

    if (type && type !== 'all') {
      searchQuery.type = type;
    }

    if (status && status !== 'all') {
      searchQuery.status = status;
    }

    console.log('🔍 Search query:', JSON.stringify(searchQuery));

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      Report.find(searchQuery)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() as unknown as Promise<PopulatedReportSearch[]>,
      Report.countDocuments(searchQuery),
    ]);

    console.log(`✅ Found ${reports.length} reports (${total} total)`);

    const transformedReports = reports.map((report) => {
      const isUserPopulated =
        typeof report.userId === 'object' && 'name' in report.userId;

      const user = isUserPopulated
        ? {
            _id: (report.userId as any)._id.toString(),
            name: (report.userId as any).name || 'User',
            email: (report.userId as any).email || 'no-reply@example.com',
          }
        : {
            _id: '',
            name: 'Unknown',
            email: 'unknown@example.com',
          };

      return {
        ...report,
        _id: report._id.toString(),
        userId: isUserPopulated
          ? (report.userId as any)._id.toString()
          : report.userId.toString(),
        dateLostFound: report.dateLostFound.toISOString(),
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
        user,
      };
    });

    return NextResponse.json(transformedReports);
  } catch (error) {
    console.error('❌ Search reports error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
