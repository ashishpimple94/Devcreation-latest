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

// src/seed/seed.ts
var import_mongoose4 = __toESM(require("mongoose"));

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

// src/models/User.ts
var import_mongoose = require("mongoose");
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

// src/models/User.ts
var userSchema = new import_mongoose.Schema(
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
    wishlist: [{ type: import_mongoose.Schema.Types.ObjectId, ref: "Product" }]
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
var User = (0, import_mongoose.model)("User", userSchema);

// src/models/Category.ts
var import_mongoose2 = require("mongoose");
var categorySchema = new import_mongoose2.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    // Self-reference supports categories + subcategories.
    parent: { type: import_mongoose2.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    image: { type: String },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);
var Category = (0, import_mongoose2.model)("Category", categorySchema);

// src/models/Product.ts
var import_mongoose3 = require("mongoose");
var imageSchema = new import_mongoose3.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  },
  { _id: false }
);
var variantSchema = new import_mongoose3.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 }
  },
  { _id: false }
);
var productSchema = new import_mongoose3.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, required: true, trim: true },
    fragrance: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    category: { type: import_mongoose3.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
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
var Product = (0, import_mongoose3.model)("Product", productSchema);

// src/utils/slug.ts
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

// src/seed/products.data.ts
var SEED_CATEGORIES = [
  { name: "Wax Melts", slug: "wax-melts", description: "Handcrafted soy wax melts." },
  { name: "Aroma Stones", slug: "aroma-stones", description: "Scented aroma stones." },
  { name: "Gift Sets", slug: "gift-sets", description: "Curated gifting collections." },
  { name: "Wax Sachets", slug: "wax-sachets", description: "Long-lasting wax sachets." }
];
var SEED_PRODUCTS = [
  {
    name: "Ocean Breeze",
    sku: "DC-OCEAN",
    type: "Wax Melts",
    fragrance: "Ocean Breeze",
    description: "to elevate your room ambience in office space, homes, wash room, hotel ambience etc.",
    price: 599,
    weight: "50g",
    stock: 40,
    images: ["/assets/Gifting/Pasted image.png"],
    tags: ["100% Handmade", "Long Lasting", "Premium Quality", "Perfect For Gifting"],
    isFeatured: true,
    categorySlug: "wax-melts"
  },
  {
    name: "Aroma Stone Gift Set",
    sku: "DC-AROMA-SET",
    type: "Aroma Stones",
    fragrance: "Lavender \xB7 Fresh Vanilla \xB7 Kapur \xB7 Lemongrass",
    description: "a curated set of four aroma stones in soothing Lavender, warm Fresh Vanilla, classic Kapur and zesty Lemongrass \u2014 perfect for gifting.",
    price: 649,
    weight: "4 pcs",
    stock: 30,
    images: ["/assets/Gifting/Pasted image (2).png"],
    tags: ["100% Handmade", "Long Lasting", "Premium Quality", "Perfect For Gifting"],
    isFeatured: true,
    categorySlug: "aroma-stones"
  },
  {
    name: "Chocolate Candle Gift Set",
    sku: "DC-CHOCO",
    type: "Candle Gift Set",
    fragrance: "Chocolate",
    description: "a beautifully packaged chocolate-scented candle gift set \u2014 perfect for birthdays, housewarmings and special occasions.",
    price: 549,
    weight: "Set",
    stock: 25,
    images: ["/assets/Gifting/Pasted image (3).png"],
    tags: ["100% Handmade", "Long Lasting", "Premium Quality", "Perfect For Gifting"],
    isFeatured: false,
    categorySlug: "gift-sets"
  },
  {
    name: "Wax Melt Gift Set",
    sku: "DC-WAXSET",
    type: "Gift Set",
    fragrance: "Assorted Fragrances",
    description: "a premium wax melt gift set \u2014 ideal for gifting on festivals, weddings, housewarmings, birthdays and corporate events.",
    price: 799,
    weight: "Gift Box",
    stock: 20,
    images: ["/assets/Gifting/Waxset.png"],
    tags: ["100% Handmade", "Premium Packaging", "Assorted Scents", "Perfect For Gifting"],
    isFeatured: true,
    categorySlug: "gift-sets"
  },
  {
    name: "Wax Sachet",
    sku: "DC-SACHET",
    type: "Wax Sachet",
    fragrance: "Multiple Fragrances",
    description: "use for car, bathrooms, gifting & home decor. A long-lasting sachet that keeps your spaces fresh and fragrant.",
    price: 499,
    weight: "100g",
    stock: 60,
    images: ["/assets/Gifting/1.jpeg", "/assets/Gifting/2.jpeg", "/assets/Gifting/3.jpeg"],
    tags: ["100% Handmade", "Long Lasting", "Premium Quality", "Perfect For Gifting"],
    isFeatured: false,
    categorySlug: "wax-sachets"
  }
];

// src/seed/seed.ts
async function seed() {
  await import_mongoose4.default.connect(env.MONGODB_URI);
  logger.info("Connected to MongoDB for seeding");
  const existingAdmin = await User.findOne({ email: env.SEED_ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
      role: ROLES.SUPER_ADMIN
    });
    logger.info(`Created super admin: ${env.SEED_ADMIN_EMAIL}`);
  } else {
    logger.info("Super admin already exists \u2014 skipping");
  }
  const categoryIdBySlug = /* @__PURE__ */ new Map();
  for (const cat of SEED_CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { name: cat.name, description: cat.description, isActive: true } },
      { upsert: true, new: true }
    );
    categoryIdBySlug.set(cat.slug, doc._id);
  }
  logger.info(`Seeded ${SEED_CATEGORIES.length} categories`);
  for (const p of SEED_PRODUCTS) {
    await Product.findOneAndUpdate(
      { sku: p.sku },
      {
        $set: {
          name: p.name,
          slug: slugify(p.name),
          type: p.type,
          fragrance: p.fragrance,
          description: p.description,
          price: p.price,
          weight: p.weight,
          stock: p.stock,
          images: p.images.map((url, i) => ({ url, alt: p.name, isPrimary: i === 0 })),
          tags: p.tags,
          isActive: true,
          isFeatured: p.isFeatured,
          category: categoryIdBySlug.get(p.categorySlug) ?? null
        }
      },
      { upsert: true, new: true }
    );
  }
  logger.info(`Seeded ${SEED_PRODUCTS.length} products`);
  await import_mongoose4.default.disconnect();
  logger.info("Seeding complete \u2705");
  process.exit(0);
}
seed().catch((err) => {
  logger.error("Seeding failed", { err: err.message });
  process.exit(1);
});
//# sourceMappingURL=seed.js.map