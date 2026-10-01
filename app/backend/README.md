# Dev Creation — Backend API

Express + TypeScript REST API with MongoDB (Mongoose), Redis (cache + Pub/Sub) and Socket.IO for real-time events.

## Architecture

```
src/
├── config/        env validation, MongoDB + Redis connections
├── constants/     roles, order-status machine, cache keys, socket events
├── controllers/   thin HTTP handlers (no business logic)
├── services/      business logic (auth, product, cart, order, dashboard, …)
├── models/        Mongoose schemas (indexed)
├── routes/        route → middleware → controller wiring
├── middleware/    auth, authorize, validate, error, rate limiter, upload
├── validators/    Zod request schemas
├── redis/         cache-aside helper
├── events/        Redis Pub/Sub publisher + subscriber (fan-out to sockets)
├── sockets/        Socket.IO server (JWT-authenticated rooms)
├── utils/         logger, ApiError, response envelope, jwt, pagination, slug
├── seed/          idempotent seed (products from the original site + admin)
├── app.ts         Express app assembly (security, CORS, static uploads)
└── server.ts      bootstrap: DB → app → sockets → subscriber → listen
```

### Request lifecycle

`route → rate limiter → authenticate → authorize → validate(Zod) → controller → service → model`

Errors bubble to a centralized handler that returns a consistent envelope.

### Real-time flow

```
Admin action (e.g. update order status)
   → service updates MongoDB (source of truth)
   → notificationService persists a Notification
   → publishEvent() → Redis Pub/Sub channel
   → every API instance's subscriber receives it
   → Socket.IO emits to the customer room + admin room
   → customer sees the update, admin dashboard refreshes — no page reload
```

## Response envelope

Success:
```json
{ "success": true, "message": "Product created successfully", "data": {}, "meta": {} }
```
Error:
```json
{ "success": false, "message": "Unable to create product", "error": {} }
```
`meta` is present on paginated list responses: `{ total, page, limit, totalPages }`.

## Auth & roles

JWT access token (short-lived, `Authorization: Bearer <token>`) + httpOnly refresh cookie.
Roles: `super_admin`, `admin`, `manager`, `customer`.

| Area                 | super_admin | admin | manager | customer |
| -------------------- | :---------: | :---: | :-----: | :------: |
| Dashboard            |     ✔       |  ✔    |         |          |
| Products (write)     |     ✔       |  ✔    |   ✔     |          |
| Product delete       |     ✔       |  ✔    |         |          |
| Orders (view/status) |     ✔       |  ✔    |   ✔     |  own     |
| Customers            |     ✔       |  ✔    |         |          |
| Role management      |     ✔       |       |         |          |
| Cart / wishlist      |             |       |         |   ✔      |

## REST API

Base path: `/api` (configurable via `API_PREFIX`).

### Auth — `/api/auth`
| Method | Path | Auth | Body |
| ------ | ---- | ---- | ---- |
| POST | `/register` | – | `{ name, email, password, phone? }` |
| POST | `/login` | – | `{ email, password }` |
| POST | `/refresh` | cookie | – |
| POST | `/logout` | – | – |
| POST | `/forgot-password` | – | `{ email }` |
| POST | `/reset-password` | – | `{ token, password }` |
| GET  | `/me` | ✔ | – |

### Products — `/api/products` (public, read-only)
| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/` | query: `page, limit, search, category, tag, minPrice, maxPrice, sort, featured` |
| GET | `/:idOrSlug` | single product |
| GET | `/:idOrSlug/related` | related products |

`sort` ∈ `newest | price_asc | price_desc | name_asc | popular`.

### Categories — `/api/categories`
| Method | Path |
| ------ | ---- |
| GET | `/` (active categories) |

### Cart — `/api/cart` (customer)
| Method | Path | Body |
| ------ | ---- | ---- |
| GET | `/` | – |
| POST | `/items` | `{ productId, quantity, variantSku? }` |
| PATCH | `/items` | `{ productId, quantity, variantSku? }` (qty 0 removes) |
| DELETE | `/items/:productId` | `?variantSku=` |
| DELETE | `/` | clear cart |

### Orders — `/api/orders` (customer)
| Method | Path | Body |
| ------ | ---- | ---- |
| POST | `/checkout` | `{ shippingAddress, paymentMethod }` |
| GET | `/` | own orders (paginated) |
| GET | `/:id` | own order detail |
| POST | `/:id/cancel` | cancel own order |

### Users — `/api/users` (customer)
| Method | Path | Body |
| ------ | ---- | ---- |
| PATCH | `/me` | `{ name?, phone? }` |
| POST | `/me/change-password` | `{ currentPassword, newPassword }` |
| GET | `/me/wishlist` | – |
| POST | `/me/wishlist/:productId` | toggle |
| GET | `/me/addresses` | – |
| POST | `/me/addresses` | address body |
| PATCH | `/me/addresses/:id` | address body |
| DELETE | `/me/addresses/:id` | – |

### Notifications — `/api/notifications`
| Method | Path |
| ------ | ---- |
| GET | `/` (own + staff broadcasts) |
| POST | `/:id/read` |
| POST | `/read-all` |

### Admin — `/api/admin` (staff only)
| Method | Path | Min role |
| ------ | ---- | -------- |
| GET | `/dashboard` | admin |
| GET | `/products` | manager |
| POST | `/products` | manager |
| PATCH | `/products/:id` | manager |
| DELETE | `/products/:id` | admin |
| POST | `/uploads` | manager (multipart `images[]`) |
| GET/POST/PATCH/DELETE | `/categories`... | admin |
| GET | `/orders` | manager (query: `page, limit, search, status, paymentStatus, sort`) |
| GET | `/orders/:id` | manager |
| PATCH | `/orders/:id/status` | manager (`{ status, note? }`) |
| GET | `/customers` | admin |
| GET | `/customers/:id` | admin |
| PATCH | `/customers/:id/active` | admin |
| PATCH | `/users/:id/role` | super_admin |

## Order status machine

Transitions are validated server-side; invalid moves are rejected with 400.

```
pending → confirmed → processing → shipped → delivered → refunded
   ↘ cancelled   ↘ cancelled   ↘ cancelled
```

Every change appends to `statusHistory` (audit trail) with `{ status, note, changedBy, changedAt }`.
Cancelling or refunding restocks inventory.

## Real-time (Socket.IO)

Connect with the JWT: `io(SOCKET_URL, { auth: { token } })`.

Server → client events:
| Event | Audience | Payload |
| ----- | -------- | ------- |
| `customer:notification` | the target customer | `{ type, title, message, relatedEntity, createdAt }` |
| `order:updated` | the order's customer | same shape (order status changed) |
| `admin:notification` | all staff | new order, payment, low stock, etc. |
| `admin:dashboard:update` | all staff | `{ at }` — signals a dashboard refetch |

## Caching (Redis)

Cache-aside via `redis/cache.ts`. Cached: public product lists, single products, active categories, dashboard stats. Keys are busted on the relevant writes. Redis is an accelerator — every cache call falls back to MongoDB on failure, so an outage never takes the API down.

Redis is also used for: distributed rate limiting, password-reset tokens, and the Pub/Sub event channel.

## Image storage

Product images are **never** stored in MongoDB — only their URLs/metadata are. `services/storage.service.ts` is a pluggable driver:
- `local` (default, dev): writes to `uploads/` and serves via `/uploads/...`
- `s3` / `cloudinary`: implement the upload branch and return the CDN URL; the rest of the app is unchanged.

## Scripts

```bash
npm run dev        # tsx watch (hot reload)
npm run build      # tsup → dist/
npm start          # node dist/server.js
npm run seed       # seed admin + categories + products
npm run typecheck  # tsc --noEmit
```

## Environment

See `.env.example`. Required: `MONGODB_URI`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
Never commit `.env`. No secrets are exposed to the frontend — only `NEXT_PUBLIC_*` values reach the browser.
