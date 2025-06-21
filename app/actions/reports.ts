/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import Match from "@/models/Match"
import { getAuthUser } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"
import { findMatches } from "@/lib/matching"
import { reportSchema } from "@/lib/validations"
import type { Report as ReportType } from "@/type"

export async function submitReport(formData: FormData) {
  console.log("🔥 Server Action: submitReport called!")

  try {
    console.log("🔐 Checking authentication...")
    const userId = await getAuthUser()
    console.log("👤 User ID:", userId)

    if (!userId) {
      console.log("❌ No user ID found - authentication required")
      return { success: false, error: "Authentication required" }
    }

    console.log("🔌 Connecting to database...")
    await connectDB()

    // Extract and validate form data
    console.log("📋 Extracting form data...")
    const data = {
      type: formData.get("type") as string,
      brand: formData.get("brand") as string,
      model: (formData.get("model") as string) || undefined,
      color: formData.get("color") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      dateLostFound: new Date(formData.get("dateLostFound") as string),
      contactEmail: (formData.get("contactEmail") as string) || undefined,
      contactPhone: (formData.get("contactPhone") as string) || undefined,
      priority: (formData.get("priority") as string) || "medium",
    }

    console.log("📝 Form data extracted:", data)

    // Validate the data
    console.log("✅ Validating form data...")
    const validationResult = reportSchema.safeParse(data)
    if (!validationResult.success) {
      console.log("❌ Validation failed:", validationResult.error)
      return {
        success: false,
        error: "Invalid form data",
        details: validationResult.error.flatten().fieldErrors,
      }
    }

    console.log("✅ Validation passed!")

    // Handle image upload
    let imageUrl = ""
    let imagePublicId = ""
    const imageFile = formData.get("image") as File

    if (imageFile && imageFile.size > 0) {
      console.log("📸 Uploading image...")
      try {
        const uploadResult = (await uploadImage(imageFile)) as any
        imageUrl = uploadResult.secure_url
        imagePublicId = uploadResult.public_id
        console.log("✅ Image uploaded successfully:", imageUrl)
      } catch (error) {
        console.error("❌ Image upload failed:", error)
        return { success: false, error: "Failed to upload image" }
      }
    }

    // Create the report
    console.log("💾 Creating report in database...")
    const reportData = {
      ...validationResult.data,
      userId,
      imageUrl: imageUrl || undefined,
      imagePublicId: imagePublicId || undefined,
      status: "active" as const,
      viewCount: 0,
      isVerified: false,
    }

    console.log("📄 Report data:", reportData)
    const newReport = await Report.create(reportData)
    console.log("✅ Report created with ID:", newReport._id)

    // Convert Mongoose document to plain object for matching
    const reportForMatching: ReportType = {
      _id: newReport._id.toString(),
      userId: newReport.userId.toString(),
      type: newReport.type as "lost" | "found",
      brand: newReport.brand,
      model: newReport.model,
      color: newReport.color,
      location: newReport.location,
      description: newReport.description,
      dateLostFound: newReport.dateLostFound,
      contactEmail: newReport.contactEmail,
      contactPhone: newReport.contactPhone,
      imageUrl: newReport.imageUrl,
      imagePublicId: newReport.imagePublicId,
      status: newReport.status as "active" | "resolved" | "expired",
      priority: newReport.priority as "low" | "medium" | "high",
      viewCount: newReport.viewCount,
      isVerified: newReport.isVerified,
      expiresAt: newReport.expiresAt,
      createdAt: newReport.createdAt,
      updatedAt: newReport.updatedAt,
    }

    // Find potential matches
    console.log("🔍 Finding potential matches...")
    const existingReports = await Report.find({
      userId: { $ne: userId },
      status: "active",
    }).lean()

    // Convert existing reports to proper format
    const existingReportsForMatching: ReportType[] = existingReports.map((report) => ({
      _id: report._id.toString(),
      userId: report.userId.toString(),
      type: report.type as "lost" | "found",
      brand: report.brand,
      model: report.model,
      color: report.color,
      location: report.location,
      description: report.description,
      dateLostFound: report.dateLostFound,
      contactEmail: report.contactEmail,
      contactPhone: report.contactPhone,
      imageUrl: report.imageUrl,
      imagePublicId: report.imagePublicId,
      status: report.status as "active" | "resolved" | "expired",
      priority: report.priority as "low" | "medium" | "high",
      viewCount: report.viewCount,
      isVerified: report.isVerified,
      expiresAt: report.expiresAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }))

    const matches = await findMatches(reportForMatching, existingReportsForMatching)
    console.log("🎯 Found matches:", matches.length)

    // Save matches to database
    if (matches.length > 0) {
      console.log("💾 Saving matches to database...")
      const matchDocuments = matches.map((match) => ({
        reportId: newReport._id,
        matchedReportId: match._id,
        similarity: 0.8,
        matchedBy: "auto" as const,
        confidence: "medium" as const,
        matchCriteria: {
          brand: newReport.brand.toLowerCase() === match.brand.toLowerCase(),
          color: newReport.color.toLowerCase() === match.color.toLowerCase(),
          location: newReport.location.toLowerCase().includes(match.location.toLowerCase()),
          model: newReport.model && match.model ? newReport.model.toLowerCase() === match.model.toLowerCase() : false,
          dateRange:
            Math.abs(new Date(newReport.dateLostFound).getTime() - new Date(match.dateLostFound).getTime()) <
            7 * 24 * 60 * 60 * 1000,
        },
      }))

      await Match.insertMany(matchDocuments)
      console.log("✅ Matches saved successfully")
    }

    console.log("🔄 Revalidating paths...")
    revalidatePath("/reports")
    revalidatePath("/dashboard")

    console.log("🎉 Report submission completed successfully!")

    // Redirect to reports page after successful submission
    redirect("/reports")
  } catch (error) {
    console.error("💥 Submit report error:", error)
    return { success: false, error: "Failed to submit report" }
  }
}
