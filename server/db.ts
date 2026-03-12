import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

export const dbProvider =
  process.env.DB_PROVIDER || (process.env.DATABASE_URL ? "postgres" : "sqlite");

export const isPostgres = dbProvider === "postgres";

export const pool = isPostgres
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;
