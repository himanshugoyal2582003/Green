# Green Marketplace API

## Setup

Create `backend/.env` with these values:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/green_marketplace
JWT_SECRET=use-a-private-random-secret-at-least-32-characters-long
ADMIN_SIGNUP_KEY=use-a-private-admin-invite-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

For MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string. The app also accepts `MONGO_URI` or `MONGO_URL`.
Cloudinary also accepts the `CLOUDINARY_URL` format from its console instead of the three separate Cloudinary values.

Install and start from the `backend` folder:

```bash
npm install
npm start
```

The Express server serves the frontend at `http://localhost:3000`. On first startup it creates 200 fictional sale records and sample listings in MongoDB.

## Roles and endpoints

- `POST /api/auth/signup` — create a buyer, seller, or admin account. Admin signup requires `ADMIN_SIGNUP_KEY`.
- `POST /api/auth/login` — sign in and receive a seven day bearer token.
- `GET /api/auth/me` — current account.
- `GET /api/listings` — public marketplace search and filters.
- `POST /api/listings` — seller or admin only; creates a listing and price suggestion.
- Listing creation accepts an `images` multipart field with up to six JPG, PNG, WebP, or AVIF photos, maximum 5 MB each.
- `GET /api/listings/mine` — seller or admin's listings.
- `POST /api/listings/suggest` — price suggestion from the seeded sale data.
- `PATCH /api/auth/profile-image` — signed-in user profile photo upload (`image` multipart field).
- `GET /api/admin/overview`, `/users`, `/listings` — admin only.

Passwords are bcrypt hashed. Do not commit `.env` or share its values.
