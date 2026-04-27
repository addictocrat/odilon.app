import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const isLocal =
  process.env.POSTGRES_URL?.includes("localhost") ||
  process.env.POSTGRES_URL?.includes("127.0.0.1");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL!,
  ...(isLocal ? { ssl: false } : {}),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
