import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function clearDatabase() {
  console.log("Memulai pembersihan database...");
  
  try {
    // Daftar tabel yang AKAN dihapus (harus sesuai dengan hasil query list-tables.ts)
    const tablesToTruncate = [
      "messages", 
      "chats", 
      "wishlists", 
      "reviews", 
      "products", 
      "profiles",
      "verification_tokens"
    ];

    console.log(`Menghapus tabel: ${tablesToTruncate.join(", ")}`);

    // Gabungkan nama tabel menjadi string yang valid untuk SQL
    const tableNames = tablesToTruncate.join(", ");

    await db.execute(sql.raw(`
      TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;
    `));

    console.log("Database berhasil dibersihkan!");
  } catch (error) {
    console.error("Terjadi kesalahan saat membersihkan database:", error);
  } finally {
    process.exit(0);
  }
}

clearDatabase().catch(console.error);
