export interface User {
  [x: string]: string | StaticImport;
  [x: string]: any;
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLogin?: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  _id: string;
  userId: string;
  type: 'lost' | 'found';
  brand: string;
  model?: string;
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
  user?: User;
  ageInDays?: number;
}

export interface Match {
  _id: string;
  reportId: string;
  matchedReportId: string;
  similarity: number;
  matchedBy: 'auto' | 'manual' | 'ai' | 'user_reported';
  matchedByUser?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  confidence: 'low' | 'medium' | 'high' | 'very_high';
  matchCriteria: {
    brand: boolean;
    color: boolean;
    location: boolean;
    model: boolean;
    dateRange: boolean;
  };
  notes?: string;
  viewedBy: Array<{
    userId: string;
    viewedAt: Date;
  }>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  ageInDays?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface Message {
  _id: string;
  from: User;
  to: User;
  reportId: string;
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
  report?: Report;
  ageInHours?: number;
}

export interface MessageFormData {
  message: string;
  reportId: string;
  subject?: string;
  messageType?: 'inquiry' | 'match_notification' | 'general' | 'system';
  priority?: 'low' | 'normal' | 'high';
}
