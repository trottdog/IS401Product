# BYUconnect

BYUconnect is an Expo + React Native app for discovering BYU clubs and campus events. It includes:

- A mobile-first Expo app that also runs on the web
- An Express backend in the same repo
- PostgreSQL via Drizzle ORM
- SQLite fallback for local backend development
- Session-based authentication
- User profile created in the database on first login (optional name on login creates an account)
- Club, event, reservation, save, notification, and map features

## Tech Stack

- Expo SDK 54
- React Native / React Native Web
- Expo Router
- Express 5
- PostgreSQL
- SQLite
- Drizzle ORM
- TypeScript

## Project Structure

```text
app/                  Expo Router screens
components/
  cards/              Club and event cards
  layout/             Page shell and layout/error helpers
  map/                Native and web map wrappers
  ui/                 Small reusable UI primitives
lib/
  api/                Frontend API client and store helpers
  auth/               Auth context
  data/               Seed data used by backend/local setup
  theme/              Shared design tokens and colors
  ui/                 Responsive layout helpers
  types.ts            Shared frontend domain types
server/               Express server, routes, storage, templates
shared/               Shared database schema
scripts/              Build helpers
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 20+ recommended
- npm
- Either:
- a PostgreSQL database with a valid `DATABASE_URL`
- or the ability to install the SQLite dependency and run the local SQLite file backend

## Installation

```bash
npm install
```

This project uses `patch-package`, so the postinstall script will apply local patches automatically.

## Environment Variables

For Postgres:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
```

Helpful development variables:

```bash
NODE_ENV=development
EXPO_PUBLIC_DOMAIN=localhost:5000
```

Notes:

- `DATABASE_URL` is required for the backend and Drizzle.
- If `DATABASE_URL` is not set, the backend now falls back to SQLite by default.
- SQLite uses `DB_PROVIDER=sqlite` and stores data in `.local/byuconnect.sqlite` unless `SQLITE_DB_PATH` is set.
- `EXPO_PUBLIC_DOMAIN` is used by the frontend to build the backend URL.

## Running the App Locally

This repo has two parts you should run together:

1. The Express backend
2. The Expo frontend

Start the backend:

```bash
npm run server:dev
```

For an explicit SQLite-backed backend:

```bash
npm run server:sqlite:dev
```

In a second terminal, start Expo:

```bash
npm run start
```

Then open the app in whichever target you want:

- Web: press `w` in the Expo terminal
- iOS simulator: press `i`
- Android emulator: press `a`
- Physical device: scan the QR code in Expo

## Database Setup

You can use either **PostgreSQL** (for production or shared dev) or **SQLite** (easiest for local development). The schema is defined in `shared/schema.ts`.

### Option 1: SQLite (local development, no extra setup)

1. **No database server needed.** Install dependencies and set the backend to use SQLite.
2. In your `.env`, set (or leave unset to use SQLite when `DATABASE_URL` is missing):
   ```bash
   DB_PROVIDER=sqlite
   NODE_ENV=development
   EXPO_PUBLIC_DOMAIN=localhost:5000
   ```
3. Start the backend (e.g. `npm run server:sqlite:dev` or `npm run server:dev` if `DATABASE_URL` is not set).
4. On first run, the backend creates `.local/byuconnect.sqlite`, applies the schema, and seeds it automatically. No `db:push` step required.

To use a different file path, set `SQLITE_DB_PATH` in `.env`.

### Option 2: PostgreSQL

1. **Create a PostgreSQL database** (locally or on a host) and note the connection details.
2. In your `.env`, set:
   ```bash
   DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
   NODE_ENV=development
   EXPO_PUBLIC_DOMAIN=localhost:5000
   ```
3. Push the Drizzle schema to the database:
   ```bash
   npm run db:push
   ```
4. (Optional) Seed data is in `lib/data/seed-data.ts` and `server/seed.ts`. Review those files and run the seed flow that matches your environment if you want initial clubs, events, etc.

### Summary

| Setup        | Steps |
|-------------|--------|
| **SQLite**  | Set `DB_PROVIDER=sqlite` (or omit `DATABASE_URL`), then start the backend. Schema and seed are created automatically. |
| **PostgreSQL** | Set `DATABASE_URL`, run `npm run db:push`, then start the backend. Seed manually if desired. |

## Available Scripts

- `npm run start` - start Expo in development
- `npm run server:dev` - run the Express backend in development
- `npm run server:sqlite:dev` - run the Express backend with the SQLite provider
- `npm run db:push` - push the Drizzle schema to the database
- `npm run lint` - run Expo lint
- `npm run lint:fix` - run lint with autofixes
- `npm run expo:static:build` - build the Expo static output
- `npm run expo:start:static:build` - start Expo in production-like static mode
- `npm run server:build` - bundle the backend into `server_dist/`
- `npm run server:prod` - run the production backend bundle

## App Routes

Main app areas:

- `app/(tabs)/(home)/` - Discover flow, event details, club details, search, create event
- `app/(tabs)/(clubs)/` - My Clubs and club discovery
- `app/(tabs)/(profile)/` - Profile and notifications
- `app/(auth)/` - Login and registration

## Backend Overview

**Authentication:** Login (`POST /api/auth/login`) and register (`POST /api/auth/register`) set the session. On first login, if no user exists for the given email, a profile is created in the database when the request includes a name (optional name field on the login screen). Existing users sign in with email and password only.

Important backend files:

- `server/index.ts` - Express entry point
- `server/routes.ts` - REST API routes
- `server/storage.ts` - storage layer and data operations
- `server/db.ts` - database connection setup
- `server/templates/` - HTML templates for special server-rendered pages like the map

## Design Notes

- The app is now responsive for both desktop browsers and mobile devices.
- Mobile remains the primary target, so touch-first interactions and compact layouts are preserved.
- Shared responsive behavior lives in `lib/ui/responsive.ts`.
- Shared page framing and background treatment lives in `components/layout/PageShell.tsx`.

## Troubleshooting

### Expo starts but the app cannot reach the backend

Make sure:

- `npm run server:dev` is running
- `EXPO_PUBLIC_DOMAIN` points to the backend host when using web
- your backend port matches what the frontend expects

### Lint or app startup fails because packages are missing

Run:

```bash
npm install
```

### Database errors on startup

Check:

- `DATABASE_URL` is set correctly
- PostgreSQL is running
- the schema has been pushed with `npm run db:push`
