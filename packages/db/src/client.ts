import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);

export const createDb = (connectionString = process.env.DATABASE_URL) => {
  if (!connectionString) {
    return null;
  }

  const client = postgres(connectionString, {
    max: 5,
    idle_timeout: 10,
    prepare: false
  });

  return drizzle(client, { schema });
};

let cachedDb: Database | null | undefined;

export const getDb = () => {
  if (cachedDb !== undefined) {
    return cachedDb;
  }

  cachedDb = createDb();
  return cachedDb;
};

export const resetDb = () => {
  cachedDb = undefined;
};

export const getDbOrThrow = () => {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL is required for database-backed operations.");
  }

  return db;
};
