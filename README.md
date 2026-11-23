# FastaPick

FastaPick is a role-based food delivery platform for Ekiti State, Nigeria. The repository contains an Express/MongoDB REST API and an Expo/React Native mobile app for customers, restaurants, riders, and administrators.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Mobile Application](#mobile-application)
- [Role Workflows](#role-workflows)
- [Order Lifecycle](#order-lifecycle)
- [Seeding Data](#seeding-data)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Manual Verification Checklist](#manual-verification-checklist)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Development History](#development-history)

## Overview

The system is split into two applications:

| Directory | Purpose |
| --- | --- |
| `server/` | Express REST API with MongoDB persistence, JWT authentication, restaurants, menus, orders, rider assignment, and location updates |
| `mobile/` | Expo/React Native client with tailored customer, vendor, and rider experiences |

Customers discover restaurants and menu items, build a cart, check out, and track an order. Restaurant vendors receive incoming orders and hand them to riders. Riders accept available deliveries, pick them up, share location, and mark them delivered.

## Features

### Customer

- Onboarding, login, registration, and persistent sessions.
- Restaurant discovery with search, cuisine filters, city filters, and sorting.
- Restaurant detail pages with categorized menus and popular items.
- Cart with quantities, itemized bill, promo field, and delivery details.
- Checkout with address selection, delivery note, and payment method labels.
- Order history with local and API orders merged.
- Order tracking with status timeline, rider contact, and last shared rider location.
- Address management and profile editing.
- Offline demo mode using bundled mock data and AsyncStorage when the API is unreachable.

### Restaurant vendor

- Incoming order queue for owned restaurants.
- Accept order, start preparing, and mark ready for pickup.
- Rider assignment from the active rider list.
- Automatic refresh when returning to the vendor orders screen.
- Profile and role-guarded vendor navigation.

### Rider

- Available delivery queue for orders ready for pickup.
- Accept available deliveries.
- Pick up and deliver assigned orders.
- Foreground location sharing while an active delivery is in progress.
- Assigned delivery list and profile.

### Admin

- API-level access across restaurants, orders, and riders.
- Vendor-like mobile order management surface.
- Additional order status and assignment capabilities.

### API

- JWT auth and bcrypt password hashing.
- Role-based authorization and ownership checks.
- Helmet, CORS, Morgan, and request rate limiting.
- Mongoose models with validation and indexes.
- Lazy MongoDB connection middleware.
- Centralized error handling with development-only stack traces.
- Vercel serverless configuration.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Server runtime | Node.js 18+ |
| Server framework | Express 4 |
| Database | MongoDB with Mongoose 8 |
| Authentication | JSON Web Tokens, bcryptjs |
| Security middleware | Helmet, CORS, express-rate-limit |
| Developer tooling | Nodemon, mongodb-memory-server |
| Hosting | Vercel serverless configuration |
| Mobile framework | Expo SDK 52, React Native 0.76, React 18 |
| Navigation | React Navigation 6 native stack and bottom tabs |
| HTTP client | Axios |
| Mobile storage | AsyncStorage |
| Location | expo-location |
| UI helpers | Linear Gradient, Status Bar, Gesture Handler, Safe Area Context, Screens |
| Web target | react-native-web |

## Project Structure

```text
fasta-pick/
├── .gitignore
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── vercel.json
│   ├── scripts/
│   │   └── dev-mongo.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── db.js
│       │   └── env.js
│       ├── constants/
│       │   └── roles.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── orderController.js
│       │   └── restaurantController.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── error.js
│       ├── models/
│       │   ├── MenuItem.js
│       │   ├── Order.js
│       │   ├── Restaurant.js
│       │   └── User.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── index.js
│       │   ├── orders.js
│       │   └── restaurants.js
│       ├── seed/
│       │   └── seed.js
│       └── utils/
│           └── format.js
└── mobile/
    ├── App.js
    ├── app.json
    ├── babel.config.js
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── components/
        ├── constants/
        ├── context/
        ├── data/
        ├── lib/
        ├── navigation/
        ├── screens/
        ├── services/
        ├── theme/
        └── utils/
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas account or local MongoDB
- Expo Go or Android/iOS emulator for mobile testing
- LAN or public API URL for physical device testing

## Installation

Server:

```bash
cd server
npm install
```

Mobile:

```bash
cd mobile
npm install
```

Dependencies are installed separately in `server/` and `mobile/`; there is no root workspace.

## Configuration

Create `server/.env` from `server/.env.example`.

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; example configuration uses `5000` |
| `MONGO_URI` | MongoDB Atlas or local MongoDB connection string |
| `MONGO_DB` | Database name, for example `fastapick` |
| `JWT_SECRET` | Secret used to sign tokens; must be a strong random value |
| `JWT_EXPIRES_IN` | Token lifetime, for example `30d` |
| `CLIENT_URL` | Comma-separated allowed origins, or `*` during early development |
| `MONGOMS_VERSION` | Version used by `mongodb-memory-server` |

The server also reads `NODE_ENV`, defaulting to `development`. Startup fails if `MONGO_URI` or `JWT_SECRET` is missing.

Mobile API resolution:

1. `EXPO_PUBLIC_API_URL`
2. `expo.extra.apiUrl` in `mobile/app.json`
3. Local fallback URL in `mobile/src/services/api.js`

The checked-in `app.json` value points to a private LAN address for the original development network. Set `EXPO_PUBLIC_API_URL` before starting Expo when running anywhere else.

## Running the Application

### Local development with in-memory MongoDB

Terminal 1:

```bash
cd server
npm run mongo:dev
```

Point `MONGO_URI` at the in-memory instance, then in another terminal:

```bash
cd server
npm run seed
npm run dev
```

Terminal 3:

```bash
cd mobile
npm start
```

Then open Expo Go or press `a`, `i`, or `w`.

### Server scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `start` | `node src/server.js` | Run production-style server |
| `dev` | `nodemon src/server.js` | Run with auto-reload |
| `mongo:dev` | `node scripts/dev-mongo.js` | Start local in-memory MongoDB |
| `seed` | `node src/seed/seed.js` | Replace demo restaurants and menu items |

### Mobile scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `start` | `expo start` | Start Expo development server |
| `android` | `expo start --android` | Open on Android |
| `ios` | `expo start --ios` | Open on iOS |
| `web` | `expo start --web` | Open web build |

API root:

```text
GET http://localhost:5000/api
```

## Demo Accounts

The seed script creates or reuses these staff accounts. All use password `password123`.

| Email | Name | Role |
| --- | --- | --- |
| `vendor@fastapick.test` | Ada Vendor | vendor |
| `rider@fastapick.test` | Tunde Rider | rider |
| `admin@fastapick.test` | Fasta Admin | admin |

No customer demo account is seeded. Register a customer account through the app or API.

## API Reference

All paths below are relative to `/api`.

Authenticated routes require:

```text
Authorization: Bearer <token>
```

### Root and authentication

| Method | Path | Auth / roles | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | API name, tagline, version, endpoint list |
| `POST` | `/auth/register` | Public | Register as customer, vendor, or rider |
| `POST` | `/auth/login` | Public | Login and receive token and user |
| `GET` | `/auth/me` | Any | Current user |
| `PUT` | `/auth/me` | Any | Update name, phone, city, or avatar |
| `POST` | `/auth/addresses` | Any | Add a delivery address |
| `GET` | `/auth/riders` | vendor, admin | List users with rider role |

Registration defaults to `customer` when no role is supplied.

### Restaurants

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/restaurants` | Public | Search/filter/sort restaurants |
| `GET` | `/restaurants/categories` | Public | Distinct cuisine/category values |
| `GET` | `/restaurants/cities` | Public | Distinct restaurant cities |
| `GET` | `/restaurants/:id/menu` | Public | Menu sorted by popular and name |
| `GET` | `/restaurants/:id` | Public | Restaurant with menu and categories |

Restaurant query parameters include `search`, `category`, `city`, `featured=true`, and `sort=fastest|rating|fee`.

### Orders

| Method | Path | Auth / roles | Description |
| --- | --- | --- | --- |
| `POST` | `/orders` | Any | Create order from cart items and address |
| `GET` | `/orders` | Any | Current user's orders |
| `GET` | `/orders/incoming` | vendor, admin | Active orders; vendors limited to owned restaurants |
| `GET` | `/orders/available` | rider, admin | Ready-for-pickup orders without a rider |
| `GET` | `/orders/assigned` | rider | Assigned active deliveries |
| `GET` | `/orders/:id` | Any, scoped | Single order |
| `PATCH` | `/orders/:id/status` | vendor, admin | Enforced status transition |
| `PATCH` | `/orders/:id/assign` | vendor, admin | Assign rider and set `ready_for_pickup` |
| `PATCH` | `/orders/:id/accept` | rider | Rider accepts available delivery |
| `PATCH` | `/orders/:id/pickup` | rider | Set order to `on_the_way` |
| `PATCH` | `/orders/:id/deliver` | rider | Set order to `delivered` and payment to paid |
| `POST` | `/orders/:id/location` | rider | Store rider latitude, longitude, and timestamp |

Server behavior:

- `trust proxy` is enabled.
- JSON body limit is 1 MB.
- `/api` is rate-limited to 500 requests per 15 minutes.
- MongoDB connection is lazy.
- A 404 handler and centralized error handler are installed.
- Stack traces are returned only when `NODE_ENV=development`.

## Data Models

### User

- Name, unique lowercase email, phone, hashed password, role, avatar, and city.
- Roles: `customer`, `vendor`, `rider`, `admin`.
- Address subdocuments with label, full address, landmark, phone, and default flag.
- Password has `select: false` and is removed from JSON output.
- `matchPassword` helper for login validation.

### Restaurant

- Name, unique slug, description, images, logo, cuisines, categories, city, area, and address.
- Rating, review count, delivery time range, delivery fee, minimum order, open and featured flags.
- Promo field and owner reference.
- Text index over name, cuisines, and city.

### MenuItem

- Restaurant reference, name, description, price, image, and category.
- Popular, available, prep time, spice level, and tags.
- Indexed by restaurant.

### Order

- User and restaurant references plus restaurant name snapshot.
- Item snapshots with menu item reference, name, image, price, and quantity.
- Subtotal, delivery fee, service fee, discount, total, and payment fields.
- Status, delivery address, estimated delivery, rider fields, rider location, and timestamps.
- Timeline entries with status and time.

## Mobile Application

App identity:

- Name: FastaPick
- Slug: `fastapick`
- Version: `1.0.0`
- Bundle identifier: `com.fastapick.app`
- Orientation: portrait
- Targets: Android, iOS, and web
- Includes `expo-location` plugin and iOS location usage description

Session handling:

- AuthContext persists session data in AsyncStorage.
- It hydrates the session through `GET /auth/me`.
- Network failures can activate an offline demo mode with local users, addresses, cart, orders, and bundled restaurants.

Important client modules:

| Path | Purpose |
| --- | --- |
| `src/services/api.js` | Axios client and API base URL |
| `src/context/AuthContext.js` | Authentication, session hydration, and offline mode |
| `src/context/CartContext.js` | Cart totals, promo field, and local order persistence |
| `src/navigation/AppNavigator.js` | Auth stacks and role-specific tabs |
| `src/lib/session.js` | Session persistence helpers |
| `src/lib/storage.js` | AsyncStorage helpers |
| `src/theme/theme.js` | Design tokens and MD3-inspired theme |
| `src/theme/responsive.js` | Responsive layout helpers |
| `src/data/mock.js` | Bundled demo restaurants and fallback data |
| `src/screens/` | Customer, vendor, rider, and profile screens |

## Role Workflows

| Role | Mobile tabs | Primary actions |
| --- | --- | --- |
| Customer | Home, Explore, Orders, Profile | Discover food, order, track, manage profile |
| Vendor | Kitchen, Profile | Receive orders, prepare, assign riders |
| Rider | Available, Assigned, Profile | Accept, pick up, deliver, share location |
| Admin | Vendor-like tabs plus API | Manage restaurants, orders, and riders |

Role guards are implemented through shared permission maps and the `withRole` wrapper.

## Order Lifecycle

```text
pending -> confirmed -> preparing -> ready_for_pickup -> on_the_way -> delivered
cancelled is available from eligible early states
```

Vendor actions:

- Accept: `pending -> confirmed`
- Start preparing: `confirmed -> preparing`
- Mark ready: `preparing -> ready_for_pickup`
- Assign rider: sets rider and keeps order ready for pickup

Rider actions:

- Accept: claims a ready order
- Pickup: `ready_for_pickup -> on_the_way`
- Deliver: `on_the_way -> delivered`, payment marked paid

Client tracking polls `GET /orders/:id` every 15 seconds while an order is active. Rider location is posted every 10 seconds while foreground location sharing is active.

## Seeding Data

```bash
cd server
npm run seed
```

The seed script:

- Deletes all existing menu items and restaurants.
- Creates 7 restaurants and 60 menu items.
- Uses remote Unsplash images.
- Creates or reuses the vendor, rider, and admin demo accounts.
- Assigns all seeded restaurants to the demo vendor.

Run seeding only when you want to reset restaurant and menu demo data.

## Deployment

Server:

- `server/vercel.json` targets `src/server.js` with `@vercel/node`.
- All paths are routed to the server entry point.
- `src/server.js` exports the Express app and only calls `listen` when run directly.
- Configure environment variables in the hosting dashboard.
- Use a managed MongoDB instance in production.

Mobile:

- Expo Go works for development.
- Set `EXPO_PUBLIC_API_URL` to a public HTTPS API URL before building.
- Add `eas.json` and app store credentials before store publishing.
- No native build directories are checked in.
- Web is available through Expo's web bundler.

## Security Notes

Implemented:

- Passwords are hashed with bcrypt.
- JWTs protect authenticated routes.
- Roles are enforced server-side.
- Vendors can manage only orders tied to restaurants they own.
- Helmet, CORS, and rate limiting are configured.
- Password fields are excluded from normal queries and JSON responses.
- Development-only stack traces reduce information leakage in production.

Before public release:

- Replace wildcard CORS with explicit origins.
- Enforce HTTPS everywhere.
- Add admin approval for vendor and rider registration.
- Move secrets to a managed secret store.
- Add automated tests and monitoring.
- Recompute promo discounts server-side.
- Integrate a real payment provider.

## Manual Verification Checklist

1. Start local MongoDB with `npm run mongo:dev` or configure Atlas.
2. Run `npm run seed`, then `npm run dev`.
3. Confirm `GET /api` returns API information.
4. Register or log in as a customer.
5. Browse restaurants and open a menu.
6. Add items to cart, enter an address, and place an order.
7. Log in as the seeded vendor and confirm the order appears as incoming.
8. Accept, start preparing, mark ready, and assign the seeded rider.
9. Log in as the rider, accept the delivery, pick it up, and deliver it.
10. Return to the customer app and verify tracking updates.
11. Test mobile web or Expo Go with `EXPO_PUBLIC_API_URL` set correctly.

## Troubleshooting

### Mobile cannot reach the API

- Emulator URLs differ from physical device URLs.
- Use a LAN IP or deployed URL for physical devices.
- Set `EXPO_PUBLIC_API_URL` before starting Expo.
- Confirm firewall rules and server CORS settings.

### Startup fails with missing configuration

The server requires `MONGO_URI` and `JWT_SECRET`. Create `server/.env` from the example and set real values.

### Demo restaurants do not appear

Run `npm run seed`. Verify the API is connected to the same database named in `MONGO_DB`.

### Rider location is not updating

Location sharing requires foreground permission and an active delivery. Background location is not implemented.

### Offline mode appears unexpectedly

Any network failure during login or registration can activate local demo mode. Check API availability and clear AsyncStorage if stale local data interferes.

### Seed appears to erase data

Expected behavior: seeding deletes all restaurants and menu items before recreating demo content.

## Known Limitations

- Payments are labels only; no payment gateway flow exists.
- Cart service fee is a flat `₦50`, while the API computes a 3% service fee.
- Promo `FASTAFIRST` is client-side only and is not validated server-side.
- Notifications are static local mock content.
- Forgot password, social login, schedule later, and support links are placeholders.
- No EAS build configuration is present.
- No automated test or lint scripts are configured.
- Admin mobile functionality is partial; most admin capability is API-level.
- Live tracking uses polling and foreground location posts, not WebSockets or background location.
- Vendor and rider self-registration does not require approval.

## Roadmap

- Real Paystack integration
- Server-side promo validation
- Push notifications
- EAS build and release profiles
- Admin dashboard
- Automated API and UI tests
- Background location updates
- Reviews and ratings backed by the API
- Vendor approval workflow

## Development History

The repository is organized into focused incremental commits:

1. Project foundation and ignore rules
2. Express API with models, controllers, routes, seeding, Vercel config, and environment template
3. Expo mobile application with role-specific customer, vendor, and rider flows
4. Comprehensive documentation
