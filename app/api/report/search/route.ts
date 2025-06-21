/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from '@/lib/mongodb';
import Reports from '@/models/Report';
import type { Types } from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// Define interface for populated report
interface PopulatedReportSearch {
  _id: Types.ObjectId;
  userId: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
  type: string;
  brand: string;
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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const brand = searchParams.get('brand');
    const color = searchParams.get('color');
    const location = searchParams.get('location');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '20');

    await connectDB();

    // Build search query
    const searchQuery: any = { status: 'active' };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (type && ['lost', 'found'].includes(type)) {
      searchQuery.type = type;
    }

    if (brand) {
      searchQuery.brand = new RegExp(brand, 'i');
    }

    if (color) {
      searchQuery.color = new RegExp(color, 'i');
    }

    if (location) {
      searchQuery.location = new RegExp(location, 'i');
    }

    // Execute search with pagination
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      Reports.find(searchQuery)
        .populate('userId', 'name email')
        .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() as unknown as Promise<PopulatedReportSearch[]>,
      Reports.countDocuments(searchQuery),
    ]);

    // Transform the data
    const transformedReports = reports.map(
      (report: {
        _id: { toString: () => any };
        userId: { _id: { toString: () => any }; name: any; email: any };
      }) => ({
        ...report,
        _id: report._id.toString(),
        userId: report.userId._id.toString(),
        user: {
          _id: report.userId._id.toString(),
          name: report.userId.name,
          email: report.userId.email,
        },
      })
    );

    return NextResponse.json({
      reports: transformedReports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search reports error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
