/* eslint-disable @typescript-eslint/no-explicit-any */
import { IMatch } from '@/type/models';
import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: [true, 'Report ID is required'],
      index: true,
    },
    matchedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: [true, 'Matched report ID is required'],
      index: true,
    },
    similarity: {
      type: Number,
      required: [true, 'Similarity score is required'],
      min: [0, 'Similarity cannot be less than 0'],
      max: [1, 'Similarity cannot be greater than 1'],
      validate: {
        validator: (value: number) => value >= 0 && value <= 1,
        message: 'Similarity must be between 0 and 1',
      },
    },
    matchedBy: {
      type: String,
      enum: {
        values: ['auto', 'manual', 'ai', 'user_reported'],
        message: 'MatchedBy must be auto, manual, ai, or user_reported',
      },
      default: 'auto',
      index: true,
    },
    matchedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'rejected', 'expired'],
        message: 'Status must be pending, confirmed, rejected, or expired',
      },
      default: 'pending',
      index: true,
    },
    confidence: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'very_high'],
        message: 'Confidence must be low, medium, high, or very_high',
      },
      default: 'medium',
    },
    matchCriteria: {
      brand: {
        type: Boolean,
        default: false,
      },
      color: {
        type: Boolean,
        default: false,
      },
      location: {
        type: Boolean,
        default: false,
      },
      model: {
        type: Boolean,
        default: false,
      },
      dateRange: {
        type: Boolean,
        default: false,
      },
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    viewedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
MatchSchema.index({ reportId: 1, status: 1, createdAt: -1 });
MatchSchema.index({ matchedReportId: 1, status: 1, createdAt: -1 });
MatchSchema.index({ similarity: -1, confidence: 1 });
MatchSchema.index({ matchedBy: 1, status: 1 });
MatchSchema.index({ status: 1, expiresAt: 1 });

// Unique compound index to prevent duplicate matches
MatchSchema.index({ reportId: 1, matchedReportId: 1 }, { unique: true });

// Virtual for match age
MatchSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const created = this.createdAt;
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Pre-save middleware to set expiration
MatchSchema.pre('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to 30 days from creation
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method to find matches for a report
MatchSchema.statics.findMatchesForReport = function (
  reportId: string,
  status?: string
) {
  const query: any = {
    $or: [{ reportId }, { matchedReportId: reportId }],
  };

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('reportId')
    .populate('matchedReportId')
    .sort({ similarity: -1, createdAt: -1 });
};

// Static method to get high-confidence matches
MatchSchema.statics.getHighConfidenceMatches = function (threshold = 0.8) {
  return this.find({
    similarity: { $gte: threshold },
    status: 'pending',
  })
    .populate('reportId')
    .populate('matchedReportId')
    .sort({ similarity: -1 });
};

export default mongoose.models.Match ||
  mongoose.model<IMatch>('Match', MatchSchema);
