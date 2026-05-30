import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts', // Pastikan path ini benar
  out: './drizzle',             // Folder tempat file migrasi disimpan
  dialect: 'postgresql',        // Dialek database kamu
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Menggunakan variabel lingkungan
  },
});