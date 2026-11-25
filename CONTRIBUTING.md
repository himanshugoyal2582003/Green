# Contributing to Green Second Life

Thank you for your interest in contributing! We welcome bug reports, feature suggestions, documentation improvements, and pull requests.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Green.git
   cd Green
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Install dependencies** in both `backend/` and `frontend/` and configure your local `.env` / `.env.local` files from the `.env.example` templates.

---

## Development Guidelines

- **Never commit secrets**: Do not commit `.env`, `.env.local`, API keys, or `node_modules/`.
- **Keep components modular**: Place reusable UI components in `frontend/components/`, custom hooks in `frontend/hooks/`, and shared helpers in `frontend/lib/`.
- **Backend conventions**: Keep routes thin (`backend/routes/`), business logic in `backend/controllers/`, and Mongoose schemas in `backend/models/`.
- **Verify before pushing**:
  - Backend: Ensure `node server.js` starts cleanly.
  - Frontend: Run `npm run lint` and `npm run build` in `frontend/`.

---

## Submitting a Pull Request

1. Commit your changes with clear, descriptive messages (e.g. `feat: add condition filter to explore page` or `fix: handle expired stripe session`).
2. Push your branch to your fork and open a Pull Request against `main`.
3. Describe what changed, why, and include screenshots for UI updates.
