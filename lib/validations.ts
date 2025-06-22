import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .max(50, 'Name cannot exceed 50 characters')
      .trim(),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const reportSchema = z.object({
  type: z.enum(['lost', 'found'], {
    required_error: 'Please select if the phone was lost or found',
  }),
  brand: z
    .string()
    .min(1, 'Brand is required')
    .max(50, 'Brand cannot exceed 50 characters')
    .trim(),
  model: z
    .string()
    .max(100, 'Model cannot exceed 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .min(1, 'Color is required')
    .max(30, 'Color cannot exceed 30 characters')
    .trim(),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters')
    .trim(),
  dateLostFound: z
    .date({ required_error: 'Date is required' })
    .refine((date) => date <= new Date(), {
      message: 'Date cannot be in the future',
    }),
  contactEmail: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase()
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .regex(
      /^[+]?[\d\s\-()]{7,20}$/,
      'Please provide a valid phone number (e.g., +91 9876543210 or 123-456-7890)'
    )
    .trim()
    .optional()
    .or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  image: z.any().optional(),
});

export const messageSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  subject: z
    .string()
    .max(200, 'Subject cannot exceed 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters')
    .trim(),
  messageType: z.enum(['inquiry', 'match_notification', 'general', 'system']),
  // ✅ Fixed
  priority: z.enum(['low', 'normal', 'high'], {
    required_error: 'Priority is required',
  }),
});

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase()
    .optional(),
});

// ✅ Types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
