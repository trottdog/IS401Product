# BYUconnect

BYUconnect is a mobile-first app for discovering BYU clubs and campus events. It uses Expo for the frontend and Express for the backend, with SQLite as the only application database.

## Tech Stack

- Frontend: Expo SDK 54, React Native, React Native Web, Expo Router, TypeScript
- Backend: Express 5, TypeScript
- Data: SQLite with `better-sqlite3`
- Other: TanStack Query, Zod, `express-session`

## Project Structure

```text
app/                    Expo Router screens
components/             Shared UI components
lib/                    Frontend utilities, API client, seed data
server/                 Express server and SQLite storage
  index.ts              Entry point
  routes.ts             REST API routes
  storage.ts            Storage abstraction
  sqlite.ts             SQLite schema init, storage, and session store
  templates/            HTML templates
shared/                 Shared validation and schema types
scripts/                Build helpers
```

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
npm install
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_DOMAIN` | Backend host for the frontend, for example `localhost:5000` or your Beanstalk hostname |
| `SQLITE_DB_PATH` | Optional path for the SQLite file. Default: `.local/byuconnect.sqlite` |
| `CORS_ORIGIN` | Optional allowed web origin when the frontend is hosted separately |
| `SESSION_SECRET` | Optional session signing secret. Set this in deployed environments |
| `HOST` | Backend bind host. Default: `127.0.0.1` in development, `0.0.0.0` in production |
| `PORT` | Backend port. Default: `5000` |
| `NODE_ENV` | `development` or `production` |
| `TRUST_PROXY` | Optional Express trust proxy override for proxied deployments |

## Running Locally

1. Start the backend:

   ```bash
   npm run server:dev
   ```

2. Start Expo in another terminal:

   ```bash
   npm run start
   ```

3. Open the app on web or in a simulator.

   **Web + API on the same machine:** point the frontend at the backend so login and sessions work:

   ```powershell
   # PowerShell (Windows), from the project folder — then press `w` for web
   $env:EXPO_PUBLIC_DOMAIN="localhost:5000"; npm run start
   ```

The backend creates `.local/byuconnect.sqlite` on first run, initializes the schema, seeds the app data, and creates the SQLite-backed session table.

### Demo login (club admin)

Seeded data includes a user who is a **club admin** for **BYU Developers** so you can try editing that club’s profile (cover image, club avatar, and **Edit club details**).

| | |
|--|--|
| **Email** | `student@byu.edu` |
| **Password** | `password123` |

1. Log in with the credentials above.  
2. Open **BYU Developers** (club id `cl1` in seed data — browse clubs or an event from that club).  
3. On the club page you should see **Admin**, **Add event**, **Edit** on upcoming events (Activity tab), and controls to change images and edit name, description, and contact fields.

Only **club admins and presidents** can create or edit events for that club (enforced on the server).

### Clubs tab (logged in)

- **Clubs you manage** — memberships where you are **admin** or **president** (separate section).
- **My clubs** — memberships where you are a **member** only.
- **Discover** — clubs you have not joined.

### API (club / event admin)

| Method | Path | Notes |
|--------|------|--------|
| `PATCH` | `/api/clubs/:id` | Club details; club admin only |
| `PATCH` | `/api/clubs/:id/profile-image`, `/cover-image` | Club admin only |
| `POST` | `/api/events` | Club admin/president for `clubId` |
| `PATCH` | `/api/events/:id` | Edit upcoming event; club admin only |

> **Note:** This account exists after the database is created and seeded. If you already have an older SQLite file without this user, delete `.local/byuconnect.sqlite` and restart the backend to re-seed, or register a new user (that user will not be a club admin unless you add a membership with role `admin` in the DB).

## Production Notes

- Build Expo static output with `npm run expo:static:build`
- Build the backend bundle with `npm run server:build`
- Start the production server with `npm run server:prod`
- Set `NODE_ENV=production`, `SESSION_SECRET`, and `EXPO_PUBLIC_DOMAIN`
- For Elastic Beanstalk, point `SQLITE_DB_PATH` at a stable writable location such as `/var/app/current/.local/byuconnect.sqlite`

## AWS Deployment

See [docs/aws-elastic-beanstalk.md](docs/aws-elastic-beanstalk.md) for the SQLite-specific Beanstalk workflow.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start Expo in development |
| `npm run server:dev` | Run the Express backend with SQLite |
| `npm run server:sqlite:dev` | Alias for the SQLite backend |
| `npm run lint` | Run Expo lint |
| `npm run lint:fix` | Run lint with autofixes |
| `npm run expo:static:build` | Build Expo static web output |
| `npm run expo:start:static:build` | Start Expo in production-like static mode |
| `npm run server:build` | Bundle the backend into `server_dist/` |
| `npm run server:prod` | Run the bundled backend |
| `npm run postinstall` | Apply `patch-package` patches manually |

## Key Backend Files

- `server/index.ts`: Express app, sessions, static assets, route registration
- `server/routes.ts`: REST API handlers
- `server/storage.ts`: Storage abstraction bound to SQLite
- `server/sqlite.ts`: SQLite schema init, app storage, and session store
- `server/templates/`: HTML templates

## Troubleshooting

### App cannot reach the backend

- Ensure the backend is running with `npm run server:dev`
- Ensure `EXPO_PUBLIC_DOMAIN` matches the backend host and port

### Database errors

- Ensure the app can write to the directory used by `SQLITE_DB_PATH` or `.local/`

### Sign out on web

The profile **Sign out** flow uses the browser **confirm** dialog on web (React Native `Alert` with multiple buttons is unreliable on web). You are still signed out locally if the logout request fails.

### Windows

The backend scripts are cross-platform. You can run `npm run server:dev` directly from PowerShell or Command Prompt.
