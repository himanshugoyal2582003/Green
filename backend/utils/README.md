# Backend utilities

Reusable backend services and startup data helpers:

- `pricing.js` calculates suggested prices and generates historical sale data.
- `geminiPrice.js` provides optional Gemini-backed price lookup.
- `cloudinaryUpload.js` uploads images to Cloudinary.
- `seed.js` inserts initial historical records and sample listings when collections are empty.

These utilities are consumed by controllers or the server startup sequence.
