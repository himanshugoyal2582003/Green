# Request middleware

Shared Express middleware is defined here:

- `auth.middleware.js` verifies bearer tokens and enforces role access.
- `imageUpload.middleware.js` validates and handles multipart image uploads.
- `error.middleware.js` returns not-found and centralized error responses.

Routes compose these functions around controller handlers.
