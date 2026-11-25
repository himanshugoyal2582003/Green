# API controllers

Controllers implement the HTTP request handlers used by the route modules:

- `auth.controller.js` — signup, login, current-user lookup, and profile image updates.
- `listing.controller.js` — marketplace queries, listing creation, and price suggestions.
- `admin.controller.js` — administrative summaries and account/listing views.
- `chat.controller.js` — buyer/seller messages and request decisions.
- `payment.controller.js` — checkout, payment verification, and purchase history.

Route definitions and access middleware live in sibling directories [`routes/`](../routes/README.md) and [`middleware/`](../middleware/README.md).
