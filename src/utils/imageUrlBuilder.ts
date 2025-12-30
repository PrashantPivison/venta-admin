/**
 * Image URL Builder Utility
 * 
 * Handles building complete image URLs from relative paths
 * Uses base URL from environment variables
 */

/**
 * Get the API base URL from environment or default
 */
const getImageBaseUrl = (): string => {
  const env = import.meta.env as Record<string, string>;
  return env.VITE_API_URL || 'http://localhost:5000';
};

/**
 * Build complete image URL from relative path
 * @param imagePath - Relative image path (e.g., '/uploads/products/image.jpg')
 * @returns Complete image URL
 */
export const buildImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    return '';
  }

  // If it's already an absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const baseUrl = getImageBaseUrl();

  // If it starts with /, prepend base URL
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`;
  }

  // Otherwise prepend base URL with /
  return `${baseUrl}/${imagePath}`;
};

/**
 * Validate image URL is accessible
 * @param url - Image URL to validate
 * @returns true if image URL is accessible
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
