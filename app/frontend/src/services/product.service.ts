import { api } from '@/lib/api';
import type { Product, Category, PageMeta } from '@/types';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular';
  featured?: boolean;
}

function toQueryString(query: ProductQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) params.set(key, String(value));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const productService = {
  async list(query: ProductQuery = {}): Promise<{ items: Product[]; meta?: PageMeta }> {
    const res = await api.get<Product[]>(`/products${toQueryString(query)}`, { auth: false });
    return { items: res.data, meta: res.meta };
  },

  async getBySlug(slug: string): Promise<Product> {
    const res = await api.get<Product>(`/products/${slug}`, { auth: false });
    return res.data;
  },

  async related(slug: string): Promise<Product[]> {
    const res = await api.get<Product[]>(`/products/${slug}/related`, { auth: false });
    return res.data;
  },

  async categories(): Promise<Category[]> {
    const res = await api.get<Category[]>('/categories', { auth: false });
    return res.data;
  },

  async listReviews(idOrSlug: string): Promise<{ reviews: ProductReview[]; summary: ReviewsSummary }> {
    const res = await api.get<{ reviews: ProductReview[]; summary: ReviewsSummary }>(
      `/products/${idOrSlug}/reviews`,
      { auth: false },
    );
    return res.data;
  },

  async createReview(
    idOrSlug: string,
    data: { rating: number; title: string; comment: string },
  ): Promise<ProductReview> {
    const res = await api.post<ProductReview>(`/products/${idOrSlug}/reviews`, data);
    return res.data;
  },

  async markReviewHelpful(reviewId: string): Promise<ProductReview> {
    const res = await api.post<ProductReview>(`/products/reviews/${reviewId}/helpful`, {}, { auth: false });
    return res.data;
  },
};

