# Project Guidelines

## Scope And Source Of Truth

- This workspace is a monorepo with two apps: incident-api (backend) and incident-dashboard (frontend).
- Use these docs as primary references and link to them instead of duplicating content:
  - README.md
  - incident-api/README.md
  - incident-dashboard/README.md

## Build And Run

- Root has no scripts. Run commands inside each app folder.
- Backend (incident-api):
  - pnpm install
  - pnpm dev
  - pnpm build
  - pnpm start
- Frontend (incident-dashboard):
  - pnpm install
  - pnpm dev
  - pnpm build
  - pnpm lint
  - pnpm preview
- Tests are not configured yet in this repository. Do not invent test commands.

## Architecture

- Backend exposes REST endpoints under /api.
  - Incidents: /api/incidents
  - Chat: /api/chat
  - Health: /health
- Backend follows modular boundaries:
  - modules/\* for domain features
  - controller -> service -> model flow
  - middleware for logging, validation, error handling
  - utils/responses.ts for consistent API envelopes
- Frontend uses feature-based structure under src/features.
  - Keep domain logic in feature folders (components, hooks, services, types, utils).
  - Keep shared UI in src/components/ui and layout in src/components/layout.

## Project Conventions

- Keep TypeScript strictness intact. Avoid any and preserve existing type contracts.
- Frontend imports can use alias @/_ mapped to src/_.
- Styling uses SCSS Modules for components; follow existing colocated \*.module.scss pattern.
- Backend responses should stay consistent with success/error envelope helpers from incident-api/src/utils/responses.ts.
- Prefer thin controllers and business logic in services in backend modules.

## Environment And Pitfalls

- Backend requires incident-api/.env values before starting, especially MONGODB_URI.
- Chat endpoint (/api/chat/query) requires LLM_API_KEY (and related LLM envs when applicable).
- Backend CORS is currently configured for http://localhost:5173.
- Frontend service base URLs append feature paths (/incidents, /chat), so VITE_API_URL should include /api (example: http://localhost:3000/api).
- Backend default port is 3000 and frontend default dev port is 5173.

## Change Guidance For Agents

- Keep edits minimal and localized; do not refactor unrelated areas.
- Preserve public API contracts used across frontend and backend.
- When changing backend endpoints or payload shapes, update frontend services/types in the same task.
- Preserve HTTP semantics already used by controllers (including 201 on create and 204 on delete).
- Reuse existing patterns before introducing new abstractions.
