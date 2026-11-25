# Green Marketplace Frontend

Next.js App Router UI for the campus secondhand marketplace. It supports marketplace browsing, listing details, seller listing creation, and buyer, seller, and admin dashboards.

## Run locally

Install dependencies and start the development server from this directory:

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. Configure `.env.local` from [`.env.example`](.env.example) when using a non-default backend. `BACKEND_URL` controls the Next.js `/api/*` rewrite and defaults to `http://localhost:3001`. `NEXT_PUBLIC_API_URL` optionally sets a direct API base URL for browser requests.

Production commands:

```sh
npm run build
npm start
```

Run `npm run lint` to check the frontend.

## Application structure

- [`app/`](app/README.md) — routes, shared layout, and styles.
- [`components/`](components/README.md) — reusable UI and authentication context.
- [`hooks/`](hooks/README.md) — client-side data and saved-item hooks.
- [`lib/`](lib/README.md) — API client and shared formatting/constants.

Netlify build configuration is in [`netlify.toml`](netlify.toml). The API itself is deployed separately; see the [backend guide](../backend/README.md). Never commit `.env.local` or expose private API keys in `NEXT_PUBLIC_*` variables.
