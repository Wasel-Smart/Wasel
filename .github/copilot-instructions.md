# Copilot Instructions for Wasel

## Project Overview
- **Wasel** is a full-stack, production-ready ride-sharing platform for the Middle East, built with React, TypeScript, Vite, Supabase, and a modular backend.
- The codebase is organized by clear service boundaries: `src/services/` (API logic), `src/backend/` (server, integrations), and `src/smart-route/` (AI/ML orchestration).

## Architecture & Key Patterns
- **API Layer:** All client-server communication is centralized in `src/services/api.ts`. This file handles authentication, trips, bookings, messaging, wallet, notifications, and referrals. Always use the provided API helpers for network calls.
- **Backend Services:** Business logic and integrations (Twilio, Stripe, Google Maps, WebSocket, Supabase Auth) are implemented in `src/backend/`. Start the backend with `npm run dev:simple` or `START_SERVER.bat` (Windows).
- **Smart Route:** The `src/smart-route/` directory contains autonomous ML/AI logic for predictive trip matching, route suggestions, and continuous learning.
- **Validation & Security:** All user input is sanitized and validated before API calls. Rate limiting and centralized error handling are enforced in `api.ts`.
- **Supabase:** Used for authentication, session, and data storage. API URLs and keys are set via environment variables.
- **Styling:** Tailwind CSS and Radix UI are used for UI components.

## Developer Workflows
- **Setup:**
  - `npm run setup` to initialize the project.
  - Configure `.env` with Supabase credentials.
- **Frontend:**
  - `npm run dev` to start the frontend (Vite, React).
  - Visit `http://localhost:3000`.
- **Backend:**
  - `cd src/backend && npm install && npm run dev:simple` or use `START_SERVER.bat`.
  - Backend runs on `http://localhost:3002`.
- **Testing:**
  - Use `npm test` or `vitest` for unit/integration tests. Coverage reports are in `/coverage`.
- **Deployment:**
  - Netlify (`netlify.toml`) and Vercel (`vercel.json`) supported. Configure environment variables for production.

## Project Conventions
- **Always use API helpers** in `src/services/api.ts` for network logic.
- **Validate and sanitize** all user input before processing.
- **Use environment variables** for all secrets and endpoints.
- **Follow modular structure:** Place new features in the appropriate service or backend directory.
- **Document new endpoints** and workflows in the relevant `README.md`.

## References
- Main: `README.md`
- Backend: `src/backend/README.md`
- Smart Route/AI: `src/smart-route/README.md`

---
For new patterns or integrations, check for existing helpers and follow the established modular, validated, and secure approach.
