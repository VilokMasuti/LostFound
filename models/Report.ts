/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, { models } from 'mongoose';

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['lost', 'found'],
        message: "Type must be either 'lost' or 'found'",
      },
      required: [true, 'Report type is required'],
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'Phone brand is required'],
      trim: true,
      minlength: [1, 'Brand cannot be empty'],
      maxlength: [50, 'Brand cannot exceed 50 characters'],
      index: true,
    },
    model: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, 'Model cannot exceed 100 characters'],
    },
    color: {
      type: String,
      required: [true, 'Phone color is required'],
      trim: true,
      minlength: [1, 'Color cannot be empty'],
      maxlength: [30, 'Color cannot exceed 30 characters'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [3, 'Location must be at least 3 characters'],
      maxlength: [200, 'Location cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    dateLostFound: {
      type: Date,
      required: [true, 'Date lost/found is required'],
      validate: {
        validator: (value: Date) => value <= new Date(),
        message: 'Date cannot be in the future',
      },
      index: true,
    },
    contactEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    contactPhone: {
      type: String,
      required: false,
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number'],
    },
    imageUrl: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: (value: string) => {
          if (!value) return true;
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
        },
        message: 'Please provide a valid image URL',
      },
    },
    imagePublicId: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'resolved', 'expired', 'deleted'],
        message: 'Status must be active, resolved, expired, or deleted',
      },
      default: 'active',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be low, medium, high, or urgent',
      },
      default: 'medium',
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: false,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
// Compound indexes for efficient queries
ReportSchema.index({ type: 1, status: 1, createdAt: -1 });
ReportSchema.index({ brand: 1, color: 1, location: 1 });
ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ location: 'text', description: 'text', brand: 'text' });
ReportSchema.index({ dateLostFound: -1, type: 1 });
ReportSchema.index({ status: 1, expiresAt: 1 });
// Virtual for age of report
ReportSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const created = this.createdAt;
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Pre-save middleware to set expiration
ReportSchema.pre('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to 90 days from creation
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  next();
});
// Static method to find similar reports
ReportSchema.statics.findSimilar = function (report: any, limit = 10) {
  const oppositeType = report.type === 'lost' ? 'found' : 'lost';

  return this.find({
    type: oppositeType,
    status: 'active',
    $or: [
      { brand: new RegExp(report.brand, 'i') },
      { color: new RegExp(report.color, 'i') },
      { location: new RegExp(report.location, 'i') },
    ],
  })
    .limit(limit)
    .sort({ createdAt: -1 });
};
export const Report = models.Report || mongoose.model('Report', ReportSchema);

export default Report;
