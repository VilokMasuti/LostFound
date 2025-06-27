import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: [true, 'Report ID is required'],
      index: true,
    },
    subject: {
      type: String,
      required: false,
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
      default: () => 'Message about your report',
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      required: false,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    messageType: {
      type: String,
      enum: {
        values: [
          'inquiry',
          'match_notification',
          'general',
          'system',
          'found_notification',
          'match_contact', // <-- Add this
          'quick_contact', // ✅ ADD THIS
           'contact_owner', // ✅ add this
        ],
        message:
          'Message type must be inquiry, match_notification, general, system, or found_notification',
      },
      default: 'inquiry',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'normal', 'high'],
        message: 'Priority must be low, normal, or high',
      },
      default: 'normal',
    },
    attachments: [
      {
        url: {
          type: String,
          required: false,
          trim: true,
        },
        filename: {
          type: String,
          required: false,
          trim: true,
        },
        size: {
          type: Number,
          required: false,
          min: [0, 'File size cannot be negative'],
        },
      },
    ],
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
MessageSchema.index({ to: 1, read: 1, createdAt: -1 });
MessageSchema.index({ from: 1, createdAt: -1 });
MessageSchema.index({ reportId: 1, createdAt: -1 });
MessageSchema.index({ to: 1, deleted: 1, createdAt: -1 });
MessageSchema.index({ messageType: 1, priority: 1 });

// Virtual for message age
MessageSchema.virtual('ageInHours').get(function () {
  const now = new Date();
  const created = this.createdAt;
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
});

// Pre-save middleware to set readAt when read is true
MessageSchema.pre('save', function (next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }

  if (this.isModified('deleted') && this.deleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }

  next();
});

// Static method to mark messages as read
MessageSchema.statics.markAsRead = function (
  messageIds: string[],
  userId: string
) {
  return this.updateMany(
    {
      _id: { $in: messageIds },
      to: userId,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );
};

// Static method to get unread count
MessageSchema.statics.getUnreadCount = function (userId: string) {
  return this.countDocuments({
    to: userId,
    read: false,
    deleted: false,
  });
};

export default mongoose.models.Message ||
  mongoose.model('Message', MessageSchema);
