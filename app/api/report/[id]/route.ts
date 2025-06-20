import { getAuthUser } from '@/lib/auth';
import { deleteImage } from "@/lib/cloudinary"
import connectDB from '@/lib/mongodb';
import Reports from '@/models/Reports';
import { type NextRequest, NextResponse } from 'next/server';
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUser;
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB()

    const report = await Reports.findOne({_id:params.id,userId})

    if(!report){
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }
  // Delete image from Cloudinary if exists
    if (report.imagePublicId) {
      try {
        await deleteImage(report.imagePublicId)
      } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error)
      }
    }

    await Reports.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Report deleted successfully" })


  } catch (error) {
        console.error("Delete report error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })

  }
}
