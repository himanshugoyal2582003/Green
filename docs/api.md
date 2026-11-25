# REST API Reference

Base URL (local): `http://localhost:3001/api`  
Base URL (production): `https://green-z5xs.onrender.com/api`

Protected endpoints require an `Authorization: Bearer <jwt_token>` header.

---

## Health

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Returns `{ ok: true, database: "connected" }` |

---

## Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register as `buyer`, `seller`, or `admin` (requires `adminKey` for admin). |
| `POST` | `/api/auth/login` | Public | Authenticate with `email` and `password`; returns `{ token, user }`. |
| `GET` | `/api/auth/me` | Bearer | Returns the authenticated user's profile. |
| `PATCH` | `/api/auth/profile-image` | Bearer | Upload/update profile photo (`multipart/form-data`, field `image`). |

---

## Listings & AI Pricing (`/api/listings`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/listings` | Public | Filter listings by `q`, `category`, `condition`, `minPrice`, `maxPrice`, `status`. |
| `GET` | `/api/listings/stats` | Public | Returns historical sale count, active listing count, and categories. |
| `POST` | `/api/listings/suggest` | Public | Computes fair price & range from `category`, `condition`, `age`, `originalPrice`. |
| `POST` | `/api/listings/ai-price` | Public | Queries Gemini AI for real-world retail price (`INR`) and applies depreciation index. |
| `GET` | `/api/listings/mine` | Seller / Admin | Lists all items posted by the authenticated user. |
| `POST` | `/api/listings` | Seller / Admin | Creates a listing (`multipart/form-data`, up to 6 images in `images`). |

---

## Buyer–Seller Chat & Approval (`/api/chats`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chats/mine` | Bearer | Returns all chat threads where user is buyer or seller. |
| `GET` | `/api/chats/listing/:listingId` | Bearer | Returns buyer's thread (or all buyer threads if seller). |
| `POST` | `/api/chats/listing/:listingId/message` | Bearer | Buyer initiates/sends message; seller replies (`buyerId` in body). |
| `PATCH` | `/api/chats/:chatId/decision` | Seller | Approve or reject a buyer's purchase request (`{ decision: "approved" \| "rejected" }`). |

---

## Payments (`/api/payments`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/checkout` | Bearer | Creates a Stripe Checkout Session (`inr`). Requires `approved` chat request. |
| `POST` | `/api/payments/verify` | Bearer | Verifies Stripe `sessionId` and marks listing `sold`. |
| `GET` | `/api/payments/purchases` | Bearer | Returns all listings purchased by the authenticated user. |

---

## Admin (`/api/admin`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Admin | User counts by role, listing count, and historical sales count. |
| `GET` | `/api/admin/users` | Admin | Lists registered users (excluding demo seed account). |
| `GET` | `/api/admin/listings` | Admin | Lists all marketplace listings with owner details. |
