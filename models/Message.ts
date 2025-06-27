/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Model,
  Schema,
  Types,
  model,
  models,
} from 'mongoose';

interface IMessage {
  from: Types.ObjectId;
  to: Types.ObjectId;
  reportId: Types.ObjectId;
  subject?: string;
  message: string;
  read: boolean;
  readAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  messageType: string;
  priority: string;
  attachments?: {
    url?: string;
    filename?: string;
    size?: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageModel extends Model<IMessage> {
  markAsRead(messageIds: string[], userId: string): Promise<any>;
  getUnreadCount(userId: string): Promise<number>;
}

const MessageSchema = new Schema<IMessage, MessageModel>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
      default: 'Message about your report',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    messageType: {
      type: String,
      enum: [
        'inquiry',
        'match_notification',
        'general',
        'system',
        'found_notification',
        'match_contact',
        'quick_contact',
        'contact_owner',
      ],
      default: 'inquiry',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    attachments: [
      {
        url: String,
        filename: String,
        size: {
          type: Number,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
MessageSchema.index({ to: 1, read: 1, createdAt: -1 });
MessageSchema.index({ from: 1, createdAt: -1 });
MessageSchema.index({ reportId: 1, createdAt: -1 });
MessageSchema.index({ to: 1, deleted: 1, createdAt: -1 });
MessageSchema.index({ messageType: 1, priority: 1 });

// Virtual
MessageSchema.virtual('ageInHours').get(function () {
  const now = new Date();
  if (!this.createdAt) return undefined;
  return Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60));
});

// Middleware
MessageSchema.pre('save', function (next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  if (this.isModified('deleted') && this.deleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  next();
});

// Statics
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

MessageSchema.statics.getUnreadCount = function (userId: string) {
  return this.countDocuments({
    to: userId,
    read: false,
    deleted: false,
  });
};

// Export
const Message =
  (models.Message as MessageModel) ||
  model<IMessage, MessageModel>('Message', MessageSchema);

export default Message;
