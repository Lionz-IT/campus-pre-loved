import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function listTables() {
  console.log("Mencari tabel di database...");
  
  try {
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' 
      AND schemaname != 'information_schema';
    `);

    console.log("Tabel yang ditemukan:", tables);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  } finally {
    process.exit(0);
  }
}

listTables().catch(console.error);
