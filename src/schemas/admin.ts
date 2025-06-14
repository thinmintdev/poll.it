import { z } from 'zod';

// Category validation schemas
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(50, "Category name cannot exceed 50 characters")
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// User validation schemas
export const userUpdateSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters").optional(),
  display_name: z.string().max(50, "Display name cannot exceed 50 characters").nullish(),
  avatar_url: z.string().url("Invalid URL format").nullish(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").nullish(),
  is_admin: z.boolean().optional(),
  banned: z.boolean().optional()
});

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;

// Admin validation schema
export const adminProfileSchema = z.object({
  display_name: z.string().max(50, "Display name cannot exceed 50 characters").nullish(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").nullish(),
  avatar_url: z.string().url("Invalid URL format").nullish(),
});

export type AdminProfileFormValues = z.infer<typeof adminProfileSchema>;
