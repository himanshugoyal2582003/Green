# MongoDB models

Mongoose schemas define the persisted marketplace data:

- `User.js` — buyer, seller, and administrator accounts.
- `Listing.js` — items offered in the marketplace.
- `ChatRequest.js` — buyer/seller conversations and purchase requests.
- `SaleHistory.js` — historical records used by pricing suggestions.

Keep schema changes compatible with their controller and utility consumers.
