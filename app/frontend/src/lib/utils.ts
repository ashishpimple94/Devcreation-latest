import { clsx, type ClassValue } from 'clsx';

/** Merge conditional class names. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format a number as Indian Rupees, matching the original site (₹1,234). */
export function formatRupee(amount: number): string {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relative "time ago" for notification timestamps. */
export function timeAgo(value: string | Date): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

const ASSET_BACKEND_BASE = (
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lightseagreen-donkey-692988.hostingersite.com'
).replace(/\/api\/?$/, '');

/**
 * Universal Image URL Resolver.
 * Handles data URIs, local Next.js static /assets, localhost:4000 uploads,
 * relative /uploads, and remote URLs with fallback.
 */
export function resolveImageUrl(url?: string | null, fallback = '/assets/Logos/logo.jpeg'): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const trimmed = url.trim();

  // If already a data URI or blob, use directly
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If local static asset in public folder (e.g. /assets/...)
  if (trimmed.startsWith('/assets/')) {
    return trimmed;
  }

  // If pointing to localhost:4000/uploads/...
  if (trimmed.includes('localhost:4000/uploads/')) {
    return trimmed.replace(/https?:\/\/localhost:4000\/uploads\//g, `${ASSET_BACKEND_BASE}/uploads/`);
  }

  // If pointing to localhost:3000/uploads/ or localhost:3001/uploads/
  if (trimmed.includes('localhost:3000/uploads/') || trimmed.includes('localhost:3001/uploads/')) {
    return trimmed.replace(/https?:\/\/localhost:(3000|3001)\/uploads\//g, `${ASSET_BACKEND_BASE}/uploads/`);
  }

  // If it's a relative uploads path /uploads/...
  if (trimmed.startsWith('/uploads/')) {
    return `${ASSET_BACKEND_BASE}${trimmed}`;
  }

  // If relative path without leading slash
  if (trimmed.startsWith('uploads/')) {
    return `${ASSET_BACKEND_BASE}/${trimmed}`;
  }

  return trimmed;
}
