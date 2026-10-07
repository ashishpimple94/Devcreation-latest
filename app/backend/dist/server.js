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
var import_express11 = __toESM(require("express"));
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
  STORE_URL: import_zod.z.string().default("https://devcreation24.in")
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
var import_express10 = require("express");

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
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
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
var port = Number(env.SMTP_PORT) || 465;
var user = env.SMTP_USER || "support@devcreation24.in";
var pass = env.SMTP_PASS || "Devcreation@890*";
var secure = port === 465 ? true : Boolean(env.SMTP_SECURE);
var transporter = import_nodemailer.default.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  tls: {
    rejectUnauthorized: false
  }
});
async function verifyMailer() {
  if (!transporter) {
    logger.warn("SMTP not configured \u2014 emails will be logged to the console, not sent");
    return;
  }
  try {
    await transporter.verify();
    logger.info("SMTP transport ready");
  } catch (err) {
    logger.warn("SMTP verification failed \u2014 emails may not be delivered", {
      err: err.message
    });
  }
}
async function sendMail(input) {
  if (!transporter) {
    logger.info("\u{1F4E7} [email:log-mode]", {
      to: input.to,
      subject: input.subject,
      attachments: input.attachments?.map((a) => a.filename)
    });
    return true;
  }
  try {
    const fromAddress = env.EMAIL_FROM || '"Dev Creation" <support@devcreation24.in>';
    const info = await transporter.sendMail({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments
    });
    logger.info("Email sent successfully", { to: input.to, subject: input.subject, messageId: info?.messageId });
    return true;
  } catch (err) {
    logger.error("Email send failed", { to: input.to, subject: input.subject, err: err.message });
    return false;
  }
}

// src/utils/invoice.ts
var import_pdfkit = __toESM(require("pdfkit"));
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
      doc.rect(0, 0, pageWidth, 90).fill(DEEP);
      doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text("DEV CREATION", left, 30);
      doc.fillColor(GOLD).fontSize(8).font("Helvetica").text("HANDCRAFTED WITH LOVE, SCENTED WITH CARE", left, 58, { characterSpacing: 2 });
      doc.fillColor("#FFFFFF").fontSize(18).font("Helvetica-Bold").text("INVOICE", left, 30, { align: "right", width: right - left });
      let y = 115;
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
${a.country}
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
      totalRow("Items total", rupee(order.itemsTotal));
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
var C = {
  paper: "#FFFDF8",
  surface: "#FFFFFF",
  surface2: "#FAF6EF",
  ink: "#1C1410",
  ink3: "#5C4F46",
  gold: "#B8943F",
  goldDk: "#8C6F2A",
  deep: "#2C1810",
  line: "#EDE6DA"
};
var rupee2 = (n) => "&#8377;" + Math.round(n).toLocaleString("en-IN");
var esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function layout(bodyHtml, preheader = "") {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:Georgia,'Times New Roman',serif;color:${C.ink3};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:92%;background:${C.surface};border:1px solid ${C.line};border-radius:14px;overflow:hidden;">
        <!-- header -->
        <tr><td style="background:${C.deep};padding:26px 32px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:22px;letter-spacing:3px;color:#fff;font-weight:600;">DEV CREATION</div>
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;color:${C.gold};margin-top:6px;text-transform:uppercase;">Handcrafted with love, scented with care</div>
        </td></tr>
        <!-- body -->
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <!-- footer -->
        <tr><td style="background:${C.surface2};padding:22px 32px;border-top:1px solid ${C.line};text-align:center;">
          <div style="font-family:Arial,sans-serif;font-size:12px;color:${C.ink3};">Questions? Reply to this email or reach us on WhatsApp.</div>
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:${C.goldDk};margin-top:8px;text-transform:uppercase;">Free shipping over &#8377;999 &middot; Returns within 14 days</div>
          <div style="font-family:Arial,sans-serif;font-size:11px;color:#9b8f84;margin-top:10px;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Dev Creation</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
function button(label, href) {
  return `<a href="${esc(href)}" style="display:inline-block;background:${C.deep};color:#fff;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:13px 26px;border-radius:8px;">${esc(label)}</a>`;
}
function itemsTable(items) {
  const rows = items.map(
    (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:Arial,sans-serif;font-size:13px;color:${C.ink};">
          ${esc(i.name)}${i.variantName ? ` <span style="color:${C.ink3};">(${esc(i.variantName)})</span>` : ""}
          <div style="color:${C.ink3};font-size:12px;">Qty ${i.quantity}</div>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:'Courier New',monospace;font-size:13px;color:${C.ink};white-space:nowrap;">${rupee2(i.price * i.quantity)}</td>
      </tr>`
  ).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}
function totals(order) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding:3px 0;">Items total</td>
        <td align="right" style="font-family:'Courier New',monospace;font-size:13px;color:${C.ink};">${rupee2(order.itemsTotal)}</td></tr>
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding:3px 0;">Shipping</td>
        <td align="right" style="font-family:'Courier New',monospace;font-size:13px;color:${C.ink};">${order.shippingFee ? rupee2(order.shippingFee) : "Free"}</td></tr>
    <tr><td style="font-family:Arial,sans-serif;font-size:15px;color:${C.ink};font-weight:bold;padding-top:8px;border-top:1px solid ${C.line};">Total</td>
        <td align="right" style="font-family:'Courier New',monospace;font-size:15px;color:${C.ink};font-weight:bold;padding-top:8px;border-top:1px solid ${C.line};">${rupee2(order.total)}</td></tr>
  </table>`;
}
function addressBlock(order) {
  const a = order.shippingAddress;
  return `<div style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};line-height:1.6;">
    <strong style="color:${C.ink};">${esc(a.fullName)}</strong><br>
    ${esc(a.line1)}${a.line2 ? ", " + esc(a.line2) : ""}<br>
    ${esc(a.city)}, ${esc(a.state)} ${esc(a.postalCode)}<br>
    ${esc(a.country)}<br>${esc(a.phone)}
  </div>`;
}
function sectionLabel(text) {
  return `<div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.goldDk};margin:22px 0 8px;">${esc(text)}</div>`;
}
function orderConfirmationEmail(order, customerName) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;color:${C.ink};margin:0 0 6px;">Thank you for your order!</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0 0 4px;">Hi ${esc(customerName)}, we've received your order and are getting it ready. Your invoice is attached.</p>
    <p style="font-family:'Courier New',monospace;font-size:13px;color:${C.gold};letter-spacing:1px;margin:14px 0;">Order ${esc(order.orderNumber)}</p>
    ${sectionLabel("Order summary")}
    ${itemsTable(order.items)}
    <div style="margin-top:12px;">${totals(order)}</div>
    ${sectionLabel("Shipping to")}
    ${addressBlock(order)}
    <div style="margin-top:26px;text-align:center;">${button("View your order", `${env.STORE_URL}/account/orders`)}</div>`;
  return {
    subject: `Order ${order.orderNumber} confirmed \u2014 Dev Creation`,
    html: layout(body, `Your Dev Creation order ${order.orderNumber} is confirmed.`),
    text: `Thank you for your order! Order ${order.orderNumber}. Total ${String(order.total)}. View: ${env.STORE_URL}/account/orders`
  };
}
function adminNewOrderEmail(order, customerName) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:24px;color:${C.ink};margin:0 0 6px;">New order received</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0;">A new order has been placed and needs processing.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;background:${C.surface2};border-radius:10px;">
      <tr><td style="padding:16px 18px;font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};">
        <div><strong style="color:${C.ink};">Order:</strong> ${esc(order.orderNumber)}</div>
        <div><strong style="color:${C.ink};">Customer:</strong> ${esc(customerName)}</div>
        <div><strong style="color:${C.ink};">Total:</strong> ${rupee2(order.total)}</div>
        <div><strong style="color:${C.ink};">Payment:</strong> ${esc(order.paymentMethod.toUpperCase())}</div>
      </td></tr>
    </table>
    ${sectionLabel("Items")}
    ${itemsTable(order.items)}
    ${sectionLabel("Ship to")}
    ${addressBlock(order)}
    <div style="margin-top:26px;text-align:center;">${button("Open in admin", `${env.STORE_URL.replace("3000", "3001")}/orders`)}</div>`;
  return {
    subject: `\u{1F6CE} New order ${order.orderNumber} \u2014 ${rupee2(order.total).replace("&#8377;", "\u20B9")}`,
    html: layout(body, `New order ${order.orderNumber} from ${customerName}.`),
    text: `New order ${order.orderNumber} from ${customerName}. Total ${String(order.total)}.`
  };
}
var STATUS_COPY = {
  pending: { title: "Order received", line: "We have received your order and it is awaiting confirmation." },
  confirmed: { title: "Order confirmed", line: "Good news \u2014 your order has been confirmed and will be prepared shortly." },
  processing: { title: "Order is being processed", line: "We are carefully preparing and packing your items." },
  shipped: { title: "Your order has shipped", line: "Your order is on its way! You will receive it soon." },
  delivered: { title: "Order delivered", line: "Your order has been delivered. We hope you love it!" },
  cancelled: { title: "Order cancelled", line: "Your order has been cancelled. If this was a mistake, please contact us." },
  refunded: { title: "Order refunded", line: "Your refund has been processed. It may take a few days to reflect." }
};
function orderStatusEmail(order, customerName, status, note) {
  const copy = STATUS_COPY[status];
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:25px;color:${C.ink};margin:0 0 6px;">${esc(copy.title)}</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0 0 4px;">Hi ${esc(customerName)}, ${esc(copy.line)}</p>
    <p style="font-family:'Courier New',monospace;font-size:13px;color:${C.gold};letter-spacing:1px;margin:14px 0;">Order ${esc(order.orderNumber)} &middot; ${esc(status.toUpperCase())}</p>
    ${note ? `<p style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};background:${C.surface2};border-radius:8px;padding:12px 14px;margin:0 0 8px;">${esc(note)}</p>` : ""}
    ${sectionLabel("Order summary")}
    ${itemsTable(order.items)}
    <div style="margin-top:12px;">${totals(order)}</div>
    <div style="margin-top:26px;text-align:center;">${button("Track your order", `${env.STORE_URL}/account/orders`)}</div>`;
  return {
    subject: `${copy.title} \u2014 Order ${order.orderNumber}`,
    html: layout(body, `${copy.title} for order ${order.orderNumber}.`),
    text: `${copy.title}. Order ${order.orderNumber} is now ${status}. ${note ?? ""}`
  };
}
function welcomeEmail(customerName) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;color:${C.ink};margin:0 0 6px;">Welcome to Dev Creation!</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0 0 16px;line-height:1.6;">
      Dear ${esc(customerName)}, thank you for joining the Dev Creation family. We create luxury handcrafted scented candles, curated home aromas, and artisanal gifting essentials designed to elevate your everyday moments.
    </p>
    <div style="background:${C.surface2};border-radius:10px;padding:18px 22px;margin:20px 0;">
      <div style="font-family:Georgia,serif;font-size:15px;color:${C.ink};font-weight:600;margin-bottom:6px;">What you can enjoy with your account:</div>
      <ul style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding-left:20px;margin:0;line-height:1.7;">
        <li>Seamless order tracking & instant real-time updates</li>
        <li>Early access to limited editions & scented drops</li>
        <li>Express checkout and personalized recommendations</li>
      </ul>
    </div>
    <div style="margin-top:28px;text-align:center;">
      ${button("Explore Our Collections", `${env.STORE_URL}/products`)}
    </div>`;
  return {
    subject: `Welcome to Dev Creation, ${customerName} \u2728`,
    html: layout(body, `Welcome to Dev Creation \u2014 Handcrafted with love, scented with care.`),
    text: `Welcome to Dev Creation, ${customerName}! Explore our handcrafted candles & aromas: ${env.STORE_URL}/products`
  };
}
function passwordResetEmail(customerName, resetUrl) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:24px;color:${C.ink};margin:0 0 6px;">Password Reset Request</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0 0 14px;line-height:1.6;">
      Hi ${esc(customerName)}, we received a request to reset the password for your Dev Creation account. Click the button below to set a new password:
    </p>
    <div style="margin:26px 0;text-align:center;">
      ${button("Reset My Password", resetUrl)}
    </div>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#9b8f84;line-height:1.5;">
      This password reset link is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
    </p>`;
  return {
    subject: `Reset your Dev Creation password`,
    html: layout(body, `Reset your Dev Creation password within 15 minutes.`),
    text: `Reset your Dev Creation password by opening: ${resetUrl} (Valid for 15 minutes).`
  };
}

// src/services/email.service.ts
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
  /** On checkout: confirmation (with PDF invoice) to the customer + alert to admin. */
  async sendOrderPlaced(order) {
    const customer = await resolveCustomer(order);
    const name = customer?.name ?? order.shippingAddress.fullName;
    let invoice;
    try {
      invoice = await generateInvoicePdf(order, name);
    } catch (err) {
      logger.warn("Invoice generation failed", { orderId: order._id.toString(), err: err.message });
    }
    if (customer?.email) {
      const tpl = orderConfirmationEmail(order, name);
      await sendMail({
        to: customer.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        attachments: invoice ? [{ filename: `invoice-${order.orderNumber}.pdf`, content: invoice, contentType: "application/pdf" }] : void 0
      });
    }
    const adminEmail = env.ADMIN_NOTIFY_EMAIL || env.SEED_ADMIN_EMAIL;
    if (adminEmail) {
      const adminTpl = adminNewOrderEmail(order, name);
      await sendMail({ to: adminEmail, subject: adminTpl.subject, html: adminTpl.html, text: adminTpl.text });
    }
  },
  /** On status change: notify the customer. */
  async sendOrderStatus(order, status, note) {
    const customer = await resolveCustomer(order);
    if (!customer?.email) return;
    const tpl = orderStatusEmail(order, customer.name, status, note);
    await sendMail({ to: customer.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  },
  /** On registration: send a welcome email to the customer. */
  async sendWelcome(user2) {
    if (!user2.email) return;
    const tpl = welcomeEmail(user2.name);
    await sendMail({ to: user2.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  },
  /** On forgot password: send password reset email with token link. */
  async sendPasswordReset(user2, token) {
    if (!user2.email) return;
    const resetUrl = `${env.STORE_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const tpl = passwordResetEmail(user2.name, resetUrl);
    await sendMail({ to: user2.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
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
  async login(email, password) {
    const user2 = await User.findOne({ email: email.toLowerCase() }).select("+password");
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
  async me(userId) {
    const user2 = await User.findById(userId);
    if (!user2) throw ApiError.notFound("User not found");
    return user2.toJSON();
  }
};

// src/utils/asyncHandler.ts
var asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// src/controllers/auth.controller.ts
var refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax",
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
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    return sendSuccess(res, result, "Logged in successfully");
  }),
  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken ?? req.body.refreshToken;
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
  me: asyncHandler(async (req, res) => {
    const user2 = await authService.me(req.user.id);
    return sendSuccess(res, user2, "Current user");
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
    email: import_zod2.z.string().email("Enter a valid email"),
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
router.get("/me", authenticate, authController.me);
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
var import_mongoose9 = require("mongoose");

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
function buildFilter(q) {
  const filter = {};
  if (!q.includeInactive) filter.isActive = true;
  if (q.featured !== void 0) filter.isFeatured = q.featured;
  if (q.category) filter.category = new import_mongoose9.Types.ObjectId(String(q.category));
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
    const filter = buildFilter(q);
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
      const query = import_mongoose9.Types.ObjectId.isValid(idOrSlug) ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug };
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
      import_mongoose9.Types.ObjectId.isValid(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug }
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
var import_mongoose11 = require("mongoose");

// src/models/Review.ts
var import_mongoose10 = require("mongoose");
var reviewSchema = new import_mongoose10.Schema(
  {
    product: { type: import_mongoose10.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: import_mongoose10.Schema.Types.ObjectId, ref: "User", required: true, index: true },
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
var Review = (0, import_mongoose10.model)("Review", reviewSchema);

// src/services/review.service.ts
var reviewService = {
  /**
   * Resolves a Product by ObjectId or Slug.
   */
  async resolveProduct(idOrSlug) {
    const isObjectId = import_mongoose11.Types.ObjectId.isValid(idOrSlug) && idOrSlug.length === 24;
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

// src/models/Category.ts
var import_mongoose12 = require("mongoose");
var categorySchema = new import_mongoose12.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    // Self-reference supports categories + subcategories.
    parent: { type: import_mongoose12.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    image: { type: String },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);
var Category = (0, import_mongoose12.model)("Category", categorySchema);

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
var Order = (0, import_mongoose14.model)("Order", orderSchema);

// src/config/db.ts
var import_mongoose15 = __toESM(require("mongoose"));
async function connectDatabase() {
  import_mongoose15.default.set("strictQuery", true);
  import_mongoose15.default.connection.on("connected", () => logger.info("MongoDB connected"));
  import_mongoose15.default.connection.on("error", (err) => logger.error("MongoDB error", { err: err.message }));
  import_mongoose15.default.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  await import_mongoose15.default.connect(env.MONGODB_URI, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 1e4
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
    const order = await Order.findOne({ _id: orderId, user: userId }).lean();
    if (!order) throw ApiError.notFound("Order not found");
    return order;
  },
  async cancelByUser(userId, orderId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw ApiError.notFound("Order not found");
    if (!ORDER_STATUS_TRANSITIONS[order.status].includes(ORDER_STATUS.CANCELLED)) {
      throw ApiError.badRequest(`An order that is ${order.status} can no longer be cancelled`);
    }
    return this.changeStatus(orderId, ORDER_STATUS.CANCELLED, userId, "Cancelled by customer");
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
    const order = await Order.findById(orderId).populate("user", "name email phone").populate("statusHistory.changedBy", "name role").lean();
    if (!order) throw ApiError.notFound("Order not found");
    return order;
  },
  /**
   * Transitions an order to a new status. Enforces the allowed transition graph,
   * appends to the audit trail, restocks on cancel/refund, and emits a real-time
   * notification to the owning customer.
   */
  async changeStatus(orderId, next, actorId, note) {
    const order = await Order.findById(orderId);
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
      (err) => logger.warn("Order-status email failed", { orderId, err: err.message })
    );
    logger.info("Order status changed", {
      orderId,
      from: allowed,
      to: next,
      actorId
    });
    return order.toObject();
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

// src/routes/index.ts
var router10 = (0, import_express10.Router)();
router10.get("/health", (_req, res) => {
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
router10.get("/test-email", async (req, res) => {
  const to = req.query.to || env.ADMIN_NOTIFY_EMAIL || "support@devcreation24.in";
  try {
    const success = await sendMail({
      to,
      subject: "Dev Creation SMTP Test Notification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-top: 0;">\u2705 Dev Creation SMTP Live Test</h2>
          <p style="font-size: 15px; color: #334155;">Hostinger SMTP is connected and working perfectly!</p>
          <div style="background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Recipient:</strong> ${to}</p>
            <p style="margin: 4px 0;"><strong>SMTP Host:</strong> ${env.SMTP_HOST}</p>
            <p style="margin: 4px 0;"><strong>Port:</strong> ${env.SMTP_PORT} (SSL)</p>
            <p style="margin: 4px 0;"><strong>From:</strong> ${env.EMAIL_FROM}</p>
            <p style="margin: 4px 0;"><strong>Server Time:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">This is an automated test message from Dev Creation Backend.</p>
        </div>
      `,
      text: `Dev Creation SMTP Live Test: Hostinger SMTP is working! Recipient: ${to}, Time: ${(/* @__PURE__ */ new Date()).toISOString()}`
    });
    if (success) {
      return res.json({
        success: true,
        message: `Test email successfully sent to ${to}`,
        details: {
          to,
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          from: env.EMAIL_FROM
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Failed to send test email to ${to}. Check backend server logs.`
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
router10.use("/auth", auth_routes_default);
router10.use("/users", user_routes_default);
router10.use("/products", product_routes_default);
router10.use("/categories", category_routes_default);
router10.use("/cart", cart_routes_default);
router10.use("/orders", order_routes_default);
router10.use("/notifications", notification_routes_default);
router10.use("/admin", admin_routes_default);
router10.use("/gift-cards", giftCard_routes_default);
var routes_default = router10;

// src/app.ts
function createApp() {
  const app = (0, import_express11.default)();
  app.set("trust proxy", 1);
  app.use(
    (0, import_helmet.default)({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(
    (0, import_cors2.default)({
      origin: corsOriginHandler,
      credentials: true
    })
  );
  app.options(
    "*",
    (0, import_cors2.default)({
      origin: corsOriginHandler,
      credentials: true
    })
  );
  app.use(import_express11.default.json({ limit: "1mb" }));
  app.use(import_express11.default.urlencoded({ extended: true }));
  app.use((0, import_cookie_parser.default)());
  app.use((0, import_compression.default)());
  app.use((0, import_express_mongo_sanitize.default)());
  app.use(
    (0, import_morgan.default)(env.isProd ? "combined" : "dev", {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) }
    })
  );
  app.use("/uploads", import_express11.default.static(import_node_path2.default.join(storageService.uploadRoot)));
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