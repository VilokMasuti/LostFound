import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    model: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    dateLostFound: {
      type: Date,
      required: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          if (!v) return true // Optional field
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: "Please provide a valid email address",
      },
    },
    contactPhone: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => {
          if (!v) return true // Optional field
          // More flexible phone validation - accepts various international formats
          return /^[+]?[\d\s\-()]{7,20}$/.test(v)
        },
        message: "Please provide a valid phone number",
      },
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "resolved", "expired"],
      default: "active",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
reportSchema.index({ userId: 1, status: 1 })
reportSchema.index({ type: 1, status: 1 })
reportSchema.index({ brand: 1, color: 1, status: 1 })
reportSchema.index({ location: "text", description: "text" })

export default mongoose.models.Report || mongoose.model("Report", reportSchema)
