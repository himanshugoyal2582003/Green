# Green Second Life Marketplace

Green is a campus-focused secondhand marketplace for books, calculators, cycles, and other student essentials. Buyers can browse, save, chat about, and purchase listings; sellers can publish items with suggested pricing; administrators can review marketplace activity.

## Project layout

- [`backend/`](backend/README.md) — Express API, MongoDB models, authentication, listings, chats, payments, and integrations.
- [`frontend/`](frontend/README.md) — Next.js App Router application.
- [`render.yaml`](render.yaml) — Render web-service configuration for the backend.

Each source directory has its own README describing its responsibilities.

## Requirements

- Node.js compatible with the installed Next.js and Express dependencies.
- MongoDB (local or Atlas).
- Optional service credentials for Cloudinary image storage, Stripe checkout, Gemini price lookup, and the Telegram bot.

## Run locally

1. Configure [`backend/.env.example`](backend/.env.example) as `backend/.env`. At minimum, set `MONGODB_URI` and a private `JWT_SECRET` of at least 32 characters.
2. Configure [`frontend/.env.example`](frontend/.env.example) as `frontend/.env.local`. The default backend URL is `http://localhost:3001`.
3. In one terminal:

   ```sh
   cd backend
   npm install
   npm start
   ```

4. In another terminal:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`. The API health endpoint is `http://localhost:3001/api/health`.

The backend seeds historical price records and sample listings when the corresponding collections are empty. Sample listings are for demonstration; configure real credentials before using payment or external integrations.

## Checks

From `frontend/`, run `npm run lint` and `npm run build`. The backend currently defines `npm start` and `npm run dev` as server-start commands; it has no test script.

## Security

Never commit `.env` or `.env.local` files or publish their values. Use a unique random JWT secret and keep admin invite and third-party API keys private. See the backend and frontend guides for configuration details.
