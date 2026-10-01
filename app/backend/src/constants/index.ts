/** Shared enums and constant values used across the backend. */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  CUSTOMER: 'customer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles that may access the admin panel / admin APIs. */
export const STAFF_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/**
 * Allowed forward transitions for an order's lifecycle. Enforced server-side so
 * an admin cannot, for example, move a delivered order back to pending.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: [],
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHOD = {
  COD: 'cod',
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const NOTIFICATION_TYPE = {
  NEW_ORDER: 'new_order',
  ORDER_STATUS: 'order_status',
  PAYMENT_RECEIVED: 'payment_received',
  ORDER_CANCELLED: 'order_cancelled',
  LOW_STOCK: 'low_stock',
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  CUSTOMER_REGISTERED: 'customer_registered',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

/** Redis Pub/Sub channels. */
export const REDIS_CHANNELS = {
  EVENTS: 'devcreation:events',
} as const;

/** Socket.IO room / event names. */
export const SOCKET_EVENTS = {
  ADMIN_NOTIFICATION: 'admin:notification',
  ADMIN_DASHBOARD_UPDATE: 'admin:dashboard:update',
  ORDER_UPDATED: 'order:updated',
  CUSTOMER_NOTIFICATION: 'customer:notification',
} as const;

export const SOCKET_ROOMS = {
  admins: 'role:admins',
  user: (userId: string) => `user:${userId}`,
};

/** Cache key builders + TTLs (seconds). */
export const CACHE = {
  TTL: {
    PRODUCTS: 60 * 5,
    PRODUCT: 60 * 10,
    CATEGORIES: 60 * 30,
    DASHBOARD: 60,
  },
  KEY: {
    productList: (q: string) => `cache:products:list:${q}`,
    product: (idOrSlug: string) => `cache:product:${idOrSlug}`,
    categories: () => 'cache:categories:all',
    dashboard: () => 'cache:dashboard:stats',
  },
  /** Wildcards used to bust groups of keys on writes. */
  PATTERN: {
    productLists: 'cache:products:list:*',
    products: 'cache:product:*',
  },
} as const;

export const LOW_STOCK_THRESHOLD = 5;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;
