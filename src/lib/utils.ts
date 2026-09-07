import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize a free-text search query to prevent SQL LIKE injection.
 * Removes wildcard characters, backslashes, and control characters.
 */
export function sanitizeSearch(input: string): string {
  if (!input) return "";
  return input
    .replace(/[%_\\]/g, "") // Remove SQL LIKE wildcards and escape char
    .replace(/[<>'"]/g, "") // Remove common HTML/XML injection chars
    .trim();
}
