/**
 * Image Optimization Utilities
 *
 * Helpers for optimizing image loading and display
 */

/**
 * Generate a blur placeholder as data URL
 * In production, you'd use a service like Plaiceholder or Blurhash
 * For now, return a simple gradient
 */
export function getBlurDataUrl(): string {
  return 'data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

/**
 * Image size configurations for Next.js Image component
 */
export const IMAGE_SIZES = {
  thumbnail: {
    width: 150,
    height: 150,
  },
  card: {
    width: 300,
    height: 200,
  },
  featured: {
    width: 600,
    height: 400,
  },
  fullWidth: {
    width: 1200,
    height: 800,
  },
};

/**
 * Responsive image sizes string for Next.js Image
 */
export const RESPONSIVE_SIZES = {
  card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  featured: '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw',
  fullWidth: '100vw',
  thumbnail: '(max-width: 768px) 50vw, 25vw',
};

/**
 * Image quality settings for Next.js Image
 */
export const IMAGE_QUALITY = {
  low: 60,      // For thumbnails
  medium: 75,   // For cards
  high: 90,     // For featured images
};

/**
 * Supported image formats
 */
export const IMAGE_FORMATS = ['webp', 'avif', 'jpeg', 'png'] as const;

/**
 * Check if image URL is external
 */
export function isExternalImage(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}

/**
 * Get image alt text
 */
export function getImageAlt(name: string, type: string = 'product'): string {
  return `${name} ${type} image`;
}

/**
 * Image loading strategies
 */
export const LOADING_STRATEGIES = {
  eager: 'eager',      // Load immediately (above fold)
  lazy: 'lazy',        // Lazy load (below fold)
} as const;

/**
 * Product image placeholder
 */
export const DEFAULT_PRODUCT_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext x="50%" y="50%" font-family="system-ui" font-size="14" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

/**
 * Helper to generate Next.js Image props
 */
export function getImageProps(
  src: string | undefined,
  alt: string,
  options?: {
    width?: number;
    height?: number;
    priority?: boolean;
    sizes?: string;
    quality?: number;
    objectFit?: 'contain' | 'cover' | 'fill';
  }
) {
  return {
    src: src || DEFAULT_PRODUCT_IMAGE,
    alt,
    fill: !options?.width && !options?.height,
    width: options?.width,
    height: options?.height,
    priority: options?.priority || false,
    quality: options?.quality || IMAGE_QUALITY.medium,
    sizes: options?.sizes || RESPONSIVE_SIZES.card,
    style: {
      objectFit: options?.objectFit || 'cover',
      objectPosition: 'center',
    },
  };
}
