// Re-export API types for consistency
export type {
  UserStats,
  MessageFormData,
  ReportFormData,
  APIResponse,
  PaginatedResponse,
} from "./api"

// Context types
export interface AuthContextType {
  user: APIUser | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

export interface ThemeContextType {
  theme: "light" | "dark"
  toggleTheme: () => void
}

// Import API types
import type { APIUser } from "./api"

// Frontend Report interface that handles both string and Date types
export interface FrontendReport {
  _id: string
  userId: string
  type: "lost" | "found"
  brand: string
  model?: string
  color: string
  location: string
  description: string
  dateLostFound: string | Date
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
  imagePublicId?: string
  status: "active" | "resolved" | "expired" | "deleted"
  priority: "low" | "medium" | "high" | "urgent"
  viewCount: number
  isVerified: boolean
  expiresAt?: string | Date
  createdAt: string | Date
  updatedAt: string | Date
  user?: User
  ageInDays?: number
}

export interface User {
  _id: string
  name: string
  email: string
  isActive: boolean
  lastLogin?: Date
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Report {
  _id: string
  userId: string
  type: "lost" | "found"
  brand: string
  model?: string
  color: string
  location: string
  description: string
  dateLostFound: string
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
  imagePublicId?: string
  status: "active" | "resolved" | "expired" | "deleted"
  priority: "low" | "medium" | "high" | "urgent"
  viewCount: number
  isVerified: boolean
  expiresAt?: string
  createdAt: string
  updatedAt: string
  user?: User
  ageInDays?: number
}

export interface Match {
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
  report?: Report
  matchedReport?: Report
}

export interface Message {
  _id: string
  from: User
  to: User
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
  report?: Report
  ageInHours?: number
}
