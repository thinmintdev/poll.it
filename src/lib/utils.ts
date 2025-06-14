// src/lib/utils.ts
// Utility functions for UI components (shadcn/ui, Radix, etc.)

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names conditionally, supporting Tailwind and Radix UI patterns.
 * Usage: cn('foo', isActive && 'bar', ...)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
