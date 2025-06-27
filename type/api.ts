/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Types } from "mongoose"

// Base interfaces for API responses
export interface APIUser {
  id: any
  _id: string
  name: string
  email: string
  isActive: boolean
  emailVerified: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface APIReport {
  _id: string
  userId: string
  type: "lost" | "found"
  brand: string
  model?: string
  color: string
  location: string
  description: string
  dateLostFound: Date
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
  imagePublicId?: string
  status: "active" | "resolved" | "expired" | "deleted"
  priority: "low" | "medium" | "high" | "urgent"
  viewCount: number
  isVerified: boolean
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  user?: APIUser
  ageInDays?: number
}

export interface APIMessage {
  _id: string
  from: APIUser
  to: APIUser
  reportId: string
  subject?: string
  message: string
  read: boolean
  readAt?: Date
  deleted: boolean
  deletedAt?: Date
  messageType: "inquiry" | "match_notification" | "general" | "system"
  priority: "low" | "normal" | "high"
  attachments: Array<{
    url?: string
    filename?: string
    size?: number
  }>
  createdAt: Date
  updatedAt: Date
  report?: APIReport
  ageInHours?: number
}

export interface APIMatch {
  _id: string
  reportId: string
  matchedReportId: string
  similarity: number
  matchedBy: "auto" | "manual" | "ai" | "user_reported"
  matchedByUser?: string
  status: "pending" | "confirmed" | "rejected" | "expired"
  confidence: "low" | "medium" | "high" | "very_high"
  matchCriteria: {
    brand: boolean
    color: boolean
    location: boolean
    model: boolean
    dateRange: boolean
  }
  notes?: string
  viewedBy: Array<{
    userId: string
    viewedAt: Date
  }>
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  ageInDays?: number
  report?: APIReport
  matchedReport?: APIReport
}

// Mongoose populated document interfaces
export interface PopulatedUser {
  _id: Types.ObjectId
  name: string
  email: string
}

export interface PopulatedReport {
  _id: Types.ObjectId
  userId: PopulatedUser
  type: "lost" | "found"
  brand: string
  model?: string
  color: string
  location: string
  description: string
  dateLostFound: Date
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
  imagePublicId?: string
  status: "active" | "resolved" | "expired" | "deleted"
  priority: "low" | "medium" | "high" | "urgent"
  viewCount: number
  isVerified: boolean
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PopulatedMessage {
  _id: Types.ObjectId
  from: PopulatedUser
  to: PopulatedUser
  reportId: PopulatedReport
  subject?: string
  message: string
  read: boolean
  readAt?: Date
  deleted: boolean
  deletedAt?: Date
  messageType: "inquiry" | "match_notification" | "general" | "system"
  priority: "low" | "normal" | "high"
  attachments: Array<{
    url?: string
    filename?: string
    size?: number
  }>
  createdAt: Date
  updatedAt: Date
}

export interface PopulatedMatch {
  _id: Types.ObjectId
  reportId: PopulatedReport
  matchedReportId: PopulatedReport
  similarity: number
  matchedBy: "auto" | "manual" | "ai" | "user_reported"
  matchedByUser?: Types.ObjectId
  status: "pending" | "confirmed" | "rejected" | "expired"
  confidence: "low" | "medium" | "high" | "very_high"
  matchCriteria: {
    brand: boolean
    color: boolean
    location: boolean
    model: boolean
    dateRange: boolean
  }
  notes?: string
  viewedBy: Array<{
    userId: Types.ObjectId
    viewedAt: Date
  }>
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface APIResponse<T = any> {
  message?: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form data types
export interface MessageFormData {
  reportId: string
  message: string
  subject?: string
  messageType?: "inquiry" | "match_notification" | "general" | "system"
  priority?: "low" | "normal" | "high"
}

export interface ReportFormData {
  type: "lost" | "found"
  brand: string
  model?: string
  color: string
  location: string
  description: string
  dateLostFound: Date
  contactEmail?: string
  contactPhone?: string
  priority?: "low" | "medium" | "high" | "urgent"
  image?: File
}

export interface UserStats {
  totalReports: number
  lostReports: number
  foundReports: number
  matches: number
  unreadMessages: number
}
