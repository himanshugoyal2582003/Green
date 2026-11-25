# Deployment Guide

Green Second Life is designed to deploy the **Backend on Render** and the **Frontend on Netlify**.

---

## 1. Backend Deployment (Render)

1. Push your repository to GitHub.
2. In Render, click **New → Blueprint** (uses [render.yaml](../render.yaml)) or **New → Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
3. Add the required Environment Variables in Render:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — Random secret (at least 32 characters)
   - `ADMIN_SIGNUP_KEY` — Secret key required to register admin accounts
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `STRIPE_SECRET_KEY` — Stripe secret key (`sk_test_...` or `sk_live_...`)
   - `GEMINI_API_KEY` — Google Gemini API key
   - `TELEGRAM_BOT_TOKEN` — Telegram BotFather token (optional; enables `@GreenSecondSellerBot`)
   - `FRONTEND_URL` — Your live Netlify URL (used for Stripe Checkout redirect URLs)

---

## 2. Frontend Deployment (Netlify)

1. In Netlify, click **Add new site → Import an existing project** and connect your GitHub repo.
2. Configure build settings (auto-detected from [netlify.toml](../frontend/netlify.toml)):
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
3. Add Environment Variables in Netlify:
   - `BACKEND_URL` = `https://your-render-service.onrender.com` (e.g., `https://green-z5xs.onrender.com`)
4. Deploy! Next.js rewrites in [next.config.js](../frontend/next.config.js) proxy `/api/*` requests to your Render backend automatically.
