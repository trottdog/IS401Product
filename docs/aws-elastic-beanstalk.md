# AWS Elastic Beanstalk Deployment Guide

This guide deploys the BYUconnect web app and Express API to AWS Elastic Beanstalk using SQLite.

Important: Elastic Beanstalk can host the Express server and the Expo web build. It does not publish native iOS or Android apps.

## What Gets Deployed

- The Express server in `server/`
- The static Expo web output from `static-build/`
- The shared API and session-based auth running from the same host
- One SQLite database file used for both app data and sessions

## Recommended AWS Architecture

- One Elastic Beanstalk Node.js environment for the app
- One instance environment for the simplest SQLite deployment
- Application Load Balancer with HTTPS if desired

SQLite is acceptable here because this is a small school project and not a production system. The tradeoff is that the database lives on the instance filesystem, so replacing the instance also replaces the data.

## Repo-Specific Constraints

1. The production server process is `npm run server:prod`.
2. The root `start` script is for Expo development, not production.
3. The static Expo build requires `EXPO_PUBLIC_DOMAIN` during deployment.
4. Sessions are stored in SQLite, not in memory, so deployed logins survive process restarts on the same instance.

## Prerequisites

- An AWS account
- A Beanstalk application and environment, or permission to create them
- Node.js 20 selected for the Beanstalk platform
- Optional: the EB CLI installed locally

## Environment Variables

Set these in the Elastic Beanstalk environment configuration:

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | Set to `production` |
| `SESSION_SECRET` | Yes | Long random secret for signed sessions |
| `EXPO_PUBLIC_DOMAIN` | Yes | Public hostname for the deployed app |
| `SQLITE_DB_PATH` | Recommended | Set to `/var/app/current/.local/byuconnect.sqlite` |
| `PORT` | No | Beanstalk usually injects this automatically |
| `HOST` | No | Leave unset unless needed |
| `CORS_ORIGIN` | No | Only needed if the frontend is hosted on a different origin |
| `TRUST_PROXY` | No | Leave unset unless you need to override proxy behavior |

Important: `EXPO_PUBLIC_DOMAIN` is used while building the Expo static assets. If the hostname changes, update it and redeploy.

## Prepare the App

No separate database provisioning step is required. On first start the app will:

1. Create the SQLite database file if it does not exist
2. Create the application tables
3. Create the `sessions` table
4. Seed the initial BYUconnect data

## Beanstalk Runtime Files Included In This Repo

### 1. Procfile

The repository includes a root `Procfile`:

```text
web: npm run server:prod
```

### 2. Build Hook

The repository includes `.platform/hooks/prebuild/01_build_app.sh`:

```bash
#!/bin/bash
set -euo pipefail

npm run server:build
npm run expo:static:build
```

This builds the backend bundle and the Expo static output on the instance before the app starts.

### 3. Optional `.ebignore`

If you use the EB CLI, keep local artifacts out of the upload:

```text
.expo/
deploy-bundle/
.git/
.local/
node_modules/
static-build/
server_dist/
```

## Create the Beanstalk Environment

### Option A: AWS Console

1. Create a new Elastic Beanstalk application.
2. Choose the Node.js 20 platform.
3. For the simplest SQLite deployment, choose a single-instance environment.
4. Configure the environment variables listed above.
5. Deploy the application source bundle from this repository.

### Option B: EB CLI

Example flow:

```bash
eb init
eb create byuconnect-demo
eb setenv NODE_ENV=production SESSION_SECRET="replace-me" EXPO_PUBLIC_DOMAIN="your-env.us-west-2.elasticbeanstalk.com" SQLITE_DB_PATH="/var/app/current/.local/byuconnect.sqlite"
eb deploy
```

## Deployment Flow

For each deploy, Beanstalk should:

1. Install dependencies with `npm install`
2. Run `.platform/hooks/prebuild/01_build_app.sh`
3. Start the app with the `Procfile` command
4. Serve the web app and API from the same Node process

## Health Check and Verification

After deployment:

1. Open the environment URL in a browser.
2. Confirm the landing page loads.
3. Confirm event and club data load.
4. Test login and registration.
5. Restart the app process and confirm the session still works on the same instance.

Good health check targets:

- `/`
- `/api/buildings`

## HTTPS and Custom Domain

For HTTPS:

1. Request or import an ACM certificate.
2. Attach it to the load balancer listener.
3. Point Route 53 at the environment.
4. Update `EXPO_PUBLIC_DOMAIN` to the final hostname.
5. Redeploy.

## Updating the App

For future releases:

1. Push your code changes.
2. Run `eb deploy` or upload a new application version in the console.
3. If the hostname changed, update `EXPO_PUBLIC_DOMAIN` before deploying.
4. If you need to preserve existing SQLite data, deploy in place without replacing the instance.

## Troubleshooting

### Build fails with "No deployment domain found"

Set `EXPO_PUBLIC_DOMAIN` in the Beanstalk environment, then redeploy.

### The environment starts Expo development mode instead of the production server

Beanstalk is using the default `npm start` behavior. Ensure the root `Procfile` is included so the environment starts `npm run server:prod`.

### The site returns 502 Bad Gateway

Check Beanstalk logs and confirm both build steps completed:

- `npm run server:build`
- `npm run expo:static:build`

Also confirm the app started on the Beanstalk-provided `PORT`.

### Sessions do not persist across app restarts

Verify:

- `SQLITE_DB_PATH` points to a writable location
- The SQLite file exists after startup
- The `sessions` table exists inside that SQLite database

### Data disappeared after redeploy or rebuild

That usually means the instance was replaced or the SQLite file path changed. SQLite on Beanstalk is instance-local, so persistence depends on keeping the same instance and file path.

## Suggested First Setup

If you want the shortest path for this class project, use:

1. One single-instance Elastic Beanstalk Node.js environment
2. `NODE_ENV=production`
3. `SESSION_SECRET`, `EXPO_PUBLIC_DOMAIN`, and `SQLITE_DB_PATH` set in Beanstalk
4. The existing `Procfile`
5. The existing prebuild hook

That matches the repository's SQLite-only deployment path.
