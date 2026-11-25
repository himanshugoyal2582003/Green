# Frontend libraries

Shared non-UI helpers live here. `api.js` wraps `fetch`, attaches the saved bearer token, and can prefix requests with `NEXT_PUBLIC_API_URL`. `utils.js` contains marketplace constants and common formatting helpers. Keep browser-only behavior guarded so these modules remain safe to import from Next.js code.
