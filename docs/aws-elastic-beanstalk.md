# AWS Elastic Beanstalk Deployment Guide

This guide deploys the BYUconnect web app and Express API to AWS Elastic Beanstalk.

Important: Elastic Beanstalk can host the Express server and the Expo web build. It does not publish native iOS or Android apps. Native mobile distribution still needs a separate flow such as EAS, TestFlight, or Google Play.

## What Gets Deployed

- The Express server in `server/`
- The static Expo web output from `static-build/`
- The shared API and session-based auth running from the same host

In this repository, the Express app already serves the generated Expo output in production, so Beanstalk should run a single Node process for both the API and the web frontend.

## Recommended AWS Architecture

- Elastic Beanstalk Node.js environment for the app
- Amazon RDS for PostgreSQL
- Application Load Balancer with HTTPS
- Route 53 plus ACM if you want a custom domain

Do not use SQLite on Elastic Beanstalk for production. Beanstalk instances are replaceable and the local filesystem is not durable enough for a production database.

## Repo-Specific Constraints

These matter for this codebase:

1. The production server process is `npm run server:prod`.
2. The root `start` script is for Expo development, not production.
3. The static Expo build requires `EXPO_PUBLIC_DOMAIN` to be set during deployment.
4. PostgreSQL is the correct production database because the backend stores sessions there with `connect-pg-simple`.

## Prerequisites

Before you deploy, make sure you have:

- An AWS account
- An RDS PostgreSQL instance or database ready to use
- A Beanstalk application and environment, or permission to create them
- Node.js 20 selected for the Beanstalk platform
- Optional: the EB CLI installed locally if you want CLI-based deploys

## Environment Variables

Set these in the Elastic Beanstalk environment configuration:

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | Set to `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Long random secret for signed sessions |
| `EXPO_PUBLIC_DOMAIN` | Yes | Public hostname for the deployed app, such as `myapp.us-west-2.elasticbeanstalk.com` or `app.example.com` |
| `PORT` | No | Beanstalk usually injects this automatically |
| `HOST` | No | Leave unset unless you have a reason to override it |
| `CORS_ORIGIN` | No | Only needed if the frontend is hosted on a different origin |
| `DB_PROVIDER` | No | Leave unset when using PostgreSQL |
| `SQLITE_DB_PATH` | No | Not used for the recommended production setup |

Important: `EXPO_PUBLIC_DOMAIN` is used while building the Expo static assets. If you later move from the default Beanstalk URL to a custom domain, update `EXPO_PUBLIC_DOMAIN` and redeploy so the generated frontend assets use the final host.

## Prepare the Database

1. Create a PostgreSQL database in Amazon RDS.
2. Allow inbound access from the Beanstalk environment security group.
3. Copy the PostgreSQL connection string into `DATABASE_URL`.
4. Run the schema push once against that database:

```bash
npm run db:push
```

You can run that from a machine that has network access to the RDS instance, or from a temporary shell on an EC2/Beanstalk host that can reach the database.

## Beanstalk Runtime Files Included In This Repo

This repository should not rely on the default `npm start` behavior in Beanstalk, because `npm start` launches Expo development mode.

These files are now included in the repository:

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

npm run expo:static:build
npm run server:build
```

This makes Beanstalk build the Expo static bundle and the production server bundle on the instance before the app starts.

If you create this file on Windows, use LF line endings. On current Amazon Linux 2 and Amazon Linux 2023 Beanstalk platforms, hook scripts are automatically made executable during deployment.

### 3. Optional .ebignore

If you use the EB CLI, add `.ebignore` so local artifacts are not uploaded:

```text
.expo/
.git/
.local/
node_modules/
static-build/
server_dist/
```

## Create the Beanstalk Environment

You can use the AWS console or the EB CLI.

### Option A: AWS Console

1. Create a new Elastic Beanstalk application.
2. Choose the Node.js 20 platform.
3. Choose a load-balanced environment for production.
4. Configure environment properties with the variables listed above.
5. Attach the environment to the VPC and subnets that can reach your RDS instance.
6. Deploy the application source bundle from this repository.

### Option B: EB CLI

Example flow:

```bash
eb init
eb create byuconnect-prod
eb setenv NODE_ENV=production DATABASE_URL="postgres://..." SESSION_SECRET="replace-me" EXPO_PUBLIC_DOMAIN="your-env.us-west-2.elasticbeanstalk.com"
eb deploy
```

Use your actual region, environment name, and database URL.

## Deployment Flow

For each deploy, Beanstalk should do this:

1. Install dependencies with `npm install`
2. Run `.platform/hooks/prebuild/01_build_app.sh`
3. Start the app with the `Procfile` command
4. Serve the web app and API from the same Node process

## Health Check and Verification

After deployment:

1. Open the environment URL in a browser.
2. Confirm the landing page loads.
3. Confirm the web app can load event and club data.
4. Test login and registration.
5. Check Beanstalk logs if the environment goes unhealthy.

Good health check targets for this app:

- `/`
- `/api/buildings`

## HTTPS and Custom Domain

For production, use HTTPS.

1. Request or import an ACM certificate.
2. Attach it to the load balancer listener.
3. Point your Route 53 record at the Beanstalk load balancer or environment URL.
4. Update `EXPO_PUBLIC_DOMAIN` to the final public hostname.
5. Redeploy.

If the frontend and API stay on the same domain, you usually do not need to set `CORS_ORIGIN`.

## Updating the App

For future releases:

1. Push your code changes.
2. Run `eb deploy` or upload a new application version in the console.
3. If the public hostname changed, update `EXPO_PUBLIC_DOMAIN` before deploying.
4. If the schema changed, run `npm run db:push` against the production database before or during the release window.

## Troubleshooting

### Build fails with "No deployment domain found"

Set `EXPO_PUBLIC_DOMAIN` in the Beanstalk environment, then redeploy.

### The environment starts Expo development mode instead of the production server

Beanstalk is using the default `npm start` behavior. Add the `Procfile` shown above so the environment starts `npm run server:prod`.

### The site returns 502 Bad Gateway

Check Beanstalk logs and confirm both build steps completed:

- `npm run expo:static:build`
- `npm run server:build`

Also confirm the app started on the Beanstalk-provided `PORT`.

### Sessions do not persist

This app stores sessions in PostgreSQL in production. Verify:

- `DATABASE_URL` is correct
- The database is reachable from Beanstalk
- The `session` table can be created by `connect-pg-simple`

### Requests fail after moving to a custom domain

Update `EXPO_PUBLIC_DOMAIN` to the new hostname and redeploy so the static Expo output is rebuilt with the correct public domain.

## Suggested First Production Setup

If you want the shortest path to a stable deployment, use this baseline:

1. One load-balanced Elastic Beanstalk Node.js environment
2. One PostgreSQL RDS instance
3. `NODE_ENV=production`
4. `DATABASE_URL`, `SESSION_SECRET`, and `EXPO_PUBLIC_DOMAIN` set in Beanstalk
5. A `Procfile` that starts `npm run server:prod`
6. A prebuild hook that runs the Expo and server production builds

That matches how this repository is structured today.