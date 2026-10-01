import { api, apiUpload } from '@/lib/api';
import type {
  DashboardStats,
  Order,
  OrderStatus,
  Product,
  User,
  Category,
  GiftCard,
  PageMeta,
} from '@/types';

interface Listed<T> {
  items: T[];
  meta?: PageMeta;
}

function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) search.set(k, String(v));
  });
  const s = search.toString();
  return s ? `?${s}` : '';
}

export const adminService = {
  dashboard: async (): Promise<DashboardStats> => (await api.get<DashboardStats>('/admin/dashboard')).data,

  // Products
  listProducts: async (params: Record<string, unknown>): Promise<Listed<Product>> => {
    const res = await api.get<Product[]>(`/admin/products${qs({ ...params, includeInactive: true })}`);
    return { items: res.data, meta: res.meta };
  },
  createProduct: async (body: Record<string, unknown>): Promise<Product> =>
    (await api.post<Product>('/admin/products', body)).data,
  updateProduct: async (id: string, body: Record<string, unknown>): Promise<Product> =>
    (await api.patch<Product>(`/admin/products/${id}`, body)).data,
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },
  uploadImages: async (files: File[]): Promise<{ url: string }[]> => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return (await apiUpload<{ url: string }[]>('/admin/uploads', form)).data;
  },

  // Categories
  listCategories: async (): Promise<Category[]> => (await api.get<Category[]>('/admin/categories')).data,
  createCategory: async (body: Record<string, unknown>): Promise<Category> =>
    (await api.post<Category>('/admin/categories', body)).data,
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },

  // Orders
  listOrders: async (params: Record<string, unknown>): Promise<Listed<Order>> => {
    const res = await api.get<Order[]>(`/admin/orders${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  getOrder: async (id: string): Promise<Order> => (await api.get<Order>(`/admin/orders/${id}`)).data,
  updateOrderStatus: async (id: string, status: OrderStatus, note?: string): Promise<Order> =>
    (await api.patch<Order>(`/admin/orders/${id}/status`, { status, note })).data,

  // Customers
  listCustomers: async (params: Record<string, unknown>): Promise<Listed<User>> => {
    const res = await api.get<User[]>(`/admin/customers${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  getCustomer: async (id: string): Promise<User & { stats: { orders: number; totalSpent: number } }> =>
    (await api.get<User & { stats: { orders: number; totalSpent: number } }>(`/admin/customers/${id}`)).data,
  setCustomerActive: async (id: string, isActive: boolean): Promise<User> =>
    (await api.patch<User>(`/admin/customers/${id}/active`, { isActive })).data,

  // Gift Cards & Promo Codes
  listGiftCards: async (): Promise<GiftCard[]> =>
    (await api.get<GiftCard[]>('/admin/gift-cards')).data,
  createGiftCard: async (body: Partial<GiftCard>): Promise<GiftCard> =>
    (await api.post<GiftCard>('/admin/gift-cards', body)).data,
  toggleGiftCard: async (id: string): Promise<GiftCard> =>
    (await api.patch<GiftCard>(`/admin/gift-cards/${id}/toggle`)).data,
  deleteGiftCard: async (id: string): Promise<GiftCard> =>
    (await api.delete<GiftCard>(`/admin/gift-cards/${id}`)).data,
};
