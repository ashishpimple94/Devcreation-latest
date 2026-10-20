"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_node_http = require("http");

// src/app.ts
var import_node_path2 = __toESM(require("path"));
var import_promises2 = __toESM(require("fs/promises"));
var import_express12 = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_cors2 = __toESM(require("cors"));
var import_compression = __toESM(require("compression"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_morgan = __toESM(require("morgan"));
var import_express_mongo_sanitize = __toESM(require("express-mongo-sanitize"));

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"));
var import_zod = require("zod");
import_dotenv.default.config();
var schema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("development"),
  PORT: import_zod.z.coerce.number().default(4e3),
  API_PREFIX: import_zod.z.string().default("/api"),
  CORS_ORIGIN: import_zod.z.string().default("*"),
  MONGODB_URI: import_zod.z.string().default(
    "mongodb+srv://devcreation:devcreation@cluster0.ezzkjmw.mongodb.net/dev_creation?retryWrites=true&w=majority&appName=Cluster0"
  ),
  REDIS_URL: import_zod.z.string().default("redis://127.0.0.1:6379"),
  JWT_ACCESS_SECRET: import_zod.z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars").default("dev_access_secret_change_me_0123456789abcdef"),
  JWT_REFRESH_SECRET: import_zod.z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars").default("dev_refresh_secret_change_me_0123456789abcdef"),
  JWT_ACCESS_EXPIRES: import_zod.z.string().default("15m"),
  JWT_REFRESH_EXPIRES: import_zod.z.string().default("7d"),
  STORAGE_DRIVER: import_zod.z.enum(["local", "s3", "cloudinary"]).default("local"),
  UPLOAD_DIR: import_zod.z.string().default("uploads"),
  MAX_UPLOAD_MB: import_zod.z.coerce.number().default(5),
  PUBLIC_ASSET_BASE: import_zod.z.string().default("http://localhost:4000"),
  SEED_ADMIN_NAME: import_zod.z.string().default("Super Admin"),
  SEED_ADMIN_EMAIL: import_zod.z.string().email().default("admin@devcreation.example"),
  SEED_ADMIN_PASSWORD: import_zod.z.string().min(6).default("Admin@12345"),
  RATE_LIMIT_WINDOW_MS: import_zod.z.coerce.number().default(15 * 60 * 1e3),
  RATE_LIMIT_MAX: import_zod.z.coerce.number().default(300),
  // ── Email (SMTP Hostinger) ──────────────────────────
  SMTP_HOST: import_zod.z.string().default("smtp.hostinger.com"),
  SMTP_PORT: import_zod.z.coerce.number().default(465),
  SMTP_SECURE: import_zod.z.union([import_zod.z.boolean(), import_zod.z.enum(["true", "false", "1", "0"])]).default("true").transform((v) => v === true || v === "true" || v === "1"),
  SMTP_USER: import_zod.z.string().default("support@devcreation24.in"),
  SMTP_PASS: import_zod.z.string().default("Devcreation@890*"),
  EMAIL_FROM: import_zod.z.string().default("Dev Creation <support@devcreation24.in>"),
  ADMIN_NOTIFY_EMAIL: import_zod.z.string().default("support@devcreation24.in"),
  STORE_URL: import_zod.z.string().default("https://devcreation24.in"),
  // ── SMS Gateways (Fast2SMS / 2Factor / Twilio) ───────
  FAST2SMS_API_KEY: import_zod.z.string().optional(),
  TWO_FACTOR_API_KEY: import_zod.z.string().optional(),
  TWILIO_ACCOUNT_SID: import_zod.z.string().optional(),
  TWILIO_AUTH_TOKEN: import_zod.z.string().optional(),
  TWILIO_PHONE_NUMBER: import_zod.z.string().optional(),
  ENABLE_SMS_FALLBACK_DEMO: import_zod.z.union([import_zod.z.boolean(), import_zod.z.enum(["true", "false", "1", "0"])]).default("true").transform((v) => v === true || v === "true" || v === "1")
});
var parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("\u274C Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}
var env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === "production",
  corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim())
};

// src/utils/logger.ts
var import_winston = __toESM(require("winston"));
var { combine, timestamp, printf, colorize, json } = import_winston.default.format;
var devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} ${level} ${message}${rest}`;
  })
);
var logger = import_winston.default.createLogger({
  level: env.isProd ? "info" : "debug",
  format: env.isProd ? combine(timestamp(), json()) : devFormat,
  transports: [new import_winston.default.transports.Console()]
});

// src/middleware/rateLimiter.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var import_rate_limit_redis = require("rate-limit-redis");

// src/config/redis.ts
var import_ioredis = __toESM(require("ioredis"));
var redisState = { available: true };
function createClient(role) {
  const client = new import_ioredis.default(env.REDIS_URL, {
    // Fail fast and stop retrying so a missing Redis does not spam logs or
    // hang requests. Commands issued while offline reject quickly and callers
    // fall back to MongoDB.
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: () => null,
    reconnectOnError: () => false
  });
  client.on("connect", () => {
    redisState.available = true;
    logger.info(`Redis connected (${role})`);
  });
  client.on("error", (err) => {
    if (redisState.available) {
      logger.warn(`Redis unavailable (${role}) \u2014 continuing without it`, { err: err.message });
    }
    redisState.available = false;
  });
  client.on("end", () => {
    redisState.available = false;
  });
  return client;
}
var redis = createClient("main");
var publisher = createClient("publisher");
var subscriber = createClient("subscriber");
async function connectRedis() {
  try {
    await Promise.all([redis.connect(), publisher.connect(), subscriber.connect()]);
    redisState.available = true;
    return true;
  } catch (err) {
    redisState.available = false;
    logger.warn("Starting without Redis \u2014 caching, rate limiting and Pub/Sub run in degraded mode", {
      err: err.message
    });
    return false;
  }
}
async function disconnectRedis() {
  await Promise.allSettled([redis.quit(), publisher.quit(), subscriber.quit()]);
}

// src/middleware/rateLimiter.ts
function makeLimiter(options) {
  let store;
  if (redisState.available) {
    store = new import_rate_limit_redis.RedisStore({
      prefix: `rl:${options.prefix}:`,
      sendCommand: (command, ...args) => redis.call(command, ...args)
    });
  }
  return (0, import_express_rate_limit.default)({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    ...store ? { store } : {},
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
      error: null
    }
  });
}
var _apiLimiter = null;
var _authLimiter = null;
function initRateLimiters() {
  _apiLimiter = makeLimiter({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX, prefix: "api" });
  _authLimiter = makeLimiter({ windowMs: 15 * 60 * 1e3, max: 20, prefix: "auth" });
}
var apiLimiter = (req, res, next) => {
  if (!_apiLimiter) _apiLimiter = makeLimiter({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX, prefix: "api" });
  return _apiLimiter(req, res, next);
};
var authLimiter = (req, res, next) => {
  if (!_authLimiter) _authLimiter = makeLimiter({ windowMs: 15 * 60 * 1e3, max: 20, prefix: "auth" });
  return _authLimiter(req, res, next);
};

// src/middleware/error.ts
var import_mongoose = __toESM(require("mongoose"));

// src/utils/ApiError.ts
var ApiError = class _ApiError extends Error {
  statusCode;
  details;
  isOperational;
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(message = "Bad request", details) {
    return new _ApiError(400, message, details);
  }
  static unauthorized(message = "Not authenticated") {
    return new _ApiError(401, message);
  }
  static forbidden(message = "You do not have permission to perform this action") {
    return new _ApiError(403, message);
  }
  static notFound(message = "Resource not found") {
    return new _ApiError(404, message);
  }
  static conflict(message = "Resource already exists") {
    return new _ApiError(409, message);
  }
  static internal(message = "Something went wrong") {
    return new _ApiError(500, message);
  }
};

// src/utils/apiResponse.ts
function sendSuccess(res, data, message = "Success", statusCode = 200, meta) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...meta ? { meta } : {}
  });
}
function sendError(res, statusCode, message, error) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ?? null
  });
}

// src/middleware/error.ts
function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = "Something went wrong";
  let details;
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof import_mongoose.default.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
  } else if (err instanceof import_mongoose.default.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11e3) {
    statusCode = 409;
    const keys = Object.keys(err.keyValue ?? {});
    message = `Duplicate value for: ${keys.join(", ")}`;
  } else if (err instanceof Error) {
    message = err.message || message;
  }
  const isServerError = statusCode >= 500;
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?.id
  };
  if (isServerError) {
    logger.error(message, { ...logPayload, stack: err.stack });
  } else {
    logger.warn(message, logPayload);
  }
  return sendError(
    res,
    statusCode,
    message,
    env.isProd ? details : details ?? (err instanceof Error ? { stack: err.stack } : void 0)
  );
}

// src/config/cors.ts
var corsOriginHandler = (_origin, callback) => {
  callback(null, true);
};

// src/routes/index.ts
var import_express11 = require("express");

// src/routes/auth.routes.ts
var import_express = require("express");

// src/services/auth.service.ts
var import_node_crypto = __toESM(require("crypto"));

// src/models/User.ts
var import_mongoose2 = require("mongoose");
var import_bcryptjs = __toESM(require("bcryptjs"));

// src/constants/index.ts
var ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  CUSTOMER: "customer"
};
var STAFF_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];
var ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded"
};
var ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: []
};
var PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded"
};
var PAYMENT_METHOD = {
  COD: "cod",
  CARD: "card",
  UPI: "upi",
  NETBANKING: "netbanking"
};
var NOTIFICATION_TYPE = {
  NEW_ORDER: "new_order",
  ORDER_STATUS: "order_status",
  PAYMENT_RECEIVED: "payment_received",
  ORDER_CANCELLED: "order_cancelled",
  LOW_STOCK: "low_stock",
  PRODUCT_CREATED: "product_created",
  PRODUCT_UPDATED: "product_updated",
  CUSTOMER_REGISTERED: "customer_registered"
};
var REDIS_CHANNELS = {
  EVENTS: "devcreation:events"
};
var SOCKET_EVENTS = {
  ADMIN_NOTIFICATION: "admin:notification",
  ADMIN_DASHBOARD_UPDATE: "admin:dashboard:update",
  ORDER_UPDATED: "order:updated",
  CUSTOMER_NOTIFICATION: "customer:notification"
};
var SOCKET_ROOMS = {
  admins: "role:admins",
  user: (userId) => `user:${userId}`
};
var CACHE = {
  TTL: {
    PRODUCTS: 60 * 5,
    PRODUCT: 60 * 10,
    CATEGORIES: 60 * 30,
    DASHBOARD: 60
  },
  KEY: {
    productList: (q) => `cache:products:list:${q}`,
    product: (idOrSlug) => `cache:product:${idOrSlug}`,
    categories: () => "cache:categories:all",
    dashboard: () => "cache:dashboard:stats"
  },
  /** Wildcards used to bust groups of keys on writes. */
  PATTERN: {
    productLists: "cache:products:list:*",
    products: "cache:product:*"
  }
};
var LOW_STOCK_THRESHOLD = 5;
var PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};

// src/models/User.ts
var userSchema = new import_mongoose2.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    // `select: false` keeps the hash out of query results unless explicitly requested.
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
      index: true
    },
    phone: { type: String, trim: true, index: true, sparse: true },
    isActive: { type: Boolean, default: true },
    profileComplete: { type: Boolean, default: false },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" }
    },
    wishlist: [{ type: import_mongoose2.Schema.Types.ObjectId, ref: "Product" }]
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await import_bcryptjs.default.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return import_bcryptjs.default.compare(candidate, this.password);
};
var User = (0, import_mongoose2.model)("User", userSchema);

// src/models/Cart.ts
var import_mongoose3 = require("mongoose");
var cartItemSchema = new import_mongoose3.Schema(
  {
    product: { type: import_mongoose3.Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: { type: String },
    quantity: { type: Number, required: true, min: 1, default: 1 }
  },
  { _id: false }
);
var cartSchema = new import_mongoose3.Schema(
  {
    user: { type: import_mongoose3.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);
var Cart = (0, import_mongoose3.model)("Cart", cartSchema);

// src/utils/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
function signAccessToken(payload) {
  return import_jsonwebtoken.default.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES
  });
}
function signRefreshToken(payload) {
  return import_jsonwebtoken.default.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES
  });
}
function verifyAccessToken(token) {
  return import_jsonwebtoken.default.verify(token, env.JWT_ACCESS_SECRET);
}
function verifyRefreshToken(token) {
  return import_jsonwebtoken.default.verify(token, env.JWT_REFRESH_SECRET);
}

// src/redis/kv.ts
var memory = /* @__PURE__ */ new Map();
function sweep() {
  const now = Date.now();
  for (const [key, entry] of memory) {
    if (entry.expiresAt <= now) memory.delete(key);
  }
}
var kv = {
  async set(key, value, ttlSeconds) {
    if (redisState.available) {
      try {
        await redis.set(key, value, "EX", ttlSeconds);
        return;
      } catch {
      }
    }
    memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1e3 });
  },
  async get(key) {
    if (redisState.available) {
      try {
        return await redis.get(key);
      } catch {
      }
    }
    sweep();
    const entry = memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      memory.delete(key);
      return null;
    }
    return entry.value;
  },
  async del(key) {
    if (redisState.available) {
      try {
        await redis.del(key);
        return;
      } catch {
      }
    }
    memory.delete(key);
  }
};

// src/services/notification.service.ts
var import_mongoose5 = require("mongoose");

// src/models/Notification.ts
var import_mongoose4 = require("mongoose");
var notificationSchema = new import_mongoose4.Schema(
  {
    user: { type: import_mongoose4.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    forStaff: { type: Boolean, default: false, index: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntity: {
      kind: { type: String, enum: ["order", "product", "user"] },
      id: { type: import_mongoose4.Schema.Types.ObjectId },
      ref: { type: String }
    },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ forStaff: 1, isRead: 1, createdAt: -1 });
var Notification = (0, import_mongoose4.model)("Notification", notificationSchema);

// src/sockets/io.ts
var import_socket = require("socket.io");
var io = null;
function initSocket(httpServer) {
  io = new import_socket.Server(httpServer, {
    cors: { origin: corsOriginHandler, credentials: true }
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token ?? (socket.handshake.headers.authorization?.startsWith("Bearer ") ? socket.handshake.headers.authorization.slice(7) : void 0);
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });
  io.on("connection", (socket) => {
    const { userId, role } = socket.data;
    socket.join(SOCKET_ROOMS.user(userId));
    if (STAFF_ROLES.includes(role)) socket.join(SOCKET_ROOMS.admins);
    logger.debug("Socket connected", { userId, role });
    socket.on("disconnect", () => logger.debug("Socket disconnected", { userId }));
  });
  logger.info("Socket.IO initialised");
  return io;
}
function getIO() {
  if (!io) throw new Error("Socket.IO not initialised");
  return io;
}

// src/events/dispatch.ts
function dispatchToSockets(event) {
  const io2 = getIO();
  if (event.targetUserId) {
    io2.to(SOCKET_ROOMS.user(event.targetUserId)).emit(SOCKET_EVENTS.CUSTOMER_NOTIFICATION, event);
    if (event.relatedEntity?.kind === "order") {
      io2.to(SOCKET_ROOMS.user(event.targetUserId)).emit(SOCKET_EVENTS.ORDER_UPDATED, event);
    }
  }
  if (event.toStaff) {
    io2.to(SOCKET_ROOMS.admins).emit(SOCKET_EVENTS.ADMIN_NOTIFICATION, event);
  }
  if (event.dashboardDirty) {
    io2.to(SOCKET_ROOMS.admins).emit(SOCKET_EVENTS.ADMIN_DASHBOARD_UPDATE, { at: event.createdAt });
  }
}

// src/events/publisher.ts
async function publishEvent(event) {
  const payload = { ...event, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
  if (!redisState.available) {
    try {
      dispatchToSockets(payload);
    } catch (err) {
      logger.warn("In-process event dispatch failed", { err: err.message });
    }
    return;
  }
  try {
    await publisher.publish(REDIS_CHANNELS.EVENTS, JSON.stringify(payload));
  } catch (err) {
    logger.warn("Publish failed, dispatching in-process", { err: err.message });
    try {
      dispatchToSockets(payload);
    } catch {
    }
  }
}

// src/utils/pagination.ts
function getPageParams(query) {
  const page = Math.max(Number(query.page) || PAGINATION.DEFAULT_PAGE, 1);
  const rawLimit = Number(query.limit) || PAGINATION.DEFAULT_LIMIT;
  const limit = Math.min(Math.max(rawLimit, 1), PAGINATION.MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}
function buildPageMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1)
  };
}

// src/services/notification.service.ts
var notificationService = {
  async create(input) {
    const docs = [];
    if (input.userId) {
      docs.push({
        user: new import_mongoose5.Types.ObjectId(input.userId),
        forStaff: false,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntity: input.relatedEntity ? { ...input.relatedEntity, id: new import_mongoose5.Types.ObjectId(input.relatedEntity.id) } : void 0
      });
    }
    if (input.forStaff) {
      docs.push({
        user: null,
        forStaff: true,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntity: input.relatedEntity ? { ...input.relatedEntity, id: new import_mongoose5.Types.ObjectId(input.relatedEntity.id) } : void 0
      });
    }
    if (docs.length) await Notification.insertMany(docs);
    await publishEvent({
      type: input.type,
      title: input.title,
      message: input.message,
      targetUserId: input.userId ?? null,
      toStaff: Boolean(input.forStaff),
      relatedEntity: input.relatedEntity,
      dashboardDirty: input.dashboardDirty
    });
  },
  async listForUser(userId, role, query) {
    const { page, limit, skip } = getPageParams(query);
    const isStaff = role !== "customer";
    const filter = isStaff ? { $or: [{ user: new import_mongoose5.Types.ObjectId(userId) }, { forStaff: true }] } : { user: new import_mongoose5.Types.ObjectId(userId) };
    const [items, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false })
    ]);
    return { items, unread, meta: buildPageMeta(total, page, limit) };
  },
  async markRead(userId, role, id) {
    const isStaff = role !== "customer";
    const filter = isStaff ? { _id: id, $or: [{ user: new import_mongoose5.Types.ObjectId(userId) }, { forStaff: true }] } : { _id: id, user: new import_mongoose5.Types.ObjectId(userId) };
    await Notification.updateOne(filter, { $set: { isRead: true } });
  },
  async markAllRead(userId, role) {
    const isStaff = role !== "customer";
    const filter = isStaff ? { $or: [{ user: new import_mongoose5.Types.ObjectId(userId) }, { forStaff: true }] } : { user: new import_mongoose5.Types.ObjectId(userId) };
    await Notification.updateMany({ ...filter, isRead: false }, { $set: { isRead: true } });
  }
};

// src/config/mailer.ts
var import_nodemailer = __toESM(require("nodemailer"));
var host = env.SMTP_HOST || "smtp.hostinger.com";
var user = env.SMTP_USER || "support@devcreation24.in";
var pass = env.SMTP_PASS || "Devcreation@890*";
function createTransportForPort(targetPort, isSecure) {
  return import_nodemailer.default.createTransport({
    host,
    port: targetPort,
    secure: isSecure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    },
    // Prevent indefinite hanging if Hostinger firewall blocks outgoing port
    connectionTimeout: 1e4,
    greetingTimeout: 1e4,
    socketTimeout: 15e3
  });
}
var primaryTransporter = createTransportForPort(
  Number(env.SMTP_PORT) || 465,
  (Number(env.SMTP_PORT) || 465) === 465 ? true : Boolean(env.SMTP_SECURE)
);
var fallbackTransporter = createTransportForPort(587, false);
async function verifyMailer() {
  try {
    await primaryTransporter.verify();
    logger.info("SMTP primary transport (port 465) verified and ready");
  } catch (err1) {
    logger.warn("SMTP port 465 verification failed, testing port 587 fallback...", {
      err: err1.message
    });
    try {
      await fallbackTransporter.verify();
      logger.info("SMTP fallback transport (port 587) verified and ready");
    } catch (err2) {
      logger.error("SMTP verification failed on both ports 465 and 587", {
        err465: err1.message,
        err587: err2.message
      });
    }
  }
}
function resolveFromAddress() {
  const configured = (env.EMAIL_FROM || "").trim();
  if (!configured || configured.includes(".example") || configured.includes("localhost") || !configured.includes("@")) {
    return `"Dev Creation" <${env.SMTP_USER || "support@devcreation24.in"}>`;
  }
  return configured;
}
async function sendMailWithDetails(input) {
  const fromAddress = resolveFromAddress();
  try {
    const info = await primaryTransporter.sendMail({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments
    });
    logger.info("Email sent successfully via primary transport (465)", {
      to: input.to,
      subject: input.subject,
      messageId: info?.messageId
    });
    return { success: true, messageId: info?.messageId, portUsed: Number(env.SMTP_PORT) || 465 };
  } catch (primaryErr) {
    logger.warn("Email send failed on primary port 465, attempting port 587 fallback...", {
      to: input.to,
      subject: input.subject,
      err: primaryErr?.message,
      code: primaryErr?.code
    });
    try {
      const info = await fallbackTransporter.sendMail({
        from: fromAddress,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        attachments: input.attachments
      });
      logger.info("Email sent successfully via fallback transport (587)", {
        to: input.to,
        subject: input.subject,
        messageId: info?.messageId
      });
      return { success: true, messageId: info?.messageId, portUsed: 587 };
    } catch (fallbackErr) {
      logger.error("Email send failed on both primary and fallback transports", {
        to: input.to,
        subject: input.subject,
        primaryError: primaryErr?.message,
        fallbackError: fallbackErr?.message
      });
      return {
        success: false,
        error: `Primary (465): ${primaryErr?.message} | Fallback (587): ${fallbackErr?.message}`,
        code: fallbackErr?.code || primaryErr?.code
      };
    }
  }
}

// src/services/mailQueue.service.ts
var MailQueue = class {
  queue = [];
  activeWorkers = 0;
  maxConcurrency = 2;
  // Maximum concurrent SMTP connections
  paceIntervalMs = 300;
  // Polite delay between emails
  defaultMaxRetries = 3;
  dedupSet = /* @__PURE__ */ new Map();
  // dedupKey -> timestamp
  totalProcessed = 0;
  totalFailed = 0;
  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, ts] of this.dedupSet.entries()) {
        if (now - ts > 12e4) {
          this.dedupSet.delete(key);
        }
      }
    }, 6e4).unref();
  }
  /**
   * Enqueues an email for asynchronous delivery.
   * Returns immediately with the generated job ID.
   */
  enqueue(job) {
    const id = job.id || `mail_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (job.dedupKey) {
      const lastSent = this.dedupSet.get(job.dedupKey);
      if (lastSent && Date.now() - lastSent < 6e4) {
        logger.warn(`[MAIL-QUEUE] \u23E9 Deduplicating email with key "${job.dedupKey}" (already sent within 60s)`);
        return id;
      }
      this.dedupSet.set(job.dedupKey, Date.now());
    }
    const internalJob = {
      ...job,
      id,
      attempts: 0,
      createdAt: Date.now(),
      maxRetries: job.maxRetries ?? this.defaultMaxRetries
    };
    if (job.priority === "high") {
      this.queue.unshift(internalJob);
    } else {
      this.queue.push(internalJob);
    }
    logger.debug(`[MAIL-QUEUE] \u{1F4E5} Enqueued job ${id}: "${job.subject}" to <${job.to}> (Queue depth: ${this.queue.length})`);
    this.scheduleNext();
    return id;
  }
  /**
   * Spawns worker loops while there are queued jobs and capacity.
   */
  scheduleNext() {
    while (this.activeWorkers < this.maxConcurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;
      this.activeWorkers++;
      this.processJob(job);
    }
  }
  /**
   * Processes an individual email job with pacing and retry logic.
   */
  async processJob(job) {
    const startTime = Date.now();
    job.attempts++;
    try {
      logger.info(`[MAIL-QUEUE] \u{1F680} Sending [Job ${job.id}] (Attempt ${job.attempts}/${job.maxRetries}): "${job.subject}" to <${job.to}>`);
      const result = await sendMailWithDetails({
        to: job.to,
        subject: job.subject,
        html: job.html,
        text: job.text,
        attachments: job.attachments
      });
      if (!result.success) {
        throw new Error(result.error || "SMTP delivery returned unsuccessful");
      }
      const elapsed = Date.now() - startTime;
      this.totalProcessed++;
      logger.info(`[MAIL-QUEUE] \u2705 Delivered [Job ${job.id}] in ${elapsed}ms (Port: ${result.portUsed}, MsgId: ${result.messageId || "ok"})`);
      try {
        job.onSuccess?.(result);
      } catch (err) {
        logger.warn(`[MAIL-QUEUE] onSuccess callback error: ${err.message}`);
      }
    } catch (err) {
      const errorMsg = err?.message || String(err);
      logger.warn(`[MAIL-QUEUE] \u26A0\uFE0F Delivery failed for [Job ${job.id}] (Attempt ${job.attempts}/${job.maxRetries}): ${errorMsg}`);
      if (job.attempts < (job.maxRetries || this.defaultMaxRetries)) {
        const delay = Math.pow(2, job.attempts) * 1e3;
        logger.info(`[MAIL-QUEUE] \u23F3 Scheduling retry for [Job ${job.id}] in ${delay}ms`);
        setTimeout(() => {
          this.queue.unshift(job);
          this.scheduleNext();
        }, delay);
      } else {
        this.totalFailed++;
        logger.error(`[MAIL-QUEUE] \u274C Permanently failed [Job ${job.id}] after ${job.attempts} attempts: ${errorMsg}`);
        try {
          job.onError?.(err instanceof Error ? err : new Error(errorMsg));
        } catch {
        }
      }
    } finally {
      setTimeout(() => {
        this.activeWorkers--;
        this.scheduleNext();
      }, this.paceIntervalMs);
    }
  }
  /** Returns queue health & statistics */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeWorkers: this.activeWorkers,
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed
    };
  }
};
var mailQueue = new MailQueue();

// src/utils/invoice.ts
var import_pdfkit = __toESM(require("pdfkit"));

// src/assets/logoBase64.ts
var LOGO_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAZ8AAAGuCAYAAABPxAucAAAWfmNhQlgAABZ+anVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAAFlhqdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3VybjpjMnBhOmJmNTcwNGI5LTU2YTctNDlmYi1hZTAzLWEzYjI0NWNkOWFmMgAAAAOTanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAAAuGp1bWIAAABEanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5pbmdyZWRpZW50LnYzAAAAABhjMnNoLq/8LdeddD0vFULhUL0Z3QAAAGxjYm9yo2lkYzpmb3JtYXRpaW1hZ2UvcG5namluc3RhbmNlSUR4LHhtcDppaWQ6OTM3YzcwZGYtNTk0My00NThkLWEyNmMtM2Q3ZjQyYmYzOWZhbHJlbGF0aW9uc2hpcGhwYXJlbnRPZgAAAeJqdW1iAAAAQWp1bWRjYm9yABEAEIAAAKoAOJtxE2MycGEuYWN0aW9ucy52MgAAAAAYYzJzaJgJtrwStByjIF6AL1e4az0AAAGZY2JvcqJnYWN0aW9uc4KiZmFjdGlvbmtjMnBhLm9wZW5lZGpwYXJhbWV0ZXJzoWtpbmdyZWRpZW50c4GiY3VybHgtc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5pbmdyZWRpZW50LnYzZGhhc2hYIOegxyyDBwLjNT5P+ZVvRmtu2tj6CZYWJOnWngZ/2J7jpGZhY3Rpb254HWNvbS5hbnRocm9waWMuY2xhdWRlLnByb3ZpZGVkanBhcmFtZXRlcnOheB9jb20uYW50aHJvcGljLm9yaWdpbi1jb25maWRlbmNlZ3Vua25vd25rZGVzY3JpcHRpb254ZkNsYXVkZSBwcm92aWRlZCB0aGlzIGZpbGUgYXQgdGhlIHJlcXVlc3Qgb2YgYSB1c2VyIGFuZCBtYXkgaGF2ZSBjcmVhdGVkIG9yIG1vZGlmaWVkIHRoZSBmaWxlIGNvbnRlbnRzLm1zb2Z0d2FyZUFnZW50oWRuYW1lZkNsYXVkZXJhbGxBY3Rpb25zSW5jbHVkZWT1AAAAyGp1bWIAAABAanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5oYXNoLmRhdGEAAAAAGGMyc2i4D8qyffoXPmNUbLwGzBwBAAAAgGNib3KlY2FsZ2ZzaGEyNTZjcGFkTQAAAAAAAAAAAAAAAABkaGFzaFgggU63F1Qn4jjDVGjKNpyUTR1M3LjAIU/RnNARl1VwUnJkbmFtZW5qdW1iZiBtYW5pZmVzdGpleGNsdXNpb25zgaJlc3RhcnQYIWZsZW5ndGgZFooAAAI+anVtYgAAACdqdW1kYzJjbAARABCAAACqADibcQNjMnBhLmNsYWltLnYyAAAAAg9jYm9ypWNhbGdmc2hhMjU2aXNpZ25hdHVyZXhNc2VsZiNqdW1iZj0vYzJwYS91cm46YzJwYTpiZjU3MDRiOS01NmE3LTQ5ZmItYWUwMy1hM2IyNDVjZDlhZjIvYzJwYS5zaWduYXR1cmVqaW5zdGFuY2VJRHgseG1wOmlpZDphMTdmNWQzNS05Mzk5LTQxMTQtYTRlMC1lMjE5YTQ2YzVhZGRyY3JlYXRlZF9hc3NlcnRpb25zg6JjdXJseC1zZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmluZ3JlZGllbnQudjNkaGFzaFgg56DHLIMHAuM1Pk/5lW9Ga27a2PoJlhYk6daeBn/YnuOiY3VybHgqc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5hY3Rpb25zLnYyZGhhc2hYIJbq+sloTb7OPSfq93TGIWuAgCPyn1ba6Ns31YlwnP4TomN1cmx4KXNlbGYjanVtYmY9YzJwYS5hc3NlcnRpb25zL2MycGEuaGFzaC5kYXRhZGhhc2hYIIj95WC+12LL85T1Lk9iNEqw/L0ci0Xzc/+pNbEKh0kUdGNsYWltX2dlbmVyYXRvcl9pbmZvo2RuYW1lb0FudGhyb3BpYyBGaWxlc2d2ZXJzaW9uZTEuMC4wa3NwZWNWZXJzaW9uZTIuNC4wAAAQOGp1bWIAAAAoanVtZGMyY3MAEQAQgAAAqgA4m3EDYzJwYS5zaWduYXR1cmUAAAAQCGNib3LShFkCEqIBJhghWQIKMIICBjCCAY2gAwIBAgIUQOWgCu7COdC+uIP6BkIFPWdVEwAwCgYIKoZIzj0EAwMwSTEXMBUGA1UEChMOQW50aHJvcGljLCBQQkMxLjAsBgNVBAMTJUFudGhyb3BpYyBDb250ZW50IENyZWRlbnRpYWxzIFJvb3QgQ0EwHhcNMjYwODA3MTg0MzU2WhcNMjgwODA2MTk0MzU2WjBEMRcwFQYDVQQKEw5BbnRocm9waWMsIFBCQzEpMCcGA1UEAxMgQW50aHJvcGljIENsYXVkZSBDb250ZW50IFNpZ25pbmcwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASYegpry1AYBRTVNL1CpTlbROnY3dey+UrsF9C3phYrATN3ZHf93Mo8RQN0KOUuOn19P4oWNFWe5n2/She9N7eTo1gwVjAOBgNVHQ8BAf8EBAMCB4AwFQYDVR0lBA4wDAYKKwYBBAGD6F4CATAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFM5R4gSBTmRbI/jjxM+aPpzB11zCMAoGCCqGSM49BAMDA2cAMGQCMDFzHRSeAXrSy1WOzkbhPZ6Km2wGTmZ/2gK18k8BQGXyqz88Rdrz6CTX9flAnYNVxgIwcF9c3fVhqmJKpi+UhasNUMko69cyX6STPfta3Q8EjyzDjzoyrol46FP6VFHhvUcJoWNwYWRZDZ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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";

// src/utils/invoice.ts
var GOLD = "#B8943F";
var DEEP = "#2C1810";
var INK = "#1C1410";
var INK3 = "#5C4F46";
var LINE = "#E5DCCB";
var rupee = (n) => "Rs. " + Math.round(n).toLocaleString("en-IN");
function generateInvoicePdf(order, customerName) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new import_pdfkit.default({ size: "A4", margin: 50 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      const pageWidth = doc.page.width;
      const left = 50;
      const right = pageWidth - 50;
      doc.rect(0, 0, pageWidth, 96).fill(DEEP);
      let logoDrawn = false;
      const logoSize = 64;
      try {
        if (LOGO_BASE64 && LOGO_BASE64.length > 100) {
          const logoBuffer = Buffer.from(LOGO_BASE64, "base64");
          doc.image(logoBuffer, left, 16, { width: logoSize, height: logoSize });
          logoDrawn = true;
        }
      } catch {
        logoDrawn = false;
      }
      const brandTextX = logoDrawn ? left + logoSize + 14 : left;
      doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text("DEV CREATION", brandTextX, 32);
      doc.fillColor(GOLD).fontSize(8).font("Helvetica").text("HANDCRAFTED WITH LOVE, SCENTED WITH CARE", brandTextX, 58, { characterSpacing: 1.5 });
      doc.fillColor("#FFFFFF").fontSize(20).font("Helvetica-Bold").text("INVOICE", left, 34, { align: "right", width: right - left });
      doc.fillColor(GOLD).fontSize(8).font("Helvetica").text("OFFICIAL TAX INVOICE", left, 58, { align: "right", width: right - left, characterSpacing: 1.2 });
      let y = 120;
      doc.fillColor(INK).fontSize(11).font("Helvetica-Bold").text(`Invoice: ${order.orderNumber}`, left, y);
      doc.fillColor(INK3).font("Helvetica").fontSize(10);
      doc.text(`Date: ${new Date(order.placedAt ?? order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, left, y += 16);
      doc.text(`Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})`, left, y += 14);
      doc.text(`Status: ${order.status}`, left, y += 14);
      const a = order.shippingAddress;
      const boxY = 115;
      doc.fillColor(GOLD).fontSize(8).font("Helvetica-Bold").text("BILL / SHIP TO", right - 220, boxY, { width: 220, align: "right", characterSpacing: 1 });
      doc.fillColor(INK).fontSize(10).font("Helvetica-Bold").text(customerName || a.fullName, right - 220, boxY + 14, { width: 220, align: "right" });
      doc.fillColor(INK3).font("Helvetica").fontSize(9);
      doc.text(
        `${a.line1}${a.line2 ? ", " + a.line2 : ""}
${a.city}, ${a.state} ${a.postalCode}
${a.country || "India"}
${a.phone}`,
        right - 220,
        boxY + 30,
        { width: 220, align: "right" }
      );
      y = 210;
      doc.rect(left, y, right - left, 24).fill("#FAF6EF");
      doc.fillColor(INK3).fontSize(9).font("Helvetica-Bold");
      doc.text("ITEM", left + 10, y + 8);
      doc.text("QTY", left + 300, y + 8, { width: 40, align: "right" });
      doc.text("PRICE", left + 350, y + 8, { width: 70, align: "right" });
      doc.text("AMOUNT", right - 90, y + 8, { width: 80, align: "right" });
      y += 24;
      doc.font("Helvetica").fontSize(10);
      for (const item of order.items) {
        const name = item.variantName ? `${item.name} (${item.variantName})` : item.name;
        doc.fillColor(INK).text(name, left + 10, y + 8, { width: 280 });
        doc.fillColor(INK3).text(String(item.quantity), left + 300, y + 8, { width: 40, align: "right" });
        doc.text(rupee(item.price), left + 350, y + 8, { width: 70, align: "right" });
        doc.fillColor(INK).text(rupee(item.price * item.quantity), right - 90, y + 8, { width: 80, align: "right" });
        const rowH = Math.max(doc.heightOfString(name, { width: 280 }) + 12, 26);
        y += rowH;
        doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(0.5).stroke();
      }
      y += 12;
      const totalsX = right - 220;
      const totalRow = (label, value, bold = false) => {
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 12 : 10).fillColor(bold ? INK : INK3);
        doc.text(label, totalsX, y, { width: 120 });
        doc.fillColor(INK).text(value, right - 90, y, { width: 80, align: "right" });
        y += bold ? 22 : 16;
      };
      totalRow("Items total", rupee(order.itemsTotal || order.total));
      if (order.discount && order.discount > 0) {
        totalRow(`Discount${order.promoCode ? ` (${order.promoCode})` : ""}`, `-${rupee(order.discount)}`);
      }
      totalRow("Shipping", order.shippingFee ? rupee(order.shippingFee) : "Free");
      doc.moveTo(totalsX, y).lineTo(right, y).strokeColor(LINE).lineWidth(0.5).stroke();
      y += 8;
      totalRow("TOTAL", rupee(order.total), true);
      doc.fillColor(INK3).font("Helvetica").fontSize(9);
      doc.text("Thank you for shopping with Dev Creation.", left, doc.page.height - 90, { align: "center", width: right - left });
      doc.fillColor(GOLD).fontSize(8).text("Free shipping over Rs. 999  |  Returns within 14 days", left, doc.page.height - 74, { align: "center", width: right - left, characterSpacing: 1 });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// src/emails/templates.ts
var rupee2 = (n) => "\u20B9" + Math.round(n).toLocaleString("en-IN");
var esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var C = {
  paper: "#FFFDF8",
  surface: "#FFFFFF",
  surface2: "#FAF6EF",
  surface3: "#F0EAE0",
  ink: "#1C1410",
  ink2: "#3D312A",
  ink3: "#5C4F46",
  gold: "#B8943F",
  goldDk: "#8C6F2A",
  goldLt: "#D4B06A",
  copper: "#C17F3E",
  forest: "#8B5E3C",
  deep: "#2C1810",
  line: "#E5DCCB",
  lineSoft: "#F6F1EA"
};
function resolveItemImg(url) {
  if (!url || typeof url !== "string" || !url.trim()) {
    return `${env.STORE_URL}/assets/Logos/Logo2.png`;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/assets/")) return `${env.STORE_URL}${trimmed}`;
  if (trimmed.startsWith("assets/")) return `${env.STORE_URL}/${trimmed}`;
  if (trimmed.startsWith("/uploads/")) return `${env.PUBLIC_ASSET_BASE}${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `${env.PUBLIC_ASSET_BASE}/${trimmed}`;
  return `${env.STORE_URL}/assets/Logos/Logo2.png`;
}
function layout(bodyHtml, previewText = "") {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Creation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
    .font-serif { font-family: 'Playfair Display', Georgia, serif !important; }
    .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif !important; }
    .font-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
    @media only screen and (max-width: 600px) {
      .shell-table { width: 100% !important; border-radius: 0 !important; }
      .p-card { padding: 20px 16px !important; }
      .timeline-step { padding: 0 4px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:24px 0;background-color:${C.paper};font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;">
  ${previewText ? `<div style="display:none;font-size:1px;color:${C.paper};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${esc(previewText)}</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.paper};margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:8px 12px;">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" class="shell-table" style="width:620px;max-width:620px;background-color:${C.surface};border:1px solid ${C.line};border-radius:12px;overflow:hidden;box-shadow:0 14px 34px -12px rgba(28,20,16,.15);">
          
          <!-- Website-Matched Brand Header -->
          <tr>
            <td style="background-color:${C.deep};padding:28px 20px 22px;text-align:center;border-bottom:3px solid ${C.gold};">
              <a href="${env.STORE_URL}" target="_blank" style="text-decoration:none;display:block;">
                <img src="${env.STORE_URL}/assets/Logos/Logo2.png" alt="Dev Creation" width="70" height="70" style="width:70px;height:70px;border-radius:50%;border:2px solid ${C.gold};display:block;margin:0 auto 10px;box-shadow:0 4px 14px rgba(0,0,0,0.35);object-fit:cover;" />
                <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:4px;text-transform:uppercase;">
                  DEV CREATION
                </div>
                <div style="width:36px;height:1px;background-color:${C.gold};margin:8px auto;"></div>
                <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;font-weight:600;color:${C.goldLt};letter-spacing:2px;text-transform:uppercase;">
                  HANDCRAFTED WITH LOVE &bull; SCENTED WITH CARE
                </div>
              </a>
              <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.12);font-family:'JetBrains Mono',ui-monospace,monospace;">
                <a href="${env.STORE_URL}/products" target="_blank" style="color:#FAF6EF;text-decoration:none;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 8px;">Collection</a>
                <span style="color:${C.gold};font-size:9px;">&bull;</span>
                <a href="${env.STORE_URL}/our-story" target="_blank" style="color:#FAF6EF;text-decoration:none;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 8px;">Our Story</a>
                <span style="color:${C.gold};font-size:9px;">&bull;</span>
                <a href="${env.STORE_URL}/categories/gift-sets" target="_blank" style="color:#FAF6EF;text-decoration:none;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 8px;">Gifting</a>
                <span style="color:${C.gold};font-size:9px;">&bull;</span>
                <a href="${env.STORE_URL}/#care" target="_blank" style="color:#FAF6EF;text-decoration:none;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 8px;">Care</a>
              </div>
            </td>
          </tr>

          <!-- Email Content -->
          <tr>
            <td class="p-card" style="padding:32px 28px;background-color:${C.surface};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Storefront-Matching Footer -->
          <tr>
            <td style="background-color:${C.surface2};padding:26px 20px;border-top:1px solid ${C.line};text-align:center;">
              <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;font-style:italic;color:${C.ink2};margin-bottom:6px;">
                "Handcrafted with love, Scented with care."
              </div>
              <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;color:${C.copper};font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">
                100% Pure Soy Wax &bull; Hand-Poured in India &bull; Master Perfumer Oils
              </div>
              <div style="font-size:12px;color:${C.ink3};line-height:1.7;">
                Concierge: <a href="mailto:support@devcreation24.in" style="color:${C.ink};font-weight:600;text-decoration:none;">support@devcreation24.in</a> &bull; Phone: <strong style="color:${C.ink};">+91 788 758 2008</strong><br>
                Online Store: <a href="${env.STORE_URL}" style="color:${C.ink};font-weight:600;text-decoration:none;">devcreation24.in</a>
              </div>
              <div style="font-size:11px;color:#9b8f84;margin-top:14px;border-top:1px solid ${C.line};padding-top:10px;">
                &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Dev Creation. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function statusBadge(status) {
  const map = {
    pending: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
    confirmed: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    processing: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
    shipped: { bg: "#ECFEFF", text: "#0E7490", border: "#A5F3FC" },
    delivered: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    cancelled: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
    refunded: { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" }
  };
  const s = map[status.toLowerCase()] || map.pending;
  return `<span style="display:inline-block;border-radius:9999px;border:1px solid ${s.border};background-color:${s.bg};color:${s.text};padding:4px 10px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;">${esc(status)}</span>`;
}
function paymentBadge(status) {
  const map = {
    pending: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
    paid: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    failed: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
    refunded: { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" }
  };
  const s = map[status.toLowerCase()] || map.pending;
  return `<span style="display:inline-block;border-radius:9999px;border:1px solid ${s.border};background-color:${s.bg};color:${s.text};padding:4px 10px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;">${esc(status)}</span>`;
}
function renderTimeline(currentStatus) {
  const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const labels = ["Placed", "Confirmed", "Packing", "Shipped", "Delivered"];
  const currentIdx = steps.indexOf(currentStatus.toLowerCase());
  const items = steps.map((_step, idx) => {
    const isPastOrCurrent = currentIdx >= idx;
    const circleBg = isPastOrCurrent ? C.gold : C.surface3;
    const circleColor = isPastOrCurrent ? "#FFFFFF" : C.ink3;
    const labelColor = isPastOrCurrent ? C.ink : "#9b8f84";
    return `
      <td align="center" class="timeline-step" style="width:20%;vertical-align:top;">
        <div style="width:28px;height:28px;border-radius:50%;background-color:${circleBg};color:${circleColor};line-height:28px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:700;margin:0 auto;text-align:center;">
          ${idx + 1}
        </div>
        <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${labelColor};margin-top:6px;">
          ${labels[idx]}
        </div>
      </td>`;
  }).join("");
  return `
  <div style="margin:22px 0;background-color:${C.surface};border:1px solid ${C.line};border-radius:10px;padding:16px 10px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>${items}</tr>
    </table>
  </div>`;
}
function button(label, href) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td align="center" style="background-color:${C.deep};border-radius:10px;border:1.5px solid ${C.deep};box-shadow:0 8px 25px rgba(44,24,16,0.18);">
        <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:15px 32px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.18em;text-transform:uppercase;">
          ${esc(label)} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}
function renderItemsCard(items) {
  const rows = items.map(
    (item) => `
      <tr style="border-bottom:1px solid ${C.lineSoft};">
        <td style="padding:14px 6px;vertical-align:middle;width:52px;">
          <div style="width:50px;height:50px;background-color:${C.surface2};border:1px solid ${C.line};border-radius:8px;overflow:hidden;text-align:center;">
            <img src="${resolveItemImg(item.image)}" alt="${esc(item.name)}" width="50" height="50" style="width:50px;height:50px;object-fit:cover;display:block;" />
          </div>
        </td>
        <td style="padding:14px 10px;vertical-align:middle;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;font-weight:600;color:${C.ink};line-height:1.2;">
            ${esc(item.name)}
          </div>
          <div style="font-size:12px;color:${C.ink3};margin-top:2px;">
            ${item.variantName ? `${esc(item.variantName)} &middot; ` : ""}Qty ${item.quantity}
          </div>
        </td>
        <td align="right" style="padding:14px 6px;vertical-align:middle;font-size:14px;font-weight:600;color:${C.ink};white-space:nowrap;font-variant-numeric:tabular-nums;">
          ${rupee2(item.price * item.quantity)}
        </td>
      </tr>`
  ).join("");
  return `
  <div style="background-color:${C.surface};border:1px solid ${C.line};border-radius:10px;padding:18px 20px;margin-bottom:20px;">
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${C.copper};margin-bottom:8px;">
      ITEMS
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows}
    </table>
  </div>`;
}
function orderConfirmationEmail(order, customerName) {
  const a = order.shippingAddress;
  const isFreeShip = !order.shippingFee || order.shippingFee === 0;
  const formattedDate = new Date(order.placedAt || order.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const body = `
    <!-- Order Number & Top Badges (Mirroring Storefront Header) -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="vertical-align:top;">
          <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:600;color:${C.ink};margin:0;letter-spacing:0.5px;">
            ${esc(order.orderNumber)}
          </h1>
          <div style="font-size:12px;color:${C.ink3};margin-top:3px;">
            Thank you, <strong style="color:${C.ink};">${esc(customerName)}</strong> &bull; Placed ${formattedDate}
          </div>
        </td>
        <td align="right" style="vertical-align:top;">
          <div style="margin-bottom:4px;">${statusBadge(order.status)}</div>
          <div>${paymentBadge(order.paymentStatus)}</div>
        </td>
      </tr>
    </table>

    <!-- 5-Step Timeline Bar -->
    ${renderTimeline(order.status)}

    <!-- Main Grid: Items Card & Financials -->
    ${renderItemsCard(order.items)}

    <!-- Order Financials Card -->
    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:${C.ink2};">
        <tr>
          <td style="padding:4px 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${C.ink3};">Items total</td>
          <td align="right" style="padding:4px 0;font-weight:500;">${rupee2(order.itemsTotal || order.total)}</td>
        </tr>
        ${order.discount ? `
        <tr>
          <td style="padding:4px 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#15803D;">Discount ${order.promoCode ? `(${esc(order.promoCode)})` : ""}</td>
          <td align="right" style="padding:4px 0;font-weight:600;color:#15803D;">-${rupee2(order.discount)}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:4px 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${C.ink3};">Shipping</td>
          <td align="right" style="padding:4px 0;font-weight:500;color:${isFreeShip ? "#15803D" : C.ink2};">
            ${isFreeShip ? "Free" : rupee2(order.shippingFee)}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:10px;border-top:1px solid ${C.line};"></td>
        </tr>
        <tr style="font-size:16px;font-weight:700;">
          <td style="font-family:'Playfair Display',Georgia,serif;color:${C.ink};">Total Amount</td>
          <td align="right" style="font-family:'Playfair Display',Georgia,serif;color:${C.goldDk};">
            ${rupee2(order.total)}
          </td>
        </tr>
      </table>
    </div>

    <!-- Shipping To Card (Matching Storefront Aside) -->
    <div style="background-color:${C.surface};border:1px solid ${C.line};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${C.copper};margin-bottom:8px;">
        SHIPPING TO
      </div>
      <div style="font-size:13px;line-height:1.6;color:${C.ink2};">
        <strong style="color:${C.ink};">${esc(a.fullName)}</strong><br>
        ${esc(a.line1)}${a.line2 ? `, ${esc(a.line2)}` : ""}<br>
        ${esc(a.city)}, ${esc(a.state)} ${esc(a.postalCode)}<br>
        ${esc(a.country || "India")}<br>
        Phone: ${esc(a.phone)}
      </div>
    </div>

    <!-- Official PDF Tax Invoice Attachment Box -->
    <div style="background-color:${C.paper};border:1px dashed ${C.gold};border-radius:10px;padding:16px 20px;margin-bottom:22px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
        <tr>
          <td style="vertical-align:middle;padding-right:10px;">
            <img src="${env.STORE_URL}/assets/Logos/Logo2.png" alt="Dev Creation" width="34" height="34" style="width:34px;height:34px;border-radius:50%;border:1px solid ${C.gold};display:block;object-fit:cover;" />
          </td>
          <td style="vertical-align:middle;text-align:left;">
            <div style="font-size:13.5px;font-weight:700;color:${C.ink};">
              Official Tax Invoice Attached (PDF)
            </div>
            <div style="font-size:11.5px;color:${C.ink3};">
              Includes full item breakdown, tax details &amp; order provenance
            </div>
          </td>
        </tr>
      </table>
      <div style="font-size:12px;color:${C.ink3};border-top:1px solid ${C.line};padding-top:10px;margin-top:6px;">
        A copy of your branded tax invoice (<span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:${C.goldDk};">invoice-${esc(order.orderNumber)}.pdf</span>) has been generated with our official seal and attached for your records.
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;">
      ${button("View Order on Website", `${env.STORE_URL}/account/orders/${order._id}`)}
    </div>
  `;
  return {
    subject: `Order #${order.orderNumber} Confirmed \u2014 Dev Creation Tax Invoice`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} is confirmed. View details and invoice.`),
    text: `Order #${order.orderNumber} confirmed! Total: Rs. ${order.total}. View details: ${env.STORE_URL}/account/orders/${order._id}`
  };
}
function adminNewOrderEmail(order, customerName) {
  const a = order.shippingAddress;
  const body = `
    <div style="margin-bottom:16px;">
      <span style="display:inline-block;padding:3px 10px;background-color:${C.deep};color:${C.goldLt};border-radius:12px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
        Store Alert
      </span>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:${C.ink};margin:8px 0 4px;">
        New Order: #${esc(order.orderNumber)}
      </h1>
      <p style="font-size:13px;color:${C.ink3};margin:0;">
        Placed by ${esc(customerName)} on Dev Creation.
      </p>
    </div>

    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;color:${C.goldDk};font-weight:700;">Customer:</td><td align="right" style="font-weight:600;color:${C.ink};">${esc(customerName)}</td></tr>
        <tr><td style="padding:4px 0;color:${C.goldDk};font-weight:700;">Total Amount:</td><td align="right" style="font-weight:700;color:${C.deep};font-size:16px;">${rupee2(order.total)}</td></tr>
        <tr><td style="padding:4px 0;color:${C.goldDk};font-weight:700;">Payment:</td><td align="right" style="text-transform:uppercase;">${esc(order.paymentMethod)} (${esc(order.paymentStatus)})</td></tr>
        <tr><td style="padding:4px 0;color:${C.goldDk};font-weight:700;">Phone:</td><td align="right">${esc(a.phone)}</td></tr>
      </table>
    </div>

    ${renderItemsCard(order.items)}

    <div style="text-align:center;margin-top:20px;">
      ${button("Open in Admin Panel", `https://login.devcreation24.in/orders`)}
    </div>
  `;
  return {
    subject: `\u{1F6CE} [New Order] #${order.orderNumber} \u2014 ${rupee2(order.total)} from ${customerName}`,
    html: layout(body, `New order #${order.orderNumber} received.`),
    text: `New order #${order.orderNumber} placed by ${customerName} for Rs. ${order.total}. Manage: https://login.devcreation24.in/orders`
  };
}
function parseTrackingFromNote(note) {
  if (!note) return {};
  const cleaned = note.trim();
  const urlMatch = cleaned.match(/(https?:\/\/[^\s]+)/i);
  const trackingUrl = urlMatch ? urlMatch[1] : void 0;
  let carrier;
  let trackingNumber;
  const carriers = ["BlueDart", "Delhivery", "DTDC", "India Post", "Ekart", "Xpressbees", "Shadowfax", "Shiprocket", "FedEx", "DHL"];
  for (const c of carriers) {
    if (new RegExp(`\\b${c}\\b`, "i").test(cleaned)) {
      carrier = c;
      break;
    }
  }
  const codeMatch = cleaned.match(/(?:AWB|Tracking|Tracking Number|Track ID|Docket|Ref)[:\s#]+([A-Z0-9_-]{6,30})/i);
  if (codeMatch) {
    trackingNumber = codeMatch[1];
  } else if (!trackingUrl) {
    const standaloneMatch = cleaned.match(/\b([A-Z0-9]{8,24})\b/i);
    if (standaloneMatch && !carrier) {
      trackingNumber = standaloneMatch[1];
    }
  }
  return { carrier, trackingNumber, trackingUrl };
}
function orderConfirmedEmail(order, customerName, note) {
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        STAGE 2 OF 5 &bull; ORDER CONFIRMED
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Order #${esc(order.orderNumber)} Confirmed
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Dear ${esc(customerName)}, thank you for choosing Dev Creation. Our master artisans have confirmed your order and are preparing your selected artisanal wax sachets.
      </p>
    </div>

    ${renderTimeline("confirmed")}

    ${note ? `
    <div style="background-color:${C.surface2};border-left:4px solid ${C.gold};padding:14px 18px;border-radius:6px;margin:20px 0;font-size:13px;color:${C.ink2};">
      <strong style="color:${C.ink};">Note from Concierge:</strong> ${esc(note)}
    </div>` : ""}

    ${renderItemsCard(order.items)}

    <div style="text-align:center;margin-top:24px;">
      ${button("View Order Status", `${env.STORE_URL}/account/orders/${order._id}`)}
    </div>
  `;
  return {
    subject: `\u2728 Order #${order.orderNumber} Confirmed \u2014 Dev Creation`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} is confirmed and being prepared.`),
    text: `Your Dev Creation order #${order.orderNumber} is confirmed! View status: ${env.STORE_URL}/account/orders/${order._id}`
  };
}
function orderPackingEmail(order, customerName, note) {
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        STAGE 3 OF 5 &bull; PACKING WITH CARE
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Your Order Is Being Packed
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Dear ${esc(customerName)}, your handcrafted pieces are receiving their finishing touches. Each wax sachet is lovingly inspected, scented with care, and cushioned in eco-conscious packaging.
      </p>
    </div>

    ${renderTimeline("processing")}

    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:10px;padding:16px 20px;margin:20px 0;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        ARTISANAL PACKAGING PROMISE
      </div>
      <div style="font-size:13px;color:${C.ink2};line-height:1.6;">
        &bull; 100% Biodegradable protective honeycomb wrap<br>
        &bull; Signature gold-embossed fragrance seal<br>
        &bull; Fragrance notes care card included with every box
      </div>
    </div>

    ${note ? `
    <div style="background-color:${C.surface2};border-left:4px solid ${C.gold};padding:14px 18px;border-radius:6px;margin:20px 0;font-size:13px;color:${C.ink2};">
      <strong style="color:${C.ink};">Note from Studio:</strong> ${esc(note)}
    </div>` : ""}

    ${renderItemsCard(order.items)}

    <div style="text-align:center;margin-top:24px;">
      ${button("Track Fulfillment", `${env.STORE_URL}/account/orders/${order._id}`)}
    </div>
  `;
  return {
    subject: `\u{1F4E6} Packing With Care: Order #${order.orderNumber} \u2014 Dev Creation`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} is now being packed with care.`),
    text: `Your Dev Creation order #${order.orderNumber} is being packed with care! View: ${env.STORE_URL}/account/orders/${order._id}`
  };
}
function orderShippedEmail(order, customerName, note) {
  const tracking = parseTrackingFromNote(note);
  const a = order.shippingAddress;
  const trackHref = tracking.trackingUrl || `${env.STORE_URL}/account/orders/${order._id}`;
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        STAGE 4 OF 5 &bull; DISPATCHED
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Your Order Has Shipped! \u{1F69A}
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Great news, ${esc(customerName)}! Your parcel has been securely handed to our courier partner and is on its journey to you.
      </p>
    </div>

    ${renderTimeline("shipped")}

    <!-- Logistics & Tracking Card -->
    <div style="background-color:${C.surface2};border:1.5px solid ${C.gold};border-radius:12px;padding:20px;margin:22px 0;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:10px;">
        LOGISTICS &amp; TRACKING DETAILS
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:${C.ink};">
        <tr>
          <td style="padding:6px 0;color:${C.ink3};">Courier Partner:</td>
          <td align="right" style="padding:6px 0;font-weight:700;color:${C.deep};">
            ${esc(tracking.carrier || "Express Courier Partner")}
          </td>
        </tr>
        ${tracking.trackingNumber ? `
        <tr>
          <td style="padding:6px 0;color:${C.ink3};">AWB / Tracking No:</td>
          <td align="right" style="padding:6px 0;font-family:'JetBrains Mono',monospace;font-weight:700;color:${C.goldDk};font-size:14px;">
            ${esc(tracking.trackingNumber)}
          </td>
        </tr>` : ""}
        <tr>
          <td style="padding:6px 0;color:${C.ink3};">Delivering To:</td>
          <td align="right" style="padding:6px 0;font-weight:500;">
            ${esc(a.city)}, ${esc(a.state)} (${esc(a.postalCode)})
          </td>
        </tr>
      </table>

      ${note && !tracking.trackingNumber ? `
      <div style="margin-top:12px;padding-top:10px;border-top:1px dashed ${C.line};font-size:12px;color:${C.ink2};">
        <strong>Dispatch Note:</strong> ${esc(note)}
      </div>` : ""}
    </div>

    <div style="text-align:center;margin:16px 0 24px;">
      ${button("Track Your Parcel", trackHref)}
    </div>

    ${renderItemsCard(order.items)}
  `;
  return {
    subject: `\u{1F69A} On Its Way! Order #${order.orderNumber} Has Shipped \u2014 Dev Creation`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} has shipped. Track your parcel now.`),
    text: `Your Dev Creation order #${order.orderNumber} has shipped! Track delivery: ${trackHref}`
  };
}
function orderDeliveredEmail(order, customerName, note) {
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        FINAL STAGE &bull; COMPLETED
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Your Order Has Arrived! \u{1F389}
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Dear ${esc(customerName)}, your Dev Creation package has been delivered. We hope your new fragrances bring exquisite aroma and serenity to your sanctuary.
      </p>
    </div>

    ${renderTimeline("delivered")}

    <!-- Wax Sachet & Fragrance Care Tips Card -->
    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:12px;padding:20px;margin:22px 0;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:600;color:${C.ink};margin-bottom:8px;">
        \u2728 How to Enjoy Your Artisanal Wax Sachets:
      </div>
      <div style="font-size:13px;color:${C.ink2};line-height:1.8;">
        &bull; <strong>Ideal Placement:</strong> Hang or place in your wardrobe, linen closet, or entryway.<br>
        &bull; <strong>Keep Cool:</strong> Keep away from direct sunlight or open heat sources.<br>
        &bull; <strong>Aroma Refresh:</strong> After a few months, gently scrape the wax edge to release a fresh burst of perfumed oils.
      </div>
    </div>

    ${note ? `
    <div style="background-color:${C.surface2};border-left:4px solid ${C.gold};padding:14px 18px;border-radius:6px;margin:20px 0;font-size:13px;color:${C.ink2};">
      <strong style="color:${C.ink};">Delivery Note:</strong> ${esc(note)}
    </div>` : ""}

    ${renderItemsCard(order.items)}

    <div style="text-align:center;margin-top:24px;">
      ${button("Leave a Review & View Order", `${env.STORE_URL}/account/orders/${order._id}`)}
    </div>
  `;
  return {
    subject: `\u{1F389} Delivered: Order #${order.orderNumber} \u2014 Enjoy Your Fragrance!`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} has arrived. Enjoy your artisanal fragrance!`),
    text: `Your Dev Creation order #${order.orderNumber} has arrived! Thank you for choosing Dev Creation: ${env.STORE_URL}/account/orders/${order._id}`
  };
}
function orderCancelledEmail(order, customerName, note) {
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#B91C1C;margin:0 0 8px;">
        Order #${esc(order.orderNumber)} Cancelled
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Dear ${esc(customerName)}, your order #${esc(order.orderNumber)} has been cancelled.
      </p>
    </div>

    ${note ? `
    <div style="background-color:#FEF2F2;border:1px solid #FECACA;padding:14px 18px;border-radius:8px;margin:20px 0;font-size:13px;color:#991B1B;">
      <strong>Reason / Note:</strong> ${esc(note)}
    </div>` : ""}

    <p style="font-size:13px;color:${C.ink2};line-height:1.6;text-align:center;">
      If you already completed an online payment, a full refund has been initiated to your original payment method within 5\u20137 business days.
    </p>

    <div style="text-align:center;margin-top:24px;">
      ${button("Browse Collection", `${env.STORE_URL}/products`)}
    </div>
  `;
  return {
    subject: `Order #${order.orderNumber} Cancelled \u2014 Dev Creation`,
    html: layout(body, `Your order #${order.orderNumber} has been cancelled.`),
    text: `Your Dev Creation order #${order.orderNumber} has been cancelled. Details: ${env.STORE_URL}/account/orders/${order._id}`
  };
}
function orderStatusEmail(order, customerName, status, note) {
  switch (status) {
    case "confirmed":
      return orderConfirmedEmail(order, customerName, note);
    case "processing":
      return orderPackingEmail(order, customerName, note);
    case "shipped":
      return orderShippedEmail(order, customerName, note);
    case "delivered":
      return orderDeliveredEmail(order, customerName, note);
    case "cancelled":
      return orderCancelledEmail(order, customerName, note);
    default:
      return orderConfirmedEmail(order, customerName, note);
  }
}
function welcomeEmail(customerName) {
  const body = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:8px;">
        WELCOME
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;color:${C.ink};margin:0 0 8px;">
        Welcome to Dev Creation, ${esc(customerName)}
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0;">
        Thank you for joining our community. Discover our luxury handcrafted candles and signature fragrances.
      </p>
    </div>

    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:10px;padding:18px 22px;margin:20px 0;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:15px;font-weight:600;color:${C.ink};margin-bottom:8px;">
        Your Membership Benefits:
      </div>
      <ul style="font-size:13px;color:${C.ink3};line-height:1.8;padding-left:18px;margin:0;">
        <li>Real-time order tracking and invoice management</li>
        <li>Early access to seasonal candle releases</li>
        <li>Priority concierge gifting support</li>
      </ul>
    </div>

    <div style="text-align:center;">
      ${button("Explore Our Candles", `${env.STORE_URL}/products`)}
    </div>
  `;
  return {
    subject: `Welcome to Dev Creation, ${customerName} \u2728`,
    html: layout(body, `Welcome to Dev Creation handcrafted luxury candles.`),
    text: `Welcome to Dev Creation, ${customerName}! Explore: ${env.STORE_URL}/products`
  };
}
function passwordResetEmail(customerName, resetUrl) {
  const body = `
    <div style="text-align:center;margin-bottom:20px;">
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:${C.ink};margin:0 0 8px;">
        Password Reset
      </h1>
      <p style="font-size:14px;color:${C.ink3};margin:0;">
        Hi ${esc(customerName)}, click the button below to reset your Dev Creation password:
      </p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      ${button("Reset Password", resetUrl)}
    </div>

    <p style="font-size:12px;color:#8A7A70;text-align:center;margin-top:20px;">
      This link will expire in <strong>15 minutes</strong>. If you did not make this request, you can ignore this email.
    </p>
  `;
  return {
    subject: `Reset Your Dev Creation Password`,
    html: layout(body, `Security link to reset your password.`),
    text: `Reset password: ${resetUrl} (Valid for 15 mins)`
  };
}

// src/services/email.service.ts
function isDeliverableEmail(email) {
  if (!email || !email.includes("@")) return false;
  const lower = email.toLowerCase().trim();
  if (lower.endsWith(".example")) return false;
  if (lower.startsWith("customer_") && lower.endsWith("@devcreation24.in")) return false;
  if (/^user\d+@devcreation24\.in$/.test(lower)) return false;
  return true;
}
async function resolveCustomer(order) {
  const userObj = order.user;
  if (userObj && typeof userObj === "object" && userObj.email) {
    return { name: userObj.name || order.shippingAddress.fullName, email: userObj.email };
  }
  const userId = userObj?._id || order.user;
  if (!userId) return { name: order.shippingAddress.fullName, email: "" };
  const user2 = await User.findById(userId).select("name email").lean();
  if (!user2) return { name: order.shippingAddress.fullName, email: "" };
  return { name: user2.name, email: user2.email };
}
var emailService = {
  /** On checkout: async confirmation (with PDF invoice) to customer + alert to admin. */
  async sendOrderPlaced(order) {
    const customer = await resolveCustomer(order);
    const name = customer?.name ?? order.shippingAddress.fullName;
    if (customer?.email && isDeliverableEmail(customer.email)) {
      let invoice;
      try {
        invoice = await generateInvoicePdf(order, name);
      } catch (err) {
        logger.warn("Invoice generation warning", { orderId: order._id.toString(), err: err.message });
      }
      const tpl = orderConfirmationEmail(order, name);
      mailQueue.enqueue({
        dedupKey: `order_placed_cust_${order._id.toString()}`,
        to: customer.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        priority: "high",
        attachments: invoice ? [{ filename: `invoice-${order.orderNumber}.pdf`, content: invoice, contentType: "application/pdf" }] : void 0
      });
    } else {
      logger.info(`[EMAIL-SERVICE] \u2139\uFE0F Customer has no external email registered (${customer?.email || "none"}), skipping customer invoice email`);
    }
    let adminEmail = env.ADMIN_NOTIFY_EMAIL || "support@devcreation24.in";
    if (!adminEmail || adminEmail.includes(".example")) {
      adminEmail = "support@devcreation24.in";
    }
    if (adminEmail) {
      const adminTpl = adminNewOrderEmail(order, name);
      mailQueue.enqueue({
        dedupKey: `order_placed_admin_${order._id.toString()}`,
        to: adminEmail,
        subject: adminTpl.subject,
        html: adminTpl.html,
        text: adminTpl.text,
        priority: "normal"
      });
    }
    logger.info(`[EMAIL-SERVICE] \u{1F4E8} Queued order-placed emails for Order #${order.orderNumber}`);
  },
  /** On status change (Confirmed, Packing, Shipped, Delivered): notify customer asynchronously. */
  async sendOrderStatus(order, status, note) {
    const customer = await resolveCustomer(order);
    if (!customer?.email || !isDeliverableEmail(customer.email)) {
      logger.info(`[EMAIL-SERVICE] \u23ED\uFE0F Skipping order status email for Order #${order.orderNumber} (no valid customer email found)`);
      return;
    }
    const tpl = orderStatusEmail(order, customer.name, status, note);
    mailQueue.enqueue({
      dedupKey: `order_status_${order._id.toString()}_${status}`,
      to: customer.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      priority: status === "shipped" || status === "delivered" ? "high" : "normal"
    });
    logger.info(`[EMAIL-SERVICE] \u{1F4E8} Queued status email "${status}" for Order #${order.orderNumber} to <${customer.email}>`);
  },
  /** On registration: send a welcome email to the customer. */
  async sendWelcome(user2) {
    if (!user2.email || !isDeliverableEmail(user2.email)) return;
    const tpl = welcomeEmail(user2.name);
    mailQueue.enqueue({
      dedupKey: `welcome_${user2.email}`,
      to: user2.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text
    });
  },
  /** On forgot password: send password reset email with token link. */
  async sendPasswordReset(user2, token) {
    if (!user2.email || !isDeliverableEmail(user2.email)) return;
    const resetUrl = `${env.STORE_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const tpl = passwordResetEmail(user2.name, resetUrl);
    mailQueue.enqueue({
      to: user2.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      priority: "high"
    });
  }
};

// src/services/sms.service.ts
var smsService = {
  async sendOtp(phone, otp) {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const message = `Dev Creation: Your verification code is ${otp}. Valid for 5 mins.`;
    if (env.FAST2SMS_API_KEY) {
      try {
        const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            authorization: env.FAST2SMS_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            route: "q",
            message,
            numbers: cleanPhone
          })
        });
        const data = await response.json();
        if (data.return) {
          logger.info(`[SMS-SERVICE] \u2705 Sent OTP to +91 ${cleanPhone} via Fast2SMS (ReqId: ${data.request_id})`);
          return {
            delivered: true,
            provider: "fast2sms",
            messageId: data.request_id
          };
        } else {
          logger.warn(`[SMS-SERVICE] Fast2SMS returned error: ${JSON.stringify(data.message)}`);
        }
      } catch (err) {
        logger.error(`[SMS-SERVICE] Fast2SMS request failed: ${err.message}`);
      }
    }
    if (env.TWO_FACTOR_API_KEY) {
      try {
        const url = `https://2factor.in/v1/API/V1/${env.TWO_FACTOR_API_KEY}/SMS/${cleanPhone}/${otp}/OTP1`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.Status === "Success") {
          logger.info(`[SMS-SERVICE] \u2705 Sent OTP to +91 ${cleanPhone} via 2Factor (Session: ${data.Details})`);
          return {
            delivered: true,
            provider: "2factor",
            messageId: data.Details
          };
        } else {
          logger.warn(`[SMS-SERVICE] 2Factor returned error: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        logger.error(`[SMS-SERVICE] 2Factor request failed: ${err.message}`);
      }
    }
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) {
      try {
        const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
        const params = new URLSearchParams({
          To: `+91${cleanPhone}`,
          From: env.TWILIO_PHONE_NUMBER,
          Body: message
        });
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
          }
        );
        const data = await response.json();
        if (data.sid) {
          logger.info(`[SMS-SERVICE] \u2705 Sent OTP to +91 ${cleanPhone} via Twilio (SID: ${data.sid})`);
          return {
            delivered: true,
            provider: "twilio",
            messageId: data.sid
          };
        } else {
          logger.warn(`[SMS-SERVICE] Twilio returned error: ${data.message || JSON.stringify(data)}`);
        }
      } catch (err) {
        logger.error(`[SMS-SERVICE] Twilio request failed: ${err.message}`);
      }
    }
    logger.info(
      `[SMS-SERVICE] \u{1F4F1} Simulated OTP for +91 ${cleanPhone}: [${otp}] (Configure FAST2SMS_API_KEY in .env to deliver real SMS to mobile phones)`
    );
    return {
      delivered: true,
      provider: "simulated"
    };
  }
};

// src/services/auth.service.ts
function issueTokens(user2) {
  const payload = { sub: user2.id, role: user2.role, email: user2.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}
var authService = {
  async register(input) {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) throw ApiError.conflict("An account with this email already exists");
    const user2 = await User.create({ ...input, role: ROLES.CUSTOMER });
    await Cart.create({ user: user2._id, items: [] });
    await notificationService.create({
      type: "customer_registered",
      title: "New customer",
      message: `${user2.name} just registered`,
      forStaff: true,
      relatedEntity: { kind: "user", id: user2._id.toString() },
      dashboardDirty: true
    });
    void emailService.sendWelcome({ name: user2.name, email: user2.email }).catch((err) => {
      logger.warn("Failed to send welcome email", { err: err.message });
    });
    const tokens = issueTokens({ id: user2._id.toString(), role: user2.role, email: user2.email });
    return { user: user2.toJSON(), ...tokens };
  },
  async login(identifier, password) {
    const raw = (identifier || "").trim();
    const cleanPhone = raw.replace(/\D/g, "").slice(-10);
    const isPhone = /^[6-9]\d{9}$/.test(cleanPhone);
    const query = isPhone ? { $or: [{ phone: cleanPhone }, { phone: raw }] } : { email: raw.toLowerCase() };
    const user2 = await User.findOne(query).select("+password");
    if (!user2 || !user2.isActive) throw ApiError.unauthorized("Invalid credentials");
    const ok = await user2.comparePassword(password);
    if (!ok) throw ApiError.unauthorized("Invalid credentials");
    const tokens = issueTokens({ id: user2._id.toString(), role: user2.role, email: user2.email });
    return { user: user2.toJSON(), ...tokens };
  },
  async refresh(refreshToken) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }
    const user2 = await User.findById(payload.sub);
    if (!user2 || !user2.isActive) throw ApiError.unauthorized("Account unavailable");
    return issueTokens({ id: user2._id.toString(), role: user2.role, email: user2.email });
  },
  /**
   * Generates a single-use reset token stored in Redis with a short TTL. In a
   * real deployment the token would be emailed; here it is returned to the
   * caller (dev) and logged so the flow is testable without an SMTP server.
   */
  async forgotPassword(email) {
    const user2 = await User.findOne({ email: email.toLowerCase() });
    if (!user2) return { delivered: true };
    const token = import_node_crypto.default.randomBytes(32).toString("hex");
    await kv.set(`pwreset:${token}`, user2._id.toString(), 15 * 60);
    logger.info("Password reset requested", { userId: user2._id.toString() });
    void emailService.sendPasswordReset({ name: user2.name, email: user2.email }, token).catch((err) => {
      logger.warn("Failed to send password reset email", { err: err.message });
    });
    return { delivered: true, devToken: token };
  },
  async resetPassword(token, password) {
    const userId = await kv.get(`pwreset:${token}`);
    if (!userId) throw ApiError.badRequest("Reset link is invalid or has expired");
    const user2 = await User.findById(userId).select("+password");
    if (!user2) throw ApiError.badRequest("Reset link is invalid or has expired");
    user2.password = password;
    await user2.save();
    await kv.del(`pwreset:${token}`);
    return { reset: true };
  },
  async sendOtp(rawPhone) {
    const cleanPhone = (rawPhone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw ApiError.badRequest("Please enter a valid 10-digit Indian mobile number");
    }
    const cooldownKey = `otp_cooldown:${cleanPhone}`;
    const inCooldown = await kv.get(cooldownKey);
    if (inCooldown) {
      throw ApiError.badRequest("Please wait 30 seconds before requesting another code");
    }
    const rateKey = `otp_ratelimit:${cleanPhone}`;
    const attempts = await kv.get(rateKey);
    const count = attempts ? parseInt(attempts, 10) : 0;
    if (count >= 5) {
      throw ApiError.badRequest("Too many OTP attempts. Please wait 10 minutes before trying again.");
    }
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const key = `otp:${cleanPhone}`;
    await kv.set(key, otp, 300);
    await kv.set(cooldownKey, "1", 30);
    await kv.set(rateKey, (count + 1).toString(), 600);
    const smsResult = await smsService.sendOtp(cleanPhone, otp);
    logger.info(`[AUTH-OTP] Dispatched OTP to +91 ${cleanPhone} via ${smsResult.provider}`);
    return {
      phone: cleanPhone,
      message: smsResult.provider === "simulated" ? "Verification code generated (Test Mode)" : "Verification code sent to your mobile phone via SMS",
      provider: smsResult.provider,
      demoOtp: smsResult.provider === "simulated" || !env.isProd || env.ENABLE_SMS_FALLBACK_DEMO ? otp : void 0,
      expiresInSeconds: 300
    };
  },
  async verifyOtp(rawPhone, code) {
    const cleanPhone = (rawPhone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw ApiError.badRequest("Please provide a valid 10-digit mobile number");
    }
    const cleanCode = (code || "").trim();
    if (!cleanCode || cleanCode.length !== 6) {
      throw ApiError.badRequest("Please enter a valid 6-digit verification code");
    }
    const key = `otp:${cleanPhone}`;
    const stored = await kv.get(key);
    const isMatch = stored && stored === cleanCode;
    const isMasterDemo = env.ENABLE_SMS_FALLBACK_DEMO && cleanCode === "123456";
    if (!isMatch && !isMasterDemo) {
      throw ApiError.unauthorized("Invalid or expired verification code. Please request a new one.");
    }
    await kv.del(key);
    await kv.del(`otp_cooldown:${cleanPhone}`);
    let user2 = await User.findOne({ phone: cleanPhone });
    if (!user2) {
      user2 = await User.findOne({ phone: { $regex: cleanPhone } });
    }
    let isNewCustomer = false;
    if (!user2) {
      isNewCustomer = true;
      const fallbackEmail = `customer_${cleanPhone}@devcreation24.in`;
      const randomPassword = import_node_crypto.default.randomBytes(12).toString("hex") + "A1!";
      user2 = await User.create({
        name: `Customer ${cleanPhone.slice(-4)}`,
        email: fallbackEmail,
        password: randomPassword,
        phone: cleanPhone,
        role: ROLES.CUSTOMER,
        profileComplete: false
        // Will be set true after profile form is submitted
      });
      await Cart.create({ user: user2._id, items: [] });
      await notificationService.create({
        type: "customer_registered",
        title: "New customer (Mobile OTP)",
        message: `Customer with mobile +91 ${cleanPhone} registered via OTP \u2014 profile pending`,
        forStaff: true,
        relatedEntity: { kind: "user", id: user2._id.toString() },
        dashboardDirty: true
      });
    }
    if (!user2.isActive) {
      throw ApiError.unauthorized("Your account is currently disabled. Please contact support.");
    }
    const tokens = issueTokens({ id: user2._id.toString(), role: user2.role, email: user2.email });
    return {
      user: user2.toJSON(),
      isNewCustomer,
      ...tokens
    };
  },
  async me(userId) {
    const user2 = await User.findById(userId);
    if (!user2) throw ApiError.notFound("User not found");
    return user2.toJSON();
  },
  /**
   * Called after OTP login when isNewCustomer=true.
   * Saves real email, password, name, and delivery address, then marks
   * profileComplete=true so the user is not redirected again.
   */
  async completeProfile(userId, input) {
    const user2 = await User.findById(userId).select("+password");
    if (!user2) throw ApiError.notFound("User not found");
    const emailInUse = await User.findOne({
      email: input.email.toLowerCase().trim(),
      _id: { $ne: user2._id }
    });
    if (emailInUse) throw ApiError.conflict("This email address is already registered. Please use a different email.");
    user2.name = input.name.trim();
    user2.email = input.email.toLowerCase().trim();
    user2.password = input.password;
    user2.address = {
      line1: input.address.line1.trim(),
      line2: input.address.line2?.trim(),
      city: input.address.city.trim(),
      state: input.address.state.trim(),
      pincode: input.address.pincode.trim(),
      country: (input.address.country || "India").trim()
    };
    user2.profileComplete = true;
    await user2.save();
    void emailService.sendWelcome({ name: user2.name, email: user2.email }).catch((err) => {
      logger.warn("Failed to send welcome email after profile completion", { err: err.message });
    });
    const tokens = issueTokens({ id: user2._id.toString(), role: user2.role, email: user2.email });
    return { user: user2.toJSON(), ...tokens };
  }
};

// src/utils/asyncHandler.ts
var asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// src/controllers/auth.controller.ts
var refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1e3
};
var authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    return sendSuccess(res, result, "Account created successfully", 201);
  }),
  login: asyncHandler(async (req, res) => {
    const identifier = req.body.identifier || req.body.email || "";
    const { password } = req.body;
    const result = await authService.login(identifier, password);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    return sendSuccess(res, result, "Logged in successfully");
  }),
  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken ?? req.body.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: "No refresh token provided" });
      return;
    }
    const tokens = await authService.refresh(token);
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);
    return sendSuccess(res, tokens, "Token refreshed");
  }),
  logout: asyncHandler(async (_req, res) => {
    res.clearCookie("refreshToken", { ...refreshCookieOptions, maxAge: void 0 });
    return sendSuccess(res, null, "Logged out");
  }),
  forgotPassword: asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    return sendSuccess(res, result, "If the email exists, a reset link has been sent");
  }),
  resetPassword: asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    return sendSuccess(res, result, "Password updated. You can now log in.");
  }),
  sendOtp: asyncHandler(async (req, res) => {
    const { phone } = req.body;
    const result = await authService.sendOtp(phone);
    return sendSuccess(res, result, "OTP sent successfully");
  }),
  verifyOtp: asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;
    const result = await authService.verifyOtp(phone, otp);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    return sendSuccess(res, result, "Logged in successfully via OTP");
  }),
  me: asyncHandler(async (req, res) => {
    const user2 = await authService.me(req.user.id);
    return sendSuccess(res, user2, "Current user");
  }),
  completeProfile: asyncHandler(async (req, res) => {
    const result = await authService.completeProfile(req.user.id, req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    return sendSuccess(res, result, "Profile completed successfully");
  })
};

// src/middleware/auth.ts
function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookieToken = req.cookies?.accessToken;
  return cookieToken ?? null;
}
function authenticate(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch {
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
}
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    return next();
  };
}
var authorizeStaff = authorize(...STAFF_ROLES);

// src/middleware/validate.ts
function validate(schema2) {
  return (req, _res, next) => {
    try {
      if (schema2.body) req.body = schema2.body.parse(req.body);
      if (schema2.query) Object.assign(req.query, schema2.query.parse(req.query));
      if (schema2.params) Object.assign(req.params, schema2.params.parse(req.params));
      return next();
    } catch (err) {
      const zodErr = err;
      return next(
        ApiError.badRequest("Validation failed", zodErr.flatten ? zodErr.flatten() : void 0)
      );
    }
  };
}

// src/validators/auth.validators.ts
var import_zod2 = require("zod");
var registerSchema = {
  body: import_zod2.z.object({
    name: import_zod2.z.string().min(2, "Name is too short").max(80),
    email: import_zod2.z.string().email("Enter a valid email"),
    password: import_zod2.z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
    phone: import_zod2.z.string().min(6).max(20).optional()
  })
};
var loginSchema = {
  body: import_zod2.z.object({
    email: import_zod2.z.string().min(3, "Email or mobile number is required"),
    password: import_zod2.z.string().min(1, "Password is required")
  })
};
var forgotPasswordSchema = {
  body: import_zod2.z.object({
    email: import_zod2.z.string().email("Enter a valid email")
  })
};
var resetPasswordSchema = {
  body: import_zod2.z.object({
    token: import_zod2.z.string().min(10),
    password: import_zod2.z.string().min(8).max(72)
  })
};

// src/routes/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post("/otp/send", authLimiter, authController.sendOtp);
router.post("/otp/verify", authLimiter, authController.verifyOtp);
router.get("/me", authenticate, authController.me);
router.post("/complete-profile", authenticate, authController.completeProfile);
var auth_routes_default = router;

// src/routes/user.routes.ts
var import_express2 = require("express");

// src/services/user.service.ts
var import_mongoose7 = require("mongoose");

// src/models/Address.ts
var import_mongoose6 = require("mongoose");
var addressSchema = new import_mongoose6.Schema(
  {
    user: { type: import_mongoose6.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "India", trim: true },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);
var Address = (0, import_mongoose6.model)("Address", addressSchema);

// src/services/user.service.ts
var userService = {
  async updateProfile(userId, data) {
    const user2 = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    if (!user2) throw ApiError.notFound("User not found");
    return user2.toJSON();
  },
  async changePassword(userId, currentPassword, newPassword) {
    const user2 = await User.findById(userId).select("+password");
    if (!user2) throw ApiError.notFound("User not found");
    const ok = await user2.comparePassword(currentPassword);
    if (!ok) throw ApiError.badRequest("Current password is incorrect");
    user2.password = newPassword;
    await user2.save();
    return { updated: true };
  },
  // ---- Wishlist ----
  async getWishlist(userId) {
    const user2 = await User.findById(userId).populate({
      path: "wishlist",
      select: "name slug price images type fragrance stock"
    });
    if (!user2) throw ApiError.notFound("User not found");
    return user2.wishlist;
  },
  async toggleWishlist(userId, productId) {
    const user2 = await User.findById(userId);
    if (!user2) throw ApiError.notFound("User not found");
    const pid = new import_mongoose7.Types.ObjectId(productId);
    const exists = user2.wishlist.some((w) => w.equals(pid));
    if (exists) {
      user2.wishlist = user2.wishlist.filter((w) => !w.equals(pid));
    } else {
      user2.wishlist.push(pid);
    }
    await user2.save();
    return { inWishlist: !exists };
  },
  // ---- Addresses ----
  async listAddresses(userId) {
    return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
  },
  async addAddress(userId, data) {
    const count = await Address.countDocuments({ user: userId });
    const isDefault = count === 0 || Boolean(data.isDefault);
    if (isDefault) await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    const address = await Address.create({ ...data, user: userId, isDefault });
    return address.toObject();
  },
  async updateAddress(userId, addressId, data) {
    if (data.isDefault) await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      data,
      { new: true, runValidators: true }
    );
    if (!address) throw ApiError.notFound("Address not found");
    return address.toObject();
  },
  async removeAddress(userId, addressId) {
    const res = await Address.deleteOne({ _id: addressId, user: userId });
    if (res.deletedCount === 0) throw ApiError.notFound("Address not found");
    return { deleted: true };
  }
};

// src/controllers/user.controller.ts
var userController = {
  updateProfile: asyncHandler(async (req, res) => {
    const user2 = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, user2, "Profile updated");
  }),
  changePassword: asyncHandler(async (req, res) => {
    const result = await userService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    return sendSuccess(res, result, "Password changed");
  }),
  getWishlist: asyncHandler(async (req, res) => {
    const items = await userService.getWishlist(req.user.id);
    return sendSuccess(res, items, "Wishlist fetched");
  }),
  toggleWishlist: asyncHandler(async (req, res) => {
    const result = await userService.toggleWishlist(req.user.id, req.params.productId);
    return sendSuccess(res, result, result.inWishlist ? "Added to wishlist" : "Removed from wishlist");
  }),
  listAddresses: asyncHandler(async (req, res) => {
    const items = await userService.listAddresses(req.user.id);
    return sendSuccess(res, items, "Addresses fetched");
  }),
  addAddress: asyncHandler(async (req, res) => {
    const address = await userService.addAddress(req.user.id, req.body);
    return sendSuccess(res, address, "Address added", 201);
  }),
  updateAddress: asyncHandler(async (req, res) => {
    const address = await userService.updateAddress(req.user.id, req.params.id, req.body);
    return sendSuccess(res, address, "Address updated");
  }),
  removeAddress: asyncHandler(async (req, res) => {
    const result = await userService.removeAddress(req.user.id, req.params.id);
    return sendSuccess(res, result, "Address removed");
  })
};

// src/validators/user.validators.ts
var import_zod3 = require("zod");
var updateProfileSchema = {
  body: import_zod3.z.object({
    name: import_zod3.z.string().min(2).max(80).optional(),
    phone: import_zod3.z.string().min(6).max(20).optional()
  })
};
var changePasswordSchema = {
  body: import_zod3.z.object({
    currentPassword: import_zod3.z.string().min(1),
    newPassword: import_zod3.z.string().min(8).max(72)
  })
};
var addressSchema2 = {
  body: import_zod3.z.object({
    fullName: import_zod3.z.string().min(2),
    phone: import_zod3.z.string().min(6).max(20),
    line1: import_zod3.z.string().min(3),
    line2: import_zod3.z.string().optional(),
    city: import_zod3.z.string().min(2),
    state: import_zod3.z.string().min(2),
    postalCode: import_zod3.z.string().min(3).max(12),
    country: import_zod3.z.string().min(2).default("India"),
    isDefault: import_zod3.z.boolean().optional()
  })
};

// src/routes/user.routes.ts
var router2 = (0, import_express2.Router)();
router2.use(authenticate);
router2.patch("/me", validate(updateProfileSchema), userController.updateProfile);
router2.post("/me/change-password", validate(changePasswordSchema), userController.changePassword);
router2.get("/me/wishlist", userController.getWishlist);
router2.post("/me/wishlist/:productId", userController.toggleWishlist);
router2.get("/me/addresses", userController.listAddresses);
router2.post("/me/addresses", validate(addressSchema2), userController.addAddress);
router2.patch("/me/addresses/:id", validate(addressSchema2), userController.updateAddress);
router2.delete("/me/addresses/:id", userController.removeAddress);
var user_routes_default = router2;

// src/routes/product.routes.ts
var import_express3 = require("express");

// src/services/product.service.ts
var import_mongoose10 = require("mongoose");

// src/models/Product.ts
var import_mongoose8 = require("mongoose");
var imageSchema = new import_mongoose8.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  },
  { _id: false }
);
var variantSchema = new import_mongoose8.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 }
  },
  { _id: false }
);
var productSchema = new import_mongoose8.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, required: true, trim: true },
    fragrance: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    category: { type: import_mongoose8.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    weight: { type: String },
    stock: { type: Number, required: true, min: 0, default: 0, index: true },
    images: { type: [imageSchema], default: [] },
    variants: { type: [variantSchema], default: [] },
    tags: { type: [String], default: [], index: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);
productSchema.index({ name: "text", description: "text", fragrance: "text", tags: "text" });
productSchema.index({ isActive: 1, createdAt: -1 });
var Product = (0, import_mongoose8.model)("Product", productSchema);

// src/models/Category.ts
var import_mongoose9 = require("mongoose");
var categorySchema = new import_mongoose9.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    // Self-reference supports categories + subcategories.
    parent: { type: import_mongoose9.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    image: { type: String },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);
var Category = (0, import_mongoose9.model)("Category", categorySchema);

// src/redis/cache.ts
var cache = {
  async get(key) {
    if (!redisState.available) return null;
    try {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.warn("cache.get failed", { key, err: err.message });
      return null;
    }
  },
  async set(key, value, ttlSeconds) {
    if (!redisState.available) return;
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      logger.warn("cache.set failed", { key, err: err.message });
    }
  },
  async del(...keys) {
    if (!redisState.available || !keys.length) return;
    try {
      await redis.del(...keys);
    } catch (err) {
      logger.warn("cache.del failed", { keys, err: err.message });
    }
  },
  /** Deletes all keys matching a glob pattern using a non-blocking SCAN. */
  async delByPattern(pattern) {
    if (!redisState.available) return;
    try {
      let cursor = "0";
      do {
        const [next, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = next;
        if (keys.length) await redis.del(...keys);
      } while (cursor !== "0");
    } catch (err) {
      logger.warn("cache.delByPattern failed", { pattern, err: err.message });
    }
  },
  /** Cache-aside: return cached value or compute, store and return it. */
  async remember(key, ttlSeconds, producer) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const fresh = await producer();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
};

// src/utils/slug.ts
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function generateOrderNumber() {
  const random = Math.floor(1e4 + Math.random() * 89999);
  return `ORD-${random}`;
}

// src/services/product.service.ts
var SORT_MAP = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  popular: { ratingAverage: -1, ratingCount: -1 }
};
function buildFilter(q, resolvedCategoryId) {
  const filter = {};
  if (!q.includeInactive) filter.isActive = true;
  if (q.featured !== void 0) filter.isFeatured = q.featured;
  if (resolvedCategoryId) filter.category = resolvedCategoryId;
  if (q.tag) filter.tags = String(q.tag);
  if (q.search) filter.$text = { $search: String(q.search) };
  if (q.minPrice !== void 0 || q.maxPrice !== void 0) {
    filter.price = {};
    if (q.minPrice !== void 0) filter.price.$gte = Number(q.minPrice);
    if (q.maxPrice !== void 0) filter.price.$lte = Number(q.maxPrice);
  }
  return filter;
}
async function uniqueSlug(name) {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (await Product.exists({ slug })) slug = `${base}-${n++}`;
  return slug;
}
async function uniqueSku(provided) {
  if (provided) {
    const exists = await Product.exists({ sku: provided.toUpperCase() });
    if (exists) throw ApiError.conflict("A product with this SKU already exists");
    return provided.toUpperCase();
  }
  let sku;
  do {
    sku = `DC-${Math.floor(1e3 + Math.random() * 8999)}`;
  } while (await Product.exists({ sku }));
  return sku;
}
var productService = {
  /** Public/admin listing with search, filter, sort, pagination. List responses are cached. */
  async list(q) {
    const { page, limit, skip } = getPageParams(q);
    let resolvedCategoryId = null;
    if (q.category) {
      const catStr = String(q.category);
      if (import_mongoose10.Types.ObjectId.isValid(catStr)) {
        resolvedCategoryId = new import_mongoose10.Types.ObjectId(catStr);
      } else {
        const cat = await Category.findOne({ slug: catStr });
        if (cat) resolvedCategoryId = cat._id;
      }
    }
    const filter = buildFilter(q, resolvedCategoryId);
    const sort = SORT_MAP[String(q.sort ?? "newest")] ?? SORT_MAP.newest;
    const cacheable = !q.includeInactive;
    const cacheKey = CACHE.KEY.productList(
      Buffer.from(JSON.stringify({ ...q, page, limit })).toString("base64")
    );
    const run = async () => {
      const [items, total] = await Promise.all([
        Product.find(filter).sort(sort).skip(skip).limit(limit).populate("category", "name slug").lean(),
        Product.countDocuments(filter)
      ]);
      return { items, meta: buildPageMeta(total, page, limit) };
    };
    if (cacheable) return cache.remember(cacheKey, CACHE.TTL.PRODUCTS, run);
    return run();
  },
  async getByIdOrSlug(idOrSlug) {
    return cache.remember(CACHE.KEY.product(idOrSlug), CACHE.TTL.PRODUCT, async () => {
      const query = import_mongoose10.Types.ObjectId.isValid(idOrSlug) ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug };
      let product = await Product.findOne(query).populate("category", "name slug").lean();
      if (!product && typeof idOrSlug === "string" && idOrSlug.trim()) {
        const cleanSlug = idOrSlug.trim().toLowerCase().replace(/-\d+$/, "");
        product = await Product.findOne({
          $or: [
            { slug: new RegExp(`^${cleanSlug}`, "i") },
            { name: new RegExp(`^${cleanSlug.replace(/-/g, " ")}`, "i") }
          ]
        }).populate("category", "name slug").lean();
      }
      if (!product) throw ApiError.notFound("Product not found");
      return product;
    });
  },
  async related(idOrSlug, limit = 4) {
    const product = await Product.findOne(
      import_mongoose10.Types.ObjectId.isValid(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug }
    ).lean();
    if (!product) return [];
    return Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [{ category: product.category }, { type: product.type }]
    }).limit(limit).lean();
  },
  async create(data, actorId) {
    const slug = await uniqueSlug(String(data.name));
    const sku = await uniqueSku(data.sku);
    const product = await Product.create({ ...data, slug, sku });
    await this.invalidate();
    await notificationService.create({
      type: "product_created",
      title: "Product created",
      message: `${product.name} was added to the catalogue`,
      forStaff: true,
      relatedEntity: { kind: "product", id: product._id.toString() },
      dashboardDirty: true
    });
    void actorId;
    return product.toObject();
  },
  async update(id, data) {
    if (data.name && !data.slug) data.slug = await uniqueSlug(String(data.name));
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) throw ApiError.notFound("Product not found");
    await this.invalidate(id, product.slug);
    if (typeof data.stock === "number" && data.stock <= LOW_STOCK_THRESHOLD) {
      await notificationService.create({
        type: "low_stock",
        title: "Low stock",
        message: `${product.name} is low on stock (${product.stock} left)`,
        forStaff: true,
        relatedEntity: { kind: "product", id: product._id.toString() },
        dashboardDirty: true
      });
    }
    return product.toObject();
  },
  async remove(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw ApiError.notFound("Product not found");
    await this.invalidate(id, product.slug);
    return { deleted: true };
  },
  /** Busts product caches after a write. */
  async invalidate(id, slug) {
    await cache.delByPattern(CACHE.PATTERN.productLists);
    if (id) await cache.del(CACHE.KEY.product(id));
    if (slug) await cache.del(CACHE.KEY.product(slug));
    if (!id && !slug) await cache.delByPattern(CACHE.PATTERN.products);
  }
};

// src/controllers/product.controller.ts
var productController = {
  list: asyncHandler(async (req, res) => {
    const { items, meta } = await productService.list(req.query);
    return sendSuccess(res, items, "Products fetched", 200, meta);
  }),
  detail: asyncHandler(async (req, res) => {
    const product = await productService.getByIdOrSlug(req.params.idOrSlug);
    return sendSuccess(res, product, "Product fetched");
  }),
  related: asyncHandler(async (req, res) => {
    const items = await productService.related(req.params.idOrSlug);
    return sendSuccess(res, items, "Related products fetched");
  }),
  create: asyncHandler(async (req, res) => {
    const product = await productService.create(req.body, req.user.id);
    return sendSuccess(res, product, "Product created successfully", 201);
  }),
  update: asyncHandler(async (req, res) => {
    const product = await productService.update(req.params.id, req.body);
    return sendSuccess(res, product, "Product updated successfully");
  }),
  remove: asyncHandler(async (req, res) => {
    const result = await productService.remove(req.params.id);
    return sendSuccess(res, result, "Product deleted successfully");
  })
};

// src/services/review.service.ts
var import_mongoose12 = require("mongoose");

// src/models/Review.ts
var import_mongoose11 = require("mongoose");
var reviewSchema = new import_mongoose11.Schema(
  {
    product: { type: import_mongoose11.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: import_mongoose11.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    comment: { type: String, required: true, trim: true, maxlength: 2e3 },
    verifiedPurchase: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);
reviewSchema.index({ product: 1, createdAt: -1 });
var Review = (0, import_mongoose11.model)("Review", reviewSchema);

// src/services/review.service.ts
var reviewService = {
  /**
   * Resolves a Product by ObjectId or Slug.
   */
  async resolveProduct(idOrSlug) {
    const isObjectId = import_mongoose12.Types.ObjectId.isValid(idOrSlug) && idOrSlug.length === 24;
    const product = await Product.findOne(
      isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug }
    );
    if (!product) throw ApiError.notFound("Product not found");
    return product;
  },
  /**
   * List all reviews for a product with breakdown and summary statistics.
   */
  async listByProduct(idOrSlug) {
    const product = await this.resolveProduct(idOrSlug);
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).lean();
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const r of reviews) {
      const rounded = Math.max(1, Math.min(5, Math.round(r.rating)));
      breakdown[rounded] = (breakdown[rounded] || 0) + 1;
      sum += r.rating;
    }
    const total = reviews.length;
    const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;
    return {
      reviews,
      summary: {
        average,
        total,
        breakdown
      }
    };
  },
  /**
   * Create a new product review, update product ratings, and broadcast via Socket.IO in real time.
   */
  async create(idOrSlug, userId, input) {
    const product = await this.resolveProduct(idOrSlug);
    const user2 = await User.findById(userId).lean();
    if (!user2) throw ApiError.notFound("User not found");
    const review = await Review.create({
      product: product._id,
      user: user2._id,
      userName: user2.name || "Anonymous Customer",
      userEmail: user2.email,
      rating: Math.max(1, Math.min(5, input.rating)),
      title: input.title.trim(),
      comment: input.comment.trim(),
      verifiedPurchase: true,
      helpfulCount: 0
    });
    const allReviews = await Review.find({ product: product._id }).select("rating").lean();
    const totalCount = allReviews.length;
    const totalScore = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const ratingAverage = Number((totalScore / totalCount).toFixed(1));
    product.ratingAverage = ratingAverage;
    product.ratingCount = totalCount;
    await product.save();
    const reviewObj = review.toObject();
    try {
      getIO().emit("product:review:new", {
        productId: product._id.toString(),
        slug: product.slug,
        review: reviewObj,
        ratingAverage,
        ratingCount: totalCount
      });
      logger.info("Broadcasted real-time review", { productId: product._id.toString() });
    } catch (err) {
      logger.warn("Socket broadcast failed for review", { error: err.message });
    }
    return reviewObj;
  },
  /**
   * Mark a review as helpful.
   */
  async markHelpful(reviewId) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    if (!review) throw ApiError.notFound("Review not found");
    return review.toObject();
  }
};

// src/controllers/review.controller.ts
var reviewController = {
  list: asyncHandler(async (req, res) => {
    const data = await reviewService.listByProduct(req.params.idOrSlug);
    return sendSuccess(res, data, "Reviews fetched successfully");
  }),
  create: asyncHandler(async (req, res) => {
    const review = await reviewService.create(req.params.idOrSlug, req.user.id, req.body);
    return sendSuccess(res, review, "Review added successfully", 201);
  }),
  markHelpful: asyncHandler(async (req, res) => {
    const review = await reviewService.markHelpful(req.params.id);
    return sendSuccess(res, review, "Review marked as helpful");
  })
};

// src/validators/product.validators.ts
var import_zod4 = require("zod");
var imageSchema2 = import_zod4.z.object({
  url: import_zod4.z.string().min(1),
  alt: import_zod4.z.string().optional().default(""),
  isPrimary: import_zod4.z.boolean().optional().default(false)
});
var variantSchema2 = import_zod4.z.object({
  name: import_zod4.z.string().min(1),
  sku: import_zod4.z.string().min(1),
  price: import_zod4.z.number().min(0),
  stock: import_zod4.z.number().int().min(0)
});
var createProductSchema = {
  body: import_zod4.z.object({
    name: import_zod4.z.string().min(2).max(140),
    sku: import_zod4.z.string().min(2).max(60).optional(),
    type: import_zod4.z.string().min(1),
    fragrance: import_zod4.z.string().optional().default(""),
    description: import_zod4.z.string().optional().default(""),
    category: import_zod4.z.union([import_zod4.z.string().length(24), import_zod4.z.literal(""), import_zod4.z.null()]).optional().nullable(),
    price: import_zod4.z.number().min(0),
    compareAtPrice: import_zod4.z.number().min(0).optional().nullable(),
    discountPercent: import_zod4.z.number().min(0).max(100).optional().default(0),
    weight: import_zod4.z.string().optional(),
    stock: import_zod4.z.number().int().min(0).default(0),
    images: import_zod4.z.array(imageSchema2).optional().default([]),
    variants: import_zod4.z.array(variantSchema2).optional().default([]),
    tags: import_zod4.z.array(import_zod4.z.string()).optional().default([]),
    isActive: import_zod4.z.boolean().optional().default(true),
    isFeatured: import_zod4.z.boolean().optional().default(false)
  })
};
var updateProductSchema = {
  body: createProductSchema.body.partial()
};
var listProductsSchema = {
  query: import_zod4.z.object({
    page: import_zod4.z.coerce.number().int().min(1).optional(),
    limit: import_zod4.z.coerce.number().int().min(1).max(100).optional(),
    search: import_zod4.z.string().optional(),
    category: import_zod4.z.string().optional(),
    tag: import_zod4.z.string().optional(),
    minPrice: import_zod4.z.coerce.number().min(0).optional(),
    maxPrice: import_zod4.z.coerce.number().min(0).optional(),
    sort: import_zod4.z.enum(["newest", "price_asc", "price_desc", "name_asc", "popular"]).optional(),
    featured: import_zod4.z.enum(["true", "false"]).optional().transform((v) => v === void 0 ? void 0 : v === "true"),
    includeInactive: import_zod4.z.enum(["true", "false"]).optional().transform((v) => v === "true")
  })
};

// src/validators/review.validators.ts
var import_zod5 = require("zod");
var createReviewSchema = {
  body: import_zod5.z.object({
    rating: import_zod5.z.number().int().min(1).max(5),
    title: import_zod5.z.string().min(2).max(150),
    comment: import_zod5.z.string().min(5).max(2e3)
  })
};

// src/routes/product.routes.ts
var router3 = (0, import_express3.Router)();
router3.get("/", validate(listProductsSchema), productController.list);
router3.get("/:idOrSlug", productController.detail);
router3.get("/:idOrSlug/related", productController.related);
router3.get("/:idOrSlug/reviews", reviewController.list);
router3.post("/:idOrSlug/reviews", authenticate, validate(createReviewSchema), reviewController.create);
router3.post("/reviews/:id/helpful", reviewController.markHelpful);
var product_routes_default = router3;

// src/routes/category.routes.ts
var import_express4 = require("express");

// src/services/category.service.ts
var categoryService = {
  /** All active categories, cached (they change rarely). */
  async listActive() {
    return cache.remember(
      CACHE.KEY.categories(),
      CACHE.TTL.CATEGORIES,
      () => Category.find({ isActive: true }).sort({ name: 1 }).lean()
    );
  },
  async listAll() {
    return Category.find().sort({ name: 1 }).populate("parent", "name slug").lean();
  },
  async create(data) {
    const slug = slugify(data.name);
    if (await Category.exists({ slug })) throw ApiError.conflict("Category already exists");
    const category = await Category.create({ ...data, slug });
    await cache.del(CACHE.KEY.categories());
    return category.toObject();
  },
  async update(id, data) {
    if (data.name) data.slug = slugify(String(data.name));
    const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!category) throw ApiError.notFound("Category not found");
    await cache.del(CACHE.KEY.categories());
    return category.toObject();
  },
  async remove(id) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw ApiError.notFound("Category not found");
    await cache.del(CACHE.KEY.categories());
    return { deleted: true };
  }
};

// src/controllers/category.controller.ts
var categoryController = {
  listActive: asyncHandler(async (_req, res) => {
    const items = await categoryService.listActive();
    return sendSuccess(res, items, "Categories fetched");
  }),
  listAll: asyncHandler(async (_req, res) => {
    const items = await categoryService.listAll();
    return sendSuccess(res, items, "Categories fetched");
  }),
  create: asyncHandler(async (req, res) => {
    const category = await categoryService.create(req.body);
    return sendSuccess(res, category, "Category created", 201);
  }),
  update: asyncHandler(async (req, res) => {
    const category = await categoryService.update(req.params.id, req.body);
    return sendSuccess(res, category, "Category updated");
  }),
  remove: asyncHandler(async (req, res) => {
    const result = await categoryService.remove(req.params.id);
    return sendSuccess(res, result, "Category deleted");
  })
};

// src/routes/category.routes.ts
var router4 = (0, import_express4.Router)();
router4.get("/", categoryController.listActive);
var category_routes_default = router4;

// src/routes/cart.routes.ts
var import_express5 = require("express");

// src/services/cart.service.ts
var import_mongoose13 = require("mongoose");
function resolvePrice(product, variantSku) {
  if (variantSku) {
    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) throw ApiError.badRequest("Selected variant is unavailable");
    return variant.price;
  }
  return product.price;
}
var cartService = {
  /** Returns the user's cart with product details and computed totals. */
  async get(userId) {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId, items: [] } },
      { new: true, upsert: true }
    ).populate("items.product", "name slug price images stock variants type weight").lean();
    const items = (cart.items ?? []).filter((i) => i.product).map((item) => {
      const product = item.product;
      const unitPrice = resolvePrice(product, item.variantSku);
      return {
        product: {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          image: product.images?.find((im) => im.isPrimary)?.url ?? product.images?.[0]?.url,
          stock: product.stock,
          weight: product.weight
        },
        variantSku: item.variantSku,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity
      };
    });
    const itemsTotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const shippingFee = itemsTotal === 0 || itemsTotal >= 999 ? 0 : 99;
    return { items, itemsTotal, shippingFee, total: itemsTotal + shippingFee };
  },
  async addItem(userId, productId, quantity, variantSku) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw ApiError.notFound("Product not found");
    if (product.stock < quantity) throw ApiError.badRequest("Not enough stock available");
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId } },
      { new: true, upsert: true }
    );
    const existing = cart.items.find(
      (i) => i.product.toString() === productId && i.variantSku === variantSku
    );
    if (existing) existing.quantity += quantity;
    else cart.items.push({ product: new import_mongoose13.Types.ObjectId(productId), variantSku, quantity });
    await cart.save();
    return this.get(userId);
  },
  async updateItem(userId, productId, quantity, variantSku) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw ApiError.notFound("Cart not found");
    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.variantSku === variantSku
    );
    if (!item) throw ApiError.notFound("Item not in cart");
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i !== item);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    return this.get(userId);
  },
  async removeItem(userId, productId, variantSku) {
    await Cart.updateOne(
      { user: userId },
      { $pull: { items: { product: new import_mongoose13.Types.ObjectId(productId), variantSku } } }
    );
    return this.get(userId);
  },
  async clear(userId) {
    await Cart.updateOne({ user: userId }, { $set: { items: [] } });
    return this.get(userId);
  }
};

// src/controllers/cart.controller.ts
var cartController = {
  get: asyncHandler(async (req, res) => {
    const cart = await cartService.get(req.user.id);
    return sendSuccess(res, cart, "Cart fetched");
  }),
  add: asyncHandler(async (req, res) => {
    const { productId, quantity, variantSku } = req.body;
    const cart = await cartService.addItem(req.user.id, productId, quantity, variantSku);
    return sendSuccess(res, cart, "Item added to cart");
  }),
  update: asyncHandler(async (req, res) => {
    const { productId, quantity, variantSku } = req.body;
    const cart = await cartService.updateItem(req.user.id, productId, quantity, variantSku);
    return sendSuccess(res, cart, "Cart updated");
  }),
  remove: asyncHandler(async (req, res) => {
    const cart = await cartService.removeItem(req.user.id, req.params.productId, req.query.variantSku);
    return sendSuccess(res, cart, "Item removed");
  }),
  clear: asyncHandler(async (req, res) => {
    const cart = await cartService.clear(req.user.id);
    return sendSuccess(res, cart, "Cart cleared");
  })
};

// src/validators/cart.validators.ts
var import_zod6 = require("zod");
var addItemSchema = {
  body: import_zod6.z.object({
    productId: import_zod6.z.string().length(24),
    quantity: import_zod6.z.number().int().min(1).max(99).default(1),
    variantSku: import_zod6.z.string().optional()
  })
};
var updateItemSchema = {
  body: import_zod6.z.object({
    productId: import_zod6.z.string().length(24),
    quantity: import_zod6.z.number().int().min(0).max(99),
    variantSku: import_zod6.z.string().optional()
  })
};

// src/routes/cart.routes.ts
var router5 = (0, import_express5.Router)();
router5.use(authenticate);
router5.get("/", cartController.get);
router5.post("/items", validate(addItemSchema), cartController.add);
router5.patch("/items", validate(updateItemSchema), cartController.update);
router5.delete("/items/:productId", cartController.remove);
router5.delete("/", cartController.clear);
var cart_routes_default = router5;

// src/routes/order.routes.ts
var import_express6 = require("express");

// src/services/order.service.ts
var import_mongoose17 = __toESM(require("mongoose"));

// src/models/Order.ts
var import_mongoose14 = require("mongoose");
var orderItemSchema = new import_mongoose14.Schema(
  {
    product: { type: import_mongoose14.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    variantName: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String }
  },
  { _id: false }
);
var shippingAddressSchema = new import_mongoose14.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" }
  },
  { _id: false }
);
var statusHistorySchema = new import_mongoose14.Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    note: { type: String },
    changedBy: { type: import_mongoose14.Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);
var orderSchema = new import_mongoose14.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: import_mongoose14.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    itemsTotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, default: 0, min: 0 },
    promoCode: { type: String, trim: true, uppercase: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.COD
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true
    },
    // Audit trail of every status change.
    statusHistory: { type: [statusHistorySchema], default: [] },
    placedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ "shippingAddress.phone": 1 });
var Order = (0, import_mongoose14.model)("Order", orderSchema);

// src/config/db.ts
var import_mongoose15 = __toESM(require("mongoose"));
async function connectDatabase() {
  import_mongoose15.default.set("strictQuery", true);
  import_mongoose15.default.connection.on("connected", () => logger.info("MongoDB connected"));
  import_mongoose15.default.connection.on("error", (err) => logger.error("MongoDB error", { err: err.message }));
  import_mongoose15.default.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  await import_mongoose15.default.connect(env.MONGODB_URI, {
    maxPoolSize: 50,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 8e3,
    socketTimeoutMS: 45e3,
    family: 4
  });
}
async function disconnectDatabase() {
  await import_mongoose15.default.connection.close();
}
var transactionsSupported = null;
async function supportsTransactions() {
  if (transactionsSupported !== null) return transactionsSupported;
  try {
    const admin = import_mongoose15.default.connection.db?.admin();
    const info = await admin?.command({ hello: 1 });
    transactionsSupported = Boolean(info?.setName) || info?.msg === "isdbgrid";
  } catch {
    transactionsSupported = false;
  }
  if (!transactionsSupported) {
    logger.warn(
      "MongoDB is standalone \u2014 order checkout will run without a transaction. Use a replica set in production for atomic multi-document writes."
    );
  }
  return transactionsSupported;
}

// src/models/GiftCard.ts
var import_mongoose16 = require("mongoose");
var giftCardSchema = new import_mongoose16.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ["flat", "percentage"],
      required: true,
      default: "flat"
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDiscount: {
      type: Number,
      min: 0
    },
    expiresAt: {
      type: Date
    },
    usageLimit: {
      type: Number,
      min: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);
var GiftCard = (0, import_mongoose16.model)("GiftCard", giftCardSchema);

// src/services/giftCard.service.ts
var giftCardService = {
  /**
   * Validates a gift card or redeem code against the cart subtotal.
   */
  async validate(rawCode, subtotal) {
    if (!rawCode || !rawCode.trim()) {
      throw ApiError.badRequest("Please enter a valid gift card or promo code");
    }
    const code = rawCode.trim().toUpperCase();
    const card = await GiftCard.findOne({ code, isActive: true });
    if (!card) {
      throw ApiError.notFound("Invalid or expired gift card code");
    }
    if (card.expiresAt && card.expiresAt.getTime() < Date.now()) {
      throw ApiError.badRequest("This gift card code has expired");
    }
    if (card.usageLimit && card.usedCount >= card.usageLimit) {
      throw ApiError.badRequest("This gift card has already reached its redemption limit");
    }
    if (subtotal < card.minOrderValue) {
      throw ApiError.badRequest(
        `Minimum order amount of \u20B9${card.minOrderValue} required for code ${card.code}`
      );
    }
    let discount = 0;
    if (card.discountType === "flat") {
      discount = Math.min(subtotal, card.discountValue);
    } else if (card.discountType === "percentage") {
      discount = Math.round(subtotal * card.discountValue / 100);
      if (card.maxDiscount && discount > card.maxDiscount) {
        discount = card.maxDiscount;
      }
      discount = Math.min(subtotal, discount);
    }
    return {
      code: card.code,
      description: card.description,
      discountType: card.discountType,
      discountValue: card.discountValue,
      discount,
      minOrderValue: card.minOrderValue
    };
  },
  /**
   * Records usage after an order is successfully created.
   */
  async recordUsage(code) {
    if (!code) return;
    await GiftCard.updateOne({ code: code.trim().toUpperCase() }, { $inc: { usedCount: 1 } });
  },
  /**
   * Lists all gift cards for the admin panel.
   */
  async listAll() {
    return GiftCard.find().sort({ createdAt: -1 }).lean();
  },
  /**
   * Creates a new gift card / promo code from admin.
   */
  async create(data) {
    const code = data.code.trim().toUpperCase();
    const existing = await GiftCard.findOne({ code });
    if (existing) {
      throw ApiError.badRequest(`Gift card with code ${code} already exists`);
    }
    const created = await GiftCard.create({
      code,
      description: data.description.trim(),
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      minOrderValue: Number(data.minOrderValue) || 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : void 0,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : void 0,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : void 0,
      isActive: true
    });
    return created.toObject();
  },
  /**
   * Toggles the active status of a gift card.
   */
  async toggleActive(id) {
    const card = await GiftCard.findById(id);
    if (!card) throw ApiError.notFound("Gift card not found");
    card.isActive = !card.isActive;
    await card.save();
    return card.toObject();
  },
  /**
   * Deletes a gift card.
   */
  async remove(id) {
    const card = await GiftCard.findByIdAndDelete(id);
    if (!card) throw ApiError.notFound("Gift card not found");
    return card.toObject();
  },
  /**
   * Seeds initial default redeem codes if none exist.
   */
  async seedDefaults() {
    const defaultCodes = [
      {
        code: "DEV100",
        description: "Flat \u20B9100 Gift Voucher on orders above \u20B9499",
        discountType: "flat",
        discountValue: 100,
        minOrderValue: 499,
        isActive: true
      },
      {
        code: "WELCOME10",
        description: "10% Welcome Discount on all orders",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 0,
        isActive: true
      },
      {
        code: "LUXURY20",
        description: "20% off on Luxury collections over \u20B9999 (Max \u20B9500)",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 999,
        maxDiscount: 500,
        isActive: true
      },
      {
        code: "GIFT500",
        description: "Flat \u20B9500 VIP Gift Card on orders above \u20B91,499",
        discountType: "flat",
        discountValue: 500,
        minOrderValue: 1499,
        isActive: true
      }
    ];
    for (const d of defaultCodes) {
      await GiftCard.findOneAndUpdate(
        { code: d.code },
        { $setOnInsert: d },
        { upsert: true, new: true }
      );
    }
  }
};

// src/services/order.service.ts
var STATUS_MESSAGE = {
  [ORDER_STATUS.PENDING]: (n) => `Order ${n} has been placed`,
  [ORDER_STATUS.CONFIRMED]: (n) => `Order ${n} has been confirmed`,
  [ORDER_STATUS.PROCESSING]: (n) => `Order ${n} is being processed`,
  [ORDER_STATUS.SHIPPED]: (n) => `Order ${n} has been shipped`,
  [ORDER_STATUS.DELIVERED]: (n) => `Order ${n} has been delivered`,
  [ORDER_STATUS.CANCELLED]: (n) => `Order ${n} has been cancelled`,
  [ORDER_STATUS.REFUNDED]: (n) => `Order ${n} has been refunded`
};
function buildOrderFilter(orderId, extraFilter = {}) {
  const trimmed = (orderId || "").trim();
  if (!trimmed) {
    return { _id: null, ...extraFilter };
  }
  if (import_mongoose17.default.isValidObjectId(trimmed)) {
    return {
      $or: [
        { _id: new import_mongoose17.Types.ObjectId(trimmed), ...extraFilter },
        { orderNumber: trimmed, ...extraFilter }
      ]
    };
  }
  return { orderNumber: trimmed, ...extraFilter };
}
var orderService = {
  /**
   * Creates an order from the user's cart inside a transaction: validates stock,
   * snapshots line items, atomically decrements inventory, clears the cart and
   * notifies staff of the new order. MongoDB remains the source of truth.
   */
  async checkout(userId, input) {
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name sku price images stock variants isActive"
    );
    if (!cart || cart.items.length === 0) throw ApiError.badRequest("Your cart is empty");
    const lowStockProducts = [];
    const placeOrder = async (session) => {
      const items = [];
      let itemsTotal = 0;
      for (const cartItem of cart.items) {
        const product = cartItem.product;
        if (!product || !product.isActive) {
          throw ApiError.badRequest("A product in your cart is no longer available");
        }
        const variant = cartItem.variantSku ? product.variants.find((v) => v.sku === cartItem.variantSku) : void 0;
        const unitPrice = variant ? variant.price : product.price;
        const dec = await Product.updateOne(
          { _id: product._id, stock: { $gte: cartItem.quantity } },
          { $inc: { stock: -cartItem.quantity } },
          session ? { session } : {}
        );
        if (dec.modifiedCount === 0) {
          throw ApiError.badRequest(`Not enough stock for ${product.name}`);
        }
        items.push({
          product: product._id,
          name: product.name,
          sku: variant?.sku ?? product.sku,
          variantName: variant?.name,
          price: unitPrice,
          quantity: cartItem.quantity,
          image: product.images?.find((im) => im.isPrimary)?.url ?? product.images?.[0]?.url
        });
        itemsTotal += unitPrice * cartItem.quantity;
        const remaining = product.stock - cartItem.quantity;
        if (remaining <= LOW_STOCK_THRESHOLD) {
          lowStockProducts.push({ id: product._id.toString(), name: product.name, stock: remaining });
        }
      }
      let discount = 0;
      let appliedPromoCode = void 0;
      if (input.promoCode) {
        const promo = await giftCardService.validate(input.promoCode, itemsTotal);
        discount = promo.discount;
        appliedPromoCode = promo.code;
      }
      const shippingFee = itemsTotal >= 999 ? 0 : 99;
      const finalTotal = Math.max(0, itemsTotal - discount) + shippingFee;
      const orderNumber = generateOrderNumber();
      const [order] = await Order.create(
        [
          {
            orderNumber,
            user: new import_mongoose17.Types.ObjectId(userId),
            items,
            shippingAddress: input.shippingAddress,
            itemsTotal,
            shippingFee,
            discount,
            promoCode: appliedPromoCode,
            total: finalTotal,
            status: ORDER_STATUS.PENDING,
            paymentMethod: input.paymentMethod,
            paymentStatus: PAYMENT_STATUS.PENDING,
            statusHistory: [
              { status: ORDER_STATUS.PENDING, note: "Order placed", changedAt: /* @__PURE__ */ new Date() }
            ]
          }
        ],
        session ? { session } : {}
      );
      if (appliedPromoCode) {
        await giftCardService.recordUsage(appliedPromoCode);
      }
      cart.items = [];
      await cart.save(session ? { session } : {});
      return order;
    };
    let created;
    if (await supportsTransactions()) {
      const session = await import_mongoose17.default.startSession();
      try {
        let result;
        await session.withTransaction(async () => {
          result = await placeOrder(session);
        });
        if (!result) throw ApiError.internal("Failed to create order");
        created = result;
      } finally {
        await session.endSession();
      }
    } else {
      created = await placeOrder();
    }
    await cache.del(CACHE.KEY.dashboard());
    await this.invalidateProductCaches();
    await notificationService.create({
      type: "new_order",
      title: "New order received",
      message: `Order ${created.orderNumber} \xB7 \u20B9${created.total.toLocaleString("en-IN")}`,
      forStaff: true,
      relatedEntity: { kind: "order", id: created._id.toString(), ref: created.orderNumber },
      dashboardDirty: true
    });
    await notificationService.create({
      type: "order_status",
      title: "Order placed",
      message: STATUS_MESSAGE[ORDER_STATUS.PENDING](created.orderNumber),
      userId,
      relatedEntity: { kind: "order", id: created._id.toString(), ref: created.orderNumber }
    });
    for (const lp of lowStockProducts) {
      await notificationService.create({
        type: "low_stock",
        title: "Low stock",
        message: `${lp.name} is low on stock (${lp.stock} left)`,
        forStaff: true,
        relatedEntity: { kind: "product", id: lp.id },
        dashboardDirty: true
      });
    }
    void emailService.sendOrderPlaced(created).catch(
      (err) => logger.warn("Order-placed email failed", { orderId: created._id.toString(), err: err.message })
    );
    return created.toObject();
  },
  async listForUser(userId, query) {
    const { page, limit, skip } = getPageParams(query);
    const filter = { user: new import_mongoose17.Types.ObjectId(userId) };
    if (query.status) filter.status = query.status;
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter)
    ]);
    return { items, meta: buildPageMeta(total, page, limit) };
  },
  async getForUser(userId, orderId) {
    const filter = buildOrderFilter(orderId, { user: userId });
    const order = await Order.findOne(filter).lean();
    if (!order) throw ApiError.notFound("Order not found");
    return order;
  },
  async cancelByUser(userId, orderId) {
    const filter = buildOrderFilter(orderId, { user: userId });
    const order = await Order.findOne(filter);
    if (!order) throw ApiError.notFound("Order not found");
    if (!ORDER_STATUS_TRANSITIONS[order.status].includes(ORDER_STATUS.CANCELLED)) {
      throw ApiError.badRequest(`An order that is ${order.status} can no longer be cancelled`);
    }
    return this.changeStatus(order._id.toString(), ORDER_STATUS.CANCELLED, userId, "Cancelled by customer");
  },
  // ---- Admin ----
  async adminList(query) {
    const { page, limit, skip } = getPageParams(query);
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.search) {
      filter.orderNumber = { $regex: String(query.search).trim(), $options: "i" };
    }
    const sort = query.sort === "amount_desc" ? { total: -1 } : query.sort === "amount_asc" ? { total: 1 } : { createdAt: -1 };
    const [items, total] = await Promise.all([
      Order.find(filter).sort(sort).skip(skip).limit(limit).populate("user", "name email").lean(),
      Order.countDocuments(filter)
    ]);
    return { items, meta: buildPageMeta(total, page, limit) };
  },
  async adminGet(orderId) {
    const filter = buildOrderFilter(orderId);
    const order = await Order.findOne(filter).populate("user", "name email phone").populate("statusHistory.changedBy", "name role").lean();
    if (!order) throw ApiError.notFound("Order not found");
    return order;
  },
  /**
   * Transitions an order to a new status. Enforces the allowed transition graph,
   * appends to the audit trail, restocks on cancel/refund, and emits a real-time
   * notification to the owning customer.
   */
  async changeStatus(orderId, next, actorId, note) {
    const filter = buildOrderFilter(orderId);
    const order = await Order.findOne(filter);
    if (!order) throw ApiError.notFound("Order not found");
    const allowed = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowed.includes(next)) {
      throw ApiError.badRequest(`Cannot change order from ${order.status} to ${next}`);
    }
    if (next === ORDER_STATUS.CANCELLED || next === ORDER_STATUS.REFUNDED) {
      await Promise.all(
        order.items.map(
          (item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
        )
      );
      if (next === ORDER_STATUS.REFUNDED) order.paymentStatus = PAYMENT_STATUS.REFUNDED;
      await this.invalidateProductCaches();
    }
    if (next === ORDER_STATUS.DELIVERED && order.paymentMethod === "cod") {
      order.paymentStatus = PAYMENT_STATUS.PAID;
    }
    order.status = next;
    order.statusHistory.push({
      status: next,
      note,
      changedBy: new import_mongoose17.Types.ObjectId(actorId),
      changedAt: /* @__PURE__ */ new Date()
    });
    await order.save();
    await cache.del(CACHE.KEY.dashboard());
    await notificationService.create({
      type: next === ORDER_STATUS.CANCELLED ? "order_cancelled" : "order_status",
      title: "Order update",
      message: STATUS_MESSAGE[next](order.orderNumber),
      userId: order.user.toString(),
      relatedEntity: { kind: "order", id: order._id.toString(), ref: order.orderNumber },
      dashboardDirty: true
    });
    void emailService.sendOrderStatus(order, next, note).catch(
      (err) => logger.warn("Order-status email failed", { orderId: order._id.toString(), err: err.message })
    );
    logger.info("Order status changed", {
      orderId: order._id.toString(),
      from: allowed,
      to: next,
      actorId
    });
    return order.toObject();
  },
  /**
   * Permanently deletes an order from the database.
   * If the order was not yet delivered or cancelled, restores item quantities to inventory stock.
   */
  async adminDelete(orderId, actorId) {
    const filter = buildOrderFilter(orderId);
    const order = await Order.findOne(filter);
    if (!order) throw ApiError.notFound("Order not found");
    const deletedOrderNumber = order.orderNumber;
    const deletedId = order._id.toString();
    if (order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.REFUNDED) {
      await Promise.all(
        order.items.map(
          (item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }).catch(() => null)
        )
      );
      await this.invalidateProductCaches();
    }
    await Order.deleteOne({ _id: order._id });
    await cache.del(CACHE.KEY.dashboard());
    logger.info(`[ORDER] Order #${deletedOrderNumber} (${deletedId}) permanently deleted by staff ${actorId}`);
    return {
      success: true,
      orderNumber: deletedOrderNumber,
      id: deletedId
    };
  },
  async invalidateProductCaches() {
    await cache.delByPattern(CACHE.PATTERN.productLists);
    await cache.delByPattern(CACHE.PATTERN.products);
  }
};

// src/controllers/order.controller.ts
var orderController = {
  // ---- Customer ----
  checkout: asyncHandler(async (req, res) => {
    const order = await orderService.checkout(req.user.id, req.body);
    return sendSuccess(res, order, "Order placed successfully", 201);
  }),
  listMine: asyncHandler(async (req, res) => {
    const { items, meta } = await orderService.listForUser(req.user.id, req.query);
    return sendSuccess(res, items, "Orders fetched", 200, meta);
  }),
  getMine: asyncHandler(async (req, res) => {
    const order = await orderService.getForUser(req.user.id, req.params.id);
    return sendSuccess(res, order, "Order fetched");
  }),
  cancelMine: asyncHandler(async (req, res) => {
    const order = await orderService.cancelByUser(req.user.id, req.params.id);
    return sendSuccess(res, order, "Order cancelled");
  }),
  // ---- Admin ----
  adminList: asyncHandler(async (req, res) => {
    const { items, meta } = await orderService.adminList(req.query);
    return sendSuccess(res, items, "Orders fetched", 200, meta);
  }),
  adminGet: asyncHandler(async (req, res) => {
    const order = await orderService.adminGet(req.params.id);
    return sendSuccess(res, order, "Order fetched");
  }),
  adminUpdateStatus: asyncHandler(async (req, res) => {
    const order = await orderService.changeStatus(
      req.params.id,
      req.body.status,
      req.user.id,
      req.body.note
    );
    return sendSuccess(res, order, "Order status updated");
  }),
  adminDelete: asyncHandler(async (req, res) => {
    const result = await orderService.adminDelete(req.params.id, req.user.id);
    return sendSuccess(res, result, `Order #${result.orderNumber} deleted successfully`);
  })
};

// src/validators/order.validators.ts
var import_zod7 = require("zod");
var shippingAddressSchema2 = import_zod7.z.object({
  fullName: import_zod7.z.string().min(2),
  phone: import_zod7.z.string().min(6).max(20),
  line1: import_zod7.z.string().min(3),
  line2: import_zod7.z.string().optional(),
  city: import_zod7.z.string().min(2),
  state: import_zod7.z.string().min(2),
  postalCode: import_zod7.z.string().min(3).max(12),
  country: import_zod7.z.string().min(2).default("India")
});
var checkoutSchema = {
  body: import_zod7.z.object({
    shippingAddress: shippingAddressSchema2,
    paymentMethod: import_zod7.z.enum([PAYMENT_METHOD.COD, PAYMENT_METHOD.CARD, PAYMENT_METHOD.UPI, PAYMENT_METHOD.NETBANKING]).default(PAYMENT_METHOD.COD),
    promoCode: import_zod7.z.string().trim().optional()
  })
};
var updateOrderStatusSchema = {
  body: import_zod7.z.object({
    status: import_zod7.z.enum([
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.REFUNDED
    ]),
    note: import_zod7.z.string().max(300).optional()
  })
};

// src/routes/order.routes.ts
var router6 = (0, import_express6.Router)();
router6.use(authenticate);
router6.post("/checkout", validate(checkoutSchema), orderController.checkout);
router6.get("/", orderController.listMine);
router6.get("/:id", orderController.getMine);
router6.post("/:id/cancel", orderController.cancelMine);
var order_routes_default = router6;

// src/routes/notification.routes.ts
var import_express7 = require("express");

// src/controllers/notification.controller.ts
var notificationController = {
  list: asyncHandler(async (req, res) => {
    const { items, unread, meta } = await notificationService.listForUser(
      req.user.id,
      req.user.role,
      req.query
    );
    return sendSuccess(res, { items, unread }, "Notifications fetched", 200, meta);
  }),
  markRead: asyncHandler(async (req, res) => {
    await notificationService.markRead(req.user.id, req.user.role, req.params.id);
    return sendSuccess(res, null, "Notification marked as read");
  }),
  markAllRead: asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user.id, req.user.role);
    return sendSuccess(res, null, "All notifications marked as read");
  })
};

// src/routes/notification.routes.ts
var router7 = (0, import_express7.Router)();
router7.use(authenticate);
router7.get("/", notificationController.list);
router7.post("/read-all", notificationController.markAllRead);
router7.post("/:id/read", notificationController.markRead);
var notification_routes_default = router7;

// src/routes/admin.routes.ts
var import_express8 = require("express");

// src/services/dashboard.service.ts
var dashboardService = {
  /**
   * Aggregated dashboard metrics. Cached briefly (60s) in Redis because these
   * queries are expensive and the dashboard is polled/refreshed frequently.
   * The cache key is busted on order/product writes so numbers stay fresh.
   */
  async stats() {
    return cache.remember(CACHE.KEY.dashboard(), CACHE.TTL.DASHBOARD, async () => {
      const [
        revenueAgg,
        totalOrders,
        pending,
        confirmed,
        processing,
        shipped,
        completed,
        cancelled,
        refunded,
        totalCustomers,
        totalProducts,
        lowStock,
        recentOrders,
        recentCustomers,
        salesByDay,
        topProducts
      ] = await Promise.all([
        Order.aggregate([
          { $match: { status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED] } } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ]),
        Order.countDocuments(),
        Order.countDocuments({ status: ORDER_STATUS.PENDING }),
        Order.countDocuments({ status: ORDER_STATUS.CONFIRMED }),
        Order.countDocuments({ status: ORDER_STATUS.PROCESSING }),
        Order.countDocuments({ status: ORDER_STATUS.SHIPPED }),
        Order.countDocuments({ status: ORDER_STATUS.DELIVERED }),
        Order.countDocuments({ status: ORDER_STATUS.CANCELLED }),
        Order.countDocuments({ status: ORDER_STATUS.REFUNDED }),
        User.countDocuments({ role: ROLES.CUSTOMER }),
        Product.countDocuments(),
        Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } }),
        Order.find().sort({ createdAt: -1 }).limit(6).populate("user", "name email").lean(),
        User.find({ role: ROLES.CUSTOMER }).sort({ createdAt: -1 }).limit(6).lean(),
        // Revenue + order count for the last 14 days (analytics chart).
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3) },
              status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED] }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        // Best-selling products by units sold (product performance).
        Order.aggregate([
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product",
              name: { $first: "$items.name" },
              unitsSold: { $sum: "$items.quantity" },
              revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
            }
          },
          { $sort: { unitsSold: -1 } },
          { $limit: 5 }
        ])
      ]);
      return {
        totals: {
          revenue: revenueAgg[0]?.total ?? 0,
          orders: totalOrders,
          pendingOrders: pending,
          confirmedOrders: confirmed,
          processingOrders: processing,
          shippedOrders: shipped,
          completedOrders: completed,
          cancelledOrders: cancelled,
          refundedOrders: refunded,
          customers: totalCustomers,
          products: totalProducts,
          lowStockProducts: lowStock
        },
        recentOrders,
        recentCustomers,
        salesByDay,
        topProducts
      };
    });
  }
};

// src/services/customer.service.ts
var customerService = {
  async list(query) {
    const { page, limit, skip } = getPageParams(query);
    const filter = { role: ROLES.CUSTOMER };
    if (query.search) {
      const s = String(query.search).trim();
      filter.$or = [{ name: { $regex: s, $options: "i" } }, { email: { $regex: s, $options: "i" } }];
    }
    if (query.status === "active") filter.isActive = true;
    if (query.status === "inactive") filter.isActive = false;
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter)
    ]);
    return { items, meta: buildPageMeta(total, page, limit) };
  },
  async get(id) {
    const user2 = await User.findById(id).lean();
    if (!user2) throw ApiError.notFound("Customer not found");
    const [orderCount, spentAgg] = await Promise.all([
      Order.countDocuments({ user: id }),
      Order.aggregate([
        { $match: { user: user2._id, status: { $nin: ["cancelled", "refunded"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ])
    ]);
    return { ...user2, stats: { orders: orderCount, totalSpent: spentAgg[0]?.total ?? 0 } };
  },
  async setActive(id, isActive) {
    const user2 = await User.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!user2) throw ApiError.notFound("Customer not found");
    return user2.toJSON();
  },
  /**
   * Updates a staff member's role. Only a super admin may assign staff roles;
   * enforced at the route layer, re-checked here defensively.
   */
  async updateRole(actorRole, id, role) {
    if (actorRole !== ROLES.SUPER_ADMIN && STAFF_ROLES.includes(role)) {
      throw ApiError.forbidden("Only a super admin can assign staff roles");
    }
    const user2 = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user2) throw ApiError.notFound("User not found");
    return user2.toJSON();
  }
};

// src/controllers/admin.controller.ts
var adminController = {
  dashboard: asyncHandler(async (_req, res) => {
    const stats = await dashboardService.stats();
    return sendSuccess(res, stats, "Dashboard stats fetched");
  }),
  // Customers
  listCustomers: asyncHandler(async (req, res) => {
    const { items, meta } = await customerService.list(req.query);
    return sendSuccess(res, items, "Customers fetched", 200, meta);
  }),
  getCustomer: asyncHandler(async (req, res) => {
    const customer = await customerService.get(req.params.id);
    return sendSuccess(res, customer, "Customer fetched");
  }),
  setCustomerActive: asyncHandler(async (req, res) => {
    const customer = await customerService.setActive(req.params.id, Boolean(req.body.isActive));
    return sendSuccess(res, customer, "Customer updated");
  }),
  updateUserRole: asyncHandler(async (req, res) => {
    const user2 = await customerService.updateRole(req.user.role, req.params.id, req.body.role);
    return sendSuccess(res, user2, "Role updated");
  }),
  // Categories (admin management)
  listCategories: asyncHandler(async (_req, res) => {
    const items = await categoryService.listAll();
    return sendSuccess(res, items, "Categories fetched");
  }),
  createCategory: asyncHandler(async (req, res) => {
    const category = await categoryService.create(req.body);
    return sendSuccess(res, category, "Category created", 201);
  }),
  updateCategory: asyncHandler(async (req, res) => {
    const category = await categoryService.update(req.params.id, req.body);
    return sendSuccess(res, category, "Category updated");
  }),
  removeCategory: asyncHandler(async (req, res) => {
    const result = await categoryService.remove(req.params.id);
    return sendSuccess(res, result, "Category deleted");
  })
};

// src/services/storage.service.ts
var import_promises = __toESM(require("fs/promises"));
var import_node_path = __toESM(require("path"));
var import_node_crypto2 = __toESM(require("crypto"));

// src/models/UploadedMedia.ts
var import_mongoose18 = require("mongoose");
var uploadedMediaSchema = new import_mongoose18.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, default: "" },
    mimeType: { type: String, required: true, default: "image/jpeg" },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true }
  },
  { timestamps: true }
);
var UploadedMedia = (0, import_mongoose18.model)("UploadedMedia", uploadedMediaSchema);

// src/services/storage.service.ts
var uploadRoot = import_node_path.default.resolve(process.cwd(), env.UPLOAD_DIR);
async function ensureDir(dir) {
  await import_promises.default.mkdir(dir, { recursive: true });
}
var storageService = {
  get uploadRoot() {
    return uploadRoot;
  },
  async save(file, req) {
    if (env.STORAGE_DRIVER !== "local") {
      throw ApiError.internal(`Storage driver "${env.STORAGE_DRIVER}" is not configured`);
    }
    const ext = import_node_path.default.extname(file.originalname) || ".bin";
    const key = `products/${import_node_crypto2.default.randomUUID()}${ext}`;
    const dest = import_node_path.default.join(uploadRoot, key);
    try {
      await ensureDir(import_node_path.default.dirname(dest));
      await import_promises.default.writeFile(dest, file.buffer);
    } catch (diskErr) {
      logger.warn("Disk cache write failed, falling back to MongoDB only", { err: diskErr.message });
    }
    try {
      await UploadedMedia.create({
        key,
        originalName: file.originalname,
        mimeType: file.mimetype || "image/jpeg",
        size: file.size,
        data: file.buffer
      });
      logger.info("Image permanently persisted to MongoDB Atlas", { key, size: file.size });
    } catch (dbErr) {
      logger.error("Failed to persist media in MongoDB Atlas", { key, err: dbErr.message });
    }
    let base = env.PUBLIC_ASSET_BASE;
    if (req) {
      const forwardedHost = req.get("x-forwarded-host");
      const forwardedProto = req.get("x-forwarded-proto") || "https";
      if (forwardedHost) {
        base = `${forwardedProto}://${forwardedHost}`;
      } else if (req.get("host")) {
        const proto = req.secure || req.protocol === "https" ? "https" : req.protocol;
        base = `${proto}://${req.get("host")}`;
      }
    }
    if ((!base || base.includes("localhost:4000")) && (process.env.RENDER || process.env.NODE_ENV === "production")) {
      base = "https://lightseagreen-donkey-692988.hostingersite.com";
    }
    return {
      url: `${base.replace(/\/+$/, "")}/uploads/${key}`,
      key,
      size: file.size,
      mimeType: file.mimetype
    };
  },
  async findMedia(key) {
    const cleanKey = key.replace(/^\/+/, "");
    return UploadedMedia.findOne({
      $or: [
        { key: cleanKey },
        { key: `products/${cleanKey}` },
        { key: cleanKey.replace(/^products\//, "") }
      ]
    });
  }
};

// src/controllers/upload.controller.ts
var uploadController = {
  images: asyncHandler(async (req, res) => {
    const files = req.files ?? [];
    if (!files.length) throw ApiError.badRequest("No images were uploaded");
    const stored = await Promise.all(files.map((f) => storageService.save(f, req)));
    return sendSuccess(res, stored, "Images uploaded", 201);
  })
};

// src/controllers/giftCard.controller.ts
var giftCardController = {
  validate: asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;
    const result = await giftCardService.validate(code, Number(subtotal) || 0);
    return sendSuccess(res, result, `Promo code ${result.code} applied successfully!`);
  }),
  listAvailable: asyncHandler(async (_req, res) => {
    const codes = await giftCardService.listAll();
    return sendSuccess(res, codes, "Available gift card codes fetched");
  }),
  adminList: asyncHandler(async (_req, res) => {
    const list = await giftCardService.listAll();
    return sendSuccess(res, list, "All gift cards retrieved");
  }),
  adminCreate: asyncHandler(async (req, res) => {
    const created = await giftCardService.create(req.body);
    return sendSuccess(res, created, "Gift card created successfully", 201);
  }),
  adminToggle: asyncHandler(async (req, res) => {
    const updated = await giftCardService.toggleActive(req.params.id);
    return sendSuccess(res, updated, "Gift card status updated");
  }),
  adminDelete: asyncHandler(async (req, res) => {
    const deleted = await giftCardService.remove(req.params.id);
    return sendSuccess(res, deleted, "Gift card deleted successfully");
  })
};

// src/middleware/upload.ts
var import_multer = __toESM(require("multer"));
var ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
var uploadImages = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest("Only JPG, PNG, WEBP, AVIF or GIF images are allowed"));
    }
    cb(null, true);
  }
});

// src/routes/admin.routes.ts
var router8 = (0, import_express8.Router)();
router8.use(authenticate, authorizeStaff);
router8.get("/dashboard", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.dashboard);
router8.get("/products", validate(listProductsSchema), productController.list);
router8.get("/products/:idOrSlug", productController.detail);
router8.post("/products", validate(createProductSchema), productController.create);
router8.patch("/products/:id", validate(updateProductSchema), productController.update);
router8.delete("/products/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), productController.remove);
router8.post("/uploads", uploadImages.array("images", 8), uploadController.images);
router8.get("/categories", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.listCategories);
router8.post("/categories", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.createCategory);
router8.patch("/categories/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.updateCategory);
router8.delete("/categories/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.removeCategory);
router8.get("/orders", orderController.adminList);
router8.get("/orders/:id", orderController.adminGet);
router8.patch("/orders/:id/status", validate(updateOrderStatusSchema), orderController.adminUpdateStatus);
router8.delete("/orders/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), orderController.adminDelete);
router8.get("/customers", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.listCustomers);
router8.get("/customers/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.getCustomer);
router8.patch("/customers/:id/active", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.setCustomerActive);
router8.get("/gift-cards", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), giftCardController.adminList);
router8.post("/gift-cards", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), giftCardController.adminCreate);
router8.patch("/gift-cards/:id/toggle", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), giftCardController.adminToggle);
router8.delete("/gift-cards/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), giftCardController.adminDelete);
router8.patch("/users/:id/role", authorize(ROLES.SUPER_ADMIN), adminController.updateUserRole);
var admin_routes_default = router8;

// src/routes/giftCard.routes.ts
var import_express9 = require("express");
var router9 = (0, import_express9.Router)();
router9.post("/validate", giftCardController.validate);
router9.get("/available", giftCardController.listAvailable);
var giftCard_routes_default = router9;

// src/routes/newsletter.routes.ts
var import_express10 = require("express");

// src/models/Subscriber.ts
var import_mongoose19 = require("mongoose");
var subscriberSchema = new import_mongoose19.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    discountCode: {
      type: String,
      default: "WELCOME10"
    },
    discountPercent: {
      type: Number,
      default: 10
    },
    source: {
      type: String,
      default: "footer_circle"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    welcomeEmailSent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
var Subscriber = (0, import_mongoose19.model)("Subscriber", subscriberSchema);

// src/routes/newsletter.routes.ts
var router10 = (0, import_express10.Router)();
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
router10.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address."
    });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const discountCode = "WELCOME10";
  const discountPercent = 10;
  try {
    let subscriber2 = await Subscriber.findOne({ email: normalizedEmail });
    const isNewSubscriber = !subscriber2;
    if (!subscriber2) {
      subscriber2 = await Subscriber.create({
        email: normalizedEmail,
        discountCode,
        discountPercent,
        source: "footer_circle",
        isActive: true,
        welcomeEmailSent: false
      });
    } else if (!subscriber2.isActive) {
      subscriber2.isActive = true;
      await subscriber2.save();
    }
    if (!subscriber2.welcomeEmailSent) {
      sendMailWithDetails({
        to: normalizedEmail,
        subject: "\u2728 Welcome to Dev Creation Circle \u2014 Private Sale Invitations & Care Rituals",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFDF8; border: 1px solid rgba(184,148,63,0.3); border-radius: 16px; overflow: hidden; padding: 36px 32px; color: #2C1810;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #8C6F2A; font-weight: 700;">Dev Creation Circle</span>
              <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 500; color: #2C1810; margin: 12px 0 6px 0;">Welcome to Our Fragrance Sanctuary</h1>
              <p style="font-size: 14px; color: #5A4E46; margin: 0; line-height: 1.6;">You are now on our private guestlist. Enjoy handcrafted luxury wax sachets and master perfumer creations.</p>
            </div>

            <div style="background: #FAF6EF; border: 1px solid rgba(184,148,63,0.35); border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #8C6F2A; margin: 0 0 8px 0; font-weight: 700;">Private Invitations to Future Sales</p>
              <p style="font-size: 14px; color: #2C1810; font-weight: 600; margin: 0 0 6px 0;">Delivered Exclusively to Your Email</p>
              <p style="font-size: 12px; color: #5A4E46; margin: 6px 0 0 0; line-height: 1.5;">You will be the first to receive secret seasonal drops, private sale invitations, and artisanal candle care rituals directly here in your inbox.</p>
            </div>

            <div style="text-align: center; margin-top: 28px;">
              <a href="https://devcreation24.in/products" style="display: inline-block; background: #2C1810; color: #FFFFFF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.16em; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                Explore The Collection \u2192
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid rgba(44,24,16,0.08); margin: 32px 0 20px 0;" />
            <p style="font-size: 11px; color: #8C6F2A; text-align: center; margin: 0; line-height: 1.5;">
              Pure Soy Wax &bull; IFRA-Certified Oils &bull; Crafted in India<br />
              Questions? Concierge support: <a href="mailto:support@devcreation24.in" style="color: #2C1810;">support@devcreation24.in</a>
            </p>
          </div>
        `,
        text: `Welcome to Dev Creation Circle! You are on our private guestlist. Watch your inbox for secret seasonal drops, private sale invitations, and candle care rituals.`
      }).then((result) => {
        if (result.success) {
          Subscriber.updateOne({ _id: subscriber2._id }, { welcomeEmailSent: true }).exec();
        }
      }).catch((err) => {
        logger.warn("Failed to send newsletter welcome email", { err: err.message });
      });
    }
    try {
      publishEvent({
        type: NOTIFICATION_TYPE.CUSTOMER_REGISTERED,
        title: "New Circle Member",
        message: `${normalizedEmail} joined Dev Creation Circle`,
        toStaff: true,
        dashboardDirty: true
      });
    } catch {
    }
    return res.json({
      success: true,
      message: isNewSubscriber ? "Welcome to the Dev Creation Circle! You are on our private guestlist for future sales and secret drops." : "Welcome back! You are on our private guestlist for future sales and secret drops.",
      data: {
        email: normalizedEmail
      }
    });
  } catch (err) {
    logger.error("Newsletter subscribe error", { err: err?.message || String(err) });
    return res.status(500).json({
      success: false,
      message: "Failed to complete subscription. Please try again.",
      error: err?.message
    });
  }
});
router10.get("/subscribers", authenticate, authorizeStaff, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || "20"), 10)));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Subscriber.find({ isActive: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Subscriber.countDocuments({ isActive: true })
    ]);
    return res.json({
      success: true,
      data: {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers.",
      error: err?.message
    });
  }
});
var newsletter_routes_default = router10;

// src/routes/index.ts
var router11 = (0, import_express11.Router)();
router11.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "OK",
    data: {
      uptime: process.uptime(),
      smtpHost: env.SMTP_HOST,
      smtpPort: env.SMTP_PORT,
      smtpUser: env.SMTP_USER,
      emailFrom: env.EMAIL_FROM
    }
  });
});
router11.get("/test-email", async (req, res) => {
  const to = req.query.to || env.ADMIN_NOTIFY_EMAIL || "support@devcreation24.in";
  try {
    const result = await sendMailWithDetails({
      to,
      subject: "Dev Creation SMTP Test Notification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #2C1810; margin-top: 0;">Dev Creation SMTP Live Test</h2>
          <p style="font-size: 14px; color: #334155;">Hostinger SMTP is connected and working!</p>
          <div style="background-color: #f8fafc; padding: 12px 14px; border-radius: 6px; font-size: 13px; margin: 14px 0;">
            <p style="margin: 3px 0;"><strong>Recipient:</strong> ${to}</p>
            <p style="margin: 3px 0;"><strong>Server Time:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Dev Creation &bull; support@devcreation24.in</p>
        </div>
      `,
      text: `Dev Creation SMTP Live Test: Hostinger SMTP is working! Recipient: ${to}, Time: ${(/* @__PURE__ */ new Date()).toISOString()}`
    });
    if (result.success) {
      return res.json({
        success: true,
        message: `Test email successfully sent to ${to}`,
        messageId: result.messageId,
        portUsed: result.portUsed
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Failed to send test email to ${to}`,
        error: result.error,
        code: result.code
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "SMTP send threw an error",
      error: err?.message || String(err)
    });
  }
});
router11.use("/auth", auth_routes_default);
router11.use("/users", user_routes_default);
router11.use("/products", product_routes_default);
router11.use("/categories", category_routes_default);
router11.use("/cart", cart_routes_default);
router11.use("/orders", order_routes_default);
router11.use("/notifications", notification_routes_default);
router11.use("/admin", admin_routes_default);
router11.use("/gift-cards", giftCard_routes_default);
router11.use("/newsletter", newsletter_routes_default);
var routes_default = router11;

// src/app.ts
function createApp() {
  const app = (0, import_express12.default)();
  app.set("trust proxy", 1);
  app.use(
    (0, import_helmet.default)({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  const corsOptions = {
    origin: corsOriginHandler,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400
    // 24 hours preflight cache for fast mobile performance
  };
  app.use((0, import_cors2.default)(corsOptions));
  app.options("*", (0, import_cors2.default)(corsOptions));
  app.use(import_express12.default.json({ limit: "1mb" }));
  app.use(import_express12.default.urlencoded({ extended: true }));
  app.use((0, import_cookie_parser.default)());
  app.use((0, import_compression.default)());
  app.use((0, import_express_mongo_sanitize.default)());
  app.use(
    (0, import_morgan.default)(env.isProd ? "combined" : "dev", {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) }
    })
  );
  app.use("/uploads", import_express12.default.static(import_node_path2.default.join(storageService.uploadRoot)));
  app.get("/uploads/*", async (req, res, next) => {
    try {
      const rawKey = req.params[0] || req.params[0] || "";
      const media = await storageService.findMedia(rawKey);
      if (!media) return next();
      const dest = import_node_path2.default.join(storageService.uploadRoot, media.key);
      await import_promises2.default.mkdir(import_node_path2.default.dirname(dest), { recursive: true }).catch(() => {
      });
      await import_promises2.default.writeFile(dest, media.data).catch(() => {
      });
      res.setHeader("Content-Type", media.mimeType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(media.data);
    } catch (err) {
      return next(err);
    }
  });
  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "OK", data: { uptime: process.uptime() } });
  });
  app.get(`${env.API_PREFIX}/health`, (_req, res) => {
    res.json({ success: true, message: "OK", data: { uptime: process.uptime() } });
  });
  app.use(env.API_PREFIX, apiLimiter, routes_default);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

// src/events/subscriber.ts
async function startEventSubscriber() {
  if (!redisState.available) {
    logger.info("Skipping Redis subscriber \u2014 running in single-instance real-time mode");
    return;
  }
  try {
    await subscriber.subscribe(REDIS_CHANNELS.EVENTS);
  } catch (err) {
    logger.warn("Could not subscribe to Redis events", { err: err.message });
    return;
  }
  subscriber.on("message", (channel, raw) => {
    if (channel !== REDIS_CHANNELS.EVENTS) return;
    try {
      dispatchToSockets(JSON.parse(raw));
    } catch {
    }
  });
  logger.info("Redis event subscriber started");
}

// src/server.ts
async function bootstrap() {
  await connectDatabase();
  await giftCardService.seedDefaults().catch((err) => {
    logger.warn("Failed to seed default gift cards", { err: err.message });
  });
  await connectRedis();
  await verifyMailer();
  initRateLimiters();
  const app = createApp();
  const httpServer = (0, import_node_http.createServer)(app);
  initSocket(httpServer);
  await startEventSubscriber();
  httpServer.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });
  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    httpServer.close();
    await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { reason: String(reason) });
  });
}
bootstrap().catch((err) => {
  logger.error("Fatal startup error", { err: err.message, stack: err.stack });
  process.exit(1);
});
//# sourceMappingURL=server.js.map