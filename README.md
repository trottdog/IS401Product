# BYUconnect

[![Repository](https://img.shields.io/badge/repo-GitHub-blue)](https://github.com/trottdog/IS401Product)

BYUconnect is a mobile-first app for discovering BYU clubs and campus events. It is built with Expo (React Native) and an Express backend in the same repository. Key capabilities include browsing events and clubs on a map or list, saving and reserving events, creating events (when authenticated), session-based auth, and notifications—all with a responsive experience on mobile and web.

## Features

- **Discover events** – Map and list views of upcoming campus events, sorted by date and time
- **Clubs** – Browse clubs by category, view club profiles, join/leave, and see upcoming events
- **Map** – Building pins with event counts; tap to see events at a location
- **Save and reserve events** – Save events for later and reserve spots (when capacity is limited)
- **Create events** – Authenticated users can create events (with optional cover image)
- **Auth** – Login and register; session-based; profile created on first login
- **Notifications** – In-app notifications (profile tab)
- **Responsive** – Mobile-first with desktop-friendly layouts (same codebase)

## Tech Stack

- **Frontend:** Expo SDK 54, React Native / React Native Web, Expo Router, TypeScript
- **Backend:** Express 5, TypeScript
- **Data:** Drizzle ORM, PostgreSQL or SQLite
- **Other:** TanStack Query (React Query), Zod (validation), express-session (session auth)

## Project Structure

```text
app/                    Expo Router screens (tabs: home, clubs, profile; auth)
  (tabs)/(home)/        Discover, event detail, club detail, search, create-event
  (tabs)/(clubs)/       Clubs list and discovery
  (tabs)/(profile)/    Profile, saved/reserved events, notifications
  (auth)/               Login, register
components/
  cards/                Club and event cards
  layout/               PageShell, error and layout helpers
  map/                  Native and web map wrappers
  ui/                   SegmentedControl and other small UI primitives
lib/
  api/                  Frontend API client (store), query client
  auth/                 Auth context
  data/                 Seed data used by backend
  theme/                Colors and design tokens
  ui/                   Responsive layout helpers
  utils/                Shared helpers (e.g. event sorting)
  types.ts              Shared frontend domain types
server/                 Express server
  index.ts              Entry point
  routes.ts             REST API routes
  storage.ts            Data operations
  db.ts                 DB connection
  sqlite.ts             SQLite provider
  seed.ts               Seed script
  templates/            HTML templates (map, landing)
shared/                 Shared DB schema (Drizzle)
scripts/                Build helpers
```

## Prerequisites

- **Node.js** 20+ (recommended)
- **npm**
- **Database:** PostgreSQL (for production or shared dev) or SQLite (for local dev; no server required)

## Installation

```bash
npm install
```

This project uses `patch-package`; the postinstall script applies patches automatically.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgres://USER:PASSWORD@HOST:PORT/DB_NAME`). Omit to use SQLite. |
| `EXPO_PUBLIC_DOMAIN` | Backend host for the frontend (e.g. `localhost:5000`). |
| `DB_PROVIDER` | Set to `sqlite` to force SQLite when you have no `DATABASE_URL`. |
| `SQLITE_DB_PATH` | Optional path for SQLite file (default: `.local/byuconnect.sqlite`). |
| `NODE_ENV` | `development` or `production`. |

## Running Locally

1. **Start the backend** (in one terminal):

   ```bash
   npm run server:dev
   ```

   For SQLite-backed backend:

   ```bash
   npm run server:sqlite:dev
   ```

2. **Start Expo** (in a second terminal):

   ```bash
   npm run start
   ```

3. **Open the app:**
   - **Web:** press `w` in the Expo terminal
   - **iOS:** press `i` (simulator)
   - **Android:** press `a` (emulator)

   **Note:** Do not use the QR code to open the app on a physical device. The app is not configured for multiple devices (e.g. the backend is set up for a single machine), so use web or a simulator/emulator on the same computer instead.

**Production deployment**
Running locally on local machines.

## Database Setup

Schema is defined in `shared/schema.ts`.

### Option 1: SQLite (easiest for local)

1. No database server needed. Set in `.env` (or leave `DATABASE_URL` unset):

   ```bash
   DB_PROVIDER=sqlite
   NODE_ENV=development
   EXPO_PUBLIC_DOMAIN=localhost:5000
   ```

2. Start the backend (`npm run server:sqlite:dev` or `npm run server:dev`). On first run it creates `.local/byuconnect.sqlite`, applies the schema, and seeds.

Optional: set `SQLITE_DB_PATH` for a different file path.

### Option 2: PostgreSQL

1. Create a PostgreSQL database and set in `.env`:

   ```bash
   DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
   NODE_ENV=development
   EXPO_PUBLIC_DOMAIN=localhost:5000
   ```

2. Push the schema:

   ```bash
   npm run db:push
   ```

3. Optionally seed: see `lib/data/seed-data.ts` and `server/seed.ts`.

| Setup | Steps |
|-------|--------|
| **SQLite** | Set `DB_PROVIDER=sqlite` or omit `DATABASE_URL`, then start the backend. |
| **PostgreSQL** | Set `DATABASE_URL`, run `npm run db:push`, then start the backend. |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start Expo in development |
| `npm run server:dev` | Run Express backend (uses `DATABASE_URL` or SQLite fallback) |
| `npm run server:sqlite:dev` | Run Express backend with SQLite |
| `npm run db:push` | Push Drizzle schema to the database |
| `npm run lint` | Run Expo lint |
| `npm run lint:fix` | Lint with autofixes |
| `npm run expo:static:build` | Build Expo static output (e.g. for web deploy) |
| `npm run expo:start:static:build` | Start Expo in production-like static mode |
| `npm run server:build` | Bundle backend into `server_dist/` |
| `npm run server:prod` | Run the production backend bundle |

## App Routes

- **Home (Discover):** `(tabs)/(home)` – map/list of events, event detail, club detail, search, create event
- **Clubs:** `(tabs)/(clubs)` – clubs list and discovery
- **Profile:** `(tabs)/(profile)` – profile, saved events, reservations, notifications
- **Auth:** `(auth)` – login, register

## Backend API Summary

Base URL: use `EXPO_PUBLIC_DOMAIN` (e.g. `http://localhost:5000`). All JSON where applicable.

| Group | Method | Path | Notes |
|-------|--------|------|--------|
| **Auth** | POST | `/api/auth/register` | Register (optional name creates profile) |
| | POST | `/api/auth/login` | Login, sets session |
| | GET | `/api/auth/me` | Current user |
| | POST | `/api/auth/logout` | Logout |
| **Buildings** | GET | `/api/buildings` | List buildings |
| **Categories** | GET | `/api/categories` | List categories |
| **Clubs** | GET | `/api/clubs` | List clubs |
| | GET | `/api/clubs/:id` | Club by id |
| | POST | `/api/clubs` | Create club (auth) |
| | PATCH | `/api/clubs/:id/profile-image` | Update club profile image (auth) |
| | PATCH | `/api/clubs/:id/cover-image` | Update club cover image (auth) |
| **Events** | GET | `/api/events` | List events |
| | GET | `/api/events/:id` | Event by id |
| | POST | `/api/events` | Create event (auth) |
| | PATCH | `/api/events/:id/cover-image` | Update event cover image (auth) |
| **Memberships** | GET | `/api/memberships` | Current user’s memberships (auth) |
| | POST | `/api/memberships` | Join club (auth) |
| | DELETE | `/api/memberships/:clubId` | Leave club (auth) |
| **Saves** | GET | `/api/saves` | Current user’s saved events (auth) |
| | POST | `/api/saves` | Save event (auth) |
| | DELETE | `/api/saves/:eventId` | Unsave event (auth) |
| **Reservations** | GET | `/api/reservations` | Current user’s reservations (auth) |
| | POST | `/api/reservations` | Reserve event (auth) |
| | DELETE | `/api/reservations/:eventId` | Cancel reservation (auth) |
| **Announcements** | GET | `/api/announcements` | By club (query: clubId) |
| | POST | `/api/announcements` | Create (auth) |
| **Notifications** | GET | `/api/notifications` | Current user’s notifications (auth) |
| | PATCH | `/api/notifications/:id/read` | Mark read (auth) |
| **Map** | GET | `/api/map` | Map-related data / template |

## Key Backend Files

- `server/index.ts` – Express app, session, static assets, route registration
- `server/routes.ts` – All REST API route handlers
- `server/storage.ts` – Data access layer
- `server/db.ts` – Database connection (Postgres)
- `server/sqlite.ts` – SQLite provider
- `server/seed.ts` – Seeding logic
- `server/templates/` – HTML templates (e.g. map)

## Design / UX

- **Responsive:** `lib/ui/responsive.ts` for breakpoints and layout (mobile vs desktop).
- **PageShell:** `components/layout/PageShell.tsx` for consistent page framing and background.
- **Mobile-first:** Touch-first interactions and compact layouts; desktop gets expanded layouts where applicable.

## Troubleshooting

### App cannot reach the backend

- Ensure the backend is running (`npm run server:dev` or `npm run server:sqlite:dev`).
- For web, ensure `EXPO_PUBLIC_DOMAIN` matches the backend host and port.

### Lint or install failures

Run:

```bash
npm install
```

### Database errors

- **PostgreSQL:** Check `DATABASE_URL`, that Postgres is running, and that you ran `npm run db:push`.
- **SQLite:** Ensure the app has write access to the directory used for `SQLITE_DB_PATH` (or `.local/`).

## Contributing

This project is developed by Teams 5 and 8 of section 3 of the BYU IS Jr. Core for the Winter 2026 semester.(e.g. repo URL: https://github.com/trottdog/IS401Product, team/course info).

## Note for Windows users

The npm scripts `server:dev` and `server:sqlite:dev` set environment variables using Unix-style syntax (`VAR=value command`). **PowerShell and Windows Command Prompt do not support this**, so running `npm run server:dev` or `npm run server:sqlite:dev` on Windows will fail with errors like `'NODE_ENV' is not recognized as an internal or external command`.

**Workaround:** Start the backend from PowerShell by setting the environment variables first, then running Node:

- **Default backend** (PostgreSQL if `DATABASE_URL` is set, otherwise SQLite):
  ```powershell
  $env:NODE_ENV="development"; node --import tsx server/index.ts
  ```
- **SQLite-only backend:**
  ```powershell
  $env:DB_PROVIDER="sqlite"; $env:NODE_ENV="development"; node --import tsx server/index.ts
  ```

Alternatively, the project can be updated to use a cross-platform package (e.g. `cross-env`) so that the same `npm run` scripts work on Windows; the instructions above are the manual workaround until then.

