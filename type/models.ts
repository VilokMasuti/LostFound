import type { Document, Types } from 'mongoose';

// User Interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  lastLogin?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

// Report Interface
export interface IReport extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'lost' | 'found';
  brand: string;
  deviceModel?: string;
  color: string;
  location: string;
  description: string;
  dateLostFound: Date;
  contactEmail?: string;
  contactPhone?: string;
  imageUrl?: string;
  imagePublicId?: string;
  status: 'active' | 'resolved' | 'expired' | 'deleted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  viewCount: number;
  isVerified: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  ageInDays: number;
}

// Message Interface
export interface IMessage extends Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  reportId: Types.ObjectId;
  subject?: string;
  message: string;
  read: boolean;
  readAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  messageType: 'inquiry' | 'match_notification' | 'general' | 'system';
  priority: 'low' | 'normal' | 'high';
  attachments: Array<{
    url?: string;
    filename?: string;
    size?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  ageInHours: number;
}

// Match Interface
export interface IMatch extends Document {
  _id: Types.ObjectId;
  reportId: Types.ObjectId;
  matchedReportId: Types.ObjectId;
  similarity: number;
  matchedBy: 'auto' | 'manual' | 'ai' | 'user_reported';
  matchedByUser?: Types.ObjectId;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  confidence: 'low' | 'medium' | 'high' | 'very_high';
  matchCriteria: {
    brand: boolean;
    color: boolean;
    location: boolean;
    deviceModel: boolean;
    dateRange: boolean;
  };
  notes?: string;
  viewedBy: Array<{
    userId: Types.ObjectId;
    viewedAt: Date;
  }>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  ageInDays: number;
}

// Export for use in other files
export type User = IUser;
export type Report = IReport;
export type Message = IMessage;
export type Match = IMatch;
