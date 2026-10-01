// Shared frontend domain types mirroring the backend API responses.

export type Role = 'super_admin' | 'admin' | 'manager' | 'customer';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'card' | 'upi';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta;
  error?: unknown;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  wishlist?: string[];
  createdAt: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  type: string;
  fragrance: string;
  description: string;
  category?: Category | string | null;
  price: number;
  compareAtPrice?: number;
  discountPercent: number;
  weight?: string;
  stock: number;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
}

export interface CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    stock: number;
    weight?: string;
  };
  variantSku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  itemsTotal: number;
  shippingFee: number;
  total: number;
}

export interface OrderItem {
  product: string;
  name: string;
  sku: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  note?: string;
  changedBy?: { name: string; role: Role } | string;
  changedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; name: string; email: string; phone?: string };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  itemsTotal: number;
  shippingFee: number;
  discount?: number;
  promoCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  statusHistory: StatusHistoryEntry[];
  placedAt: string;
  createdAt: string;
}

export interface Address extends ShippingAddress {
  _id: string;
  isDefault: boolean;
}

export type NotificationType =
  | 'new_order'
  | 'order_status'
  | 'payment_received'
  | 'order_cancelled'
  | 'low_stock'
  | 'product_created'
  | 'product_updated'
  | 'customer_registered';

export interface AppNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntity?: { kind: string; id: string; ref?: string };
  createdAt: string;
}

export interface DashboardStats {
  totals: {
    revenue: number;
    orders: number;
    pendingOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
    customers: number;
    products: number;
    lowStockProducts: number;
  };
  recentOrders: Order[];
  recentCustomers: User[];
  salesByDay: { _id: string; revenue: number; orders: number }[];
  topProducts: { _id: string; name: string; unitsSold: number; revenue: number }[];
}

export interface GiftCard {
  _id: string;
  code: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

