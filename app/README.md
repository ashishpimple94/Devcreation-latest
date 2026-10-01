# Dev Creation — Full-Stack E-Commerce Platform

Production-ready e-commerce application for **Dev Creation** (handcrafted luxury wax sachets & candles), converted from the original static HTML marketing site into a scalable full-stack app.

The original design — cream/gold palette, Playfair Display / Cormorant Garamond / DM Sans / JetBrains Mono type stack, product cards, cart drawer — is preserved exactly on the customer-facing storefront. A separate enterprise admin panel is built in the same brand language.

## Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | Next.js (App Router), React, TypeScript, Tailwind CSS   |
| Backend    | Node.js, Express, TypeScript, REST                      |
| Database   | MongoDB + Mongoose                                       |
| Cache/RT   | Redis (cache + Pub/Sub), Socket.IO                      |
| Auth       | JWT, bcrypt, role-based access control                  |

## Structure

```
app/
├── frontend/   # Next.js storefront + admin panel
└── backend/    # Express REST API + Socket.IO + Redis
```

## Prerequisites

- Node.js 20+
- MongoDB running locally or a connection string (Atlas)
- Redis running locally or a connection string

## Setup

```bash
cd app
npm install            # installs both workspaces

# configure env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# edit the values (Mongo URI, Redis URL, JWT secrets)

# seed the database (products from the original site + an admin user)
npm run seed

# run both apps
npm run dev
```

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- API: http://localhost:4000/api

## Seeded admin login

After `npm run seed`, a super-admin account is created using the credentials in `backend/.env`
(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). Defaults are in `.env.example`.

## What is verified vs. what needs live services

This project compiles and type-checks. Full end-to-end flows (real-time notifications, caching,
order persistence) require running MongoDB and Redis instances — see the "Verification" section
at the bottom of this file and `backend/README.md` for the API reference.

## API documentation

See [`backend/README.md`](./backend/README.md) for the full REST API reference and the real-time event contract.

## Verification status

What was verified in this build:

- **Backend** — `tsc --noEmit` passes with zero errors; production build (`tsup`) succeeds.
- **Frontend** — `tsc --noEmit` passes; `next build` succeeds and prerenders all 26 routes (storefront + admin + auth).
- **Dependencies** — installed for both workspaces + the root.

What requires running MongoDB + Redis to exercise end-to-end (not available in the build sandbox, so run these locally):

1. `npm run seed` — loads the 5 original products, categories and the super-admin.
2. Register / login as a customer, browse, filter, add to cart, checkout → order is written to MongoDB.
3. Log in as the seeded admin (`admin@devcreation.example` / `Admin@12345`) → the new order appears, and updating its status pushes a real-time notification to the customer and refreshes the admin dashboard without a reload (Redis Pub/Sub → Socket.IO).
4. Redis caching (product/category/dashboard) and rate limiting are active once Redis is connected.

### One-time local setup note

If `npm install` at the repo root behaves oddly on your machine, install per-workspace:
`npm install` inside `backend/`, then inside `frontend/`, then at the root for `concurrently`.
