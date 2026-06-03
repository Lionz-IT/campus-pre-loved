import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const globalForDb = globalThis as unknown as { __postgresClient: postgres.Sql | undefined };
const client = globalForDb.__postgresClient ?? postgres(connectionString, { max: 10, idle_timeout: 20 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__postgresClient = client;
}

export const db = drizzle(client, { schema });
