# Agents Guide

This file provides practical guidance for coding agents working in this repository.

## Project Snapshot

- App: Expo Router + React Native (mobile and web)
- Backend: Express + TypeScript in `server/`
- Data: Drizzle ORM with PostgreSQL or SQLite
- Shared schema: `shared/schema.ts`

## Common Commands

- Install dependencies: `npm install`
- Start Expo dev server: `npm run start`
- Start backend (default provider selection): `npm run server:dev`
- Start backend with SQLite: `npm run server:sqlite:dev`
- Push schema changes: `npm run db:push`
- Lint: `npm run lint`
- Build static Expo output: `npm run expo:static:build`
- Build backend bundle: `npm run server:build`
- Run production backend bundle: `npm run server:prod`

## Windows Notes

The `server:dev` and `server:sqlite:dev` npm scripts use Unix-style environment variable syntax and can fail in PowerShell/CMD.

Use one of these commands in PowerShell instead:

- Default backend mode:
  - `$env:NODE_ENV="development"; node --import tsx server/index.ts`
- SQLite mode:
  - `$env:DB_PROVIDER="sqlite"; $env:NODE_ENV="development"; node --import tsx server/index.ts`

## Key Runtime Files

- Backend entry: `server/index.ts`
- API routes: `server/routes.ts`
- Data layer: `server/storage.ts`
- DB provider setup: `server/db.ts` and `server/sqlite.ts`
- App routes: `app/`
- Auth flow: `lib/auth/auth-context.tsx`
- Frontend API access: `lib/api/store.ts`

## Agent Editing Rules

- Prefer minimal, targeted edits.
- Do not change public behavior unless requested.
- Keep TypeScript types intact and avoid `any` where possible.
- Update docs when behavior, commands, or environment variables change.
- If adding routes or scripts, also update `README.md`.
