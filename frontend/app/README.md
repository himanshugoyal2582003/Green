# App Router

This directory contains Next.js routes and the shared application shell. `layout.jsx` loads the global stylesheet and wraps pages in the authentication/application context. `page.jsx` is the marketplace landing page; `loading.jsx`, `error.jsx`, and `not-found.jsx` provide route-level loading and error states.

Route folders:

- [`dashboard/`](dashboard/README.md) — role-specific account dashboards.
- [`explore/`](explore/README.md) — marketplace search and filters.
- [`listings/`](listings/README.md) — listing detail routes.
- [`sell/`](sell/README.md) — create a listing.
- [`wanted/`](wanted/README.md) — local wanted-request board.

`globals.css`, `auth.css`, and `marketplace.css` provide shared styles.
