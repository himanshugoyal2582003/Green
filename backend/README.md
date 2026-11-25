# Green Marketplace API

Express 5 and MongoDB API for the Green campus marketplace. The API listens on port `3001` by default; the Next.js frontend runs separately and proxies `/api/*` requests to it during local development.

## Setup

From this directory:

```sh
npm install
npm start
```

Create `backend/.env` using [`.env.example`](.env.example). `MONGODB_URI` and `JWT_SECRET` are required; the JWT secret must be at least 32 characters. `PORT` defaults to `3001`. MongoDB URI aliases `MONGO_URI` and `MONGO_URL` are also accepted.

| Variable | Purpose |
| --- | --- |
| `PORT` | API listening port; defaults to `3001`. |
| `MONGODB_URI` | MongoDB connection string (local or Atlas). |
| `JWT_SECRET` | Private signing secret for seven-day bearer tokens. |
| `ADMIN_SIGNUP_KEY` | Invite key required when creating an admin account. |
| `CLOUDINARY_URL` or `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary image uploads. |
| `STRIPE_SECRET_KEY` | Stripe checkout and purchase verification. |
| `GEMINI_API_KEY` | Optional external price lookup; local pricing is also available. |
| `TELEGRAM_BOT_TOKEN` | Optional Telegram bot integration. |
| `FRONTEND_URL` | Frontend origin used for payment redirect links and bot links. |

The API connects to MongoDB, seeds historical price records and sample listings if their collections are empty, starts the Telegram bot when configured, and then listens for requests. Health check: `GET /api/health`.

## API routes

All routes are prefixed with `/api`.

| Prefix | Main endpoints | Access |
| --- | --- | --- |
| `/auth` | `POST /signup`, `POST /login`, `GET /me`, `PATCH /profile-image` | Signup/login are public and rate-limited; profile endpoints require a bearer token. Admin signup requires the invite key. |
| `/listings` | `GET /`, `GET /stats`, `POST /suggest`, `POST /ai-price`, `GET /mine`, `POST /` | Browsing and suggestions are public; listing management requires seller or admin. |
| `/admin` | `GET /overview`, `GET /users`, `GET /listings` | Admin only. |
| `/payments` | `POST /checkout`, `POST /verify`, `GET /purchases` | Authenticated users; checkout also requires Stripe configuration. |
| `/chats` | `GET /mine`, `GET /listing/:listingId`, `POST /listing/:listingId/message`, `PATCH /:chatId/decision` | Authenticated users. |

Listing photos use the multipart field `images` (up to six files); profile photos use `image`. Passwords are stored as bcrypt hashes.

## Backend folders

- [`bot/`](bot/README.md) — Telegram bot.
- [`config/`](config/README.md) — database and Cloudinary setup.
- [`controllers/`](controllers/README.md) — request handling and business operations.
- [`middleware/`](middleware/README.md) — authentication, upload, and error handling.
- [`models/`](models/README.md) — Mongoose schemas.
- [`routes/`](routes/README.md) — API route registration.
- [`utils/`](utils/README.md) — pricing, seeding, and service helpers.

Do not commit `.env` or share secret values.
