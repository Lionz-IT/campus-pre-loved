# 🎓 Campus Pre-loved

> Marketplace eksklusif mahasiswa Politeknik Elektronika Negeri Surabaya (PENS) untuk jual-beli dan barter barang kebutuhan kuliah.

Campus Pre-loved adalah platform e-commerce yang dirancang khusus untuk mahasiswa PENS. Aplikasi ini memfasilitasi transaksi jual-beli dan barter barang-barang perkuliahan seperti mikrokontroler, komponen elektronika, buku modul, dan perlengkapan lainnya dengan sistem *Cash on Delivery* (COD) di area kampus.

## ✨ Fitur Utama

- **Otentikasi Eksklusif**: Registrasi dibatasi hanya untuk email institusi PENS (`@mhs.pens.ac.id`, `@it.student.pens.ac.id`, `@pens.ac.id`).
- **Jual Beli & Barter**: Mahasiswa dapat menjual barang atau menawarkan barter barang.
- **Real-time Chat**: Sistem pesan terintegrasi untuk negosiasi harga dan penentuan lokasi COD.
- **Kategori Spesifik Kampus**: Kategori produk yang disesuaikan dengan kebutuhan mahasiswa teknik (Mikrokontroler, Komponen, Modul, dll).
- **Sistem Rating & Ulasan**: Membangun kepercayaan antar mahasiswa melalui ulasan setelah transaksi.
- **Lokasi COD Terintegrasi**: Pilihan lokasi COD yang sudah ditentukan di area kampus PENS (Lobby Gedung D, Kantin, dll).
- **Wishlist**: Simpan barang yang diminati untuk dibeli nanti.

## 🛠️ Tech Stack

Proyek ini dibangun menggunakan teknologi modern:

**Frontend:**
- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) (Animasi)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (Validasi Form)

**Backend & Database:**
- [NextAuth.js v5](https://authjs.dev/) (Otentikasi)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [AWS S3](https://aws.amazon.com/s3/) (Penyimpanan Gambar)
- [Socket.io](https://socket.io/) (Real-time features)
- Nodemailer (Email verification)

**DevOps & Testing:**
- [Docker](https://www.docker.com/)
- [GitHub Actions](https://github.com/features/actions) (CI/CD)
- AWS EC2
- [Vitest](https://vitest.dev/) + React Testing Library

## 📂 Struktur Proyek

```text
campus-preloved/
├── app/                  # Next.js App Router (Rute utama aplikasi)
│   ├── (auth)/           # Rute terkait otentikasi (login, register)
│   ├── (main)/           # Rute utama (dashboard, products, chats, profile)
│   └── api/              # API Routes (auth, storage)
├── components/           # Komponen React yang dapat digunakan kembali
│   ├── layout/           # Komponen layout (Header, Footer, Animasi)
│   ├── ui/               # Komponen UI atomic (Button, Input, Card)
│   └── ...               # Komponen spesifik domain
├── features/             # Logika bisnis dan Server Actions per domain
├── hooks/                # Custom React hooks
├── lib/                  # Utilitas, konfigurasi DB, auth, dan konstanta
│   ├── constants/        # Konstanta aplikasi (Rute, Data PENS)
│   ├── db/               # Konfigurasi Drizzle & Schema
│   └── validations/      # Skema validasi Zod
├── types/                # Definisi tipe TypeScript
└── proxy.ts              # Next.js Edge Middleware
```

## 🚀 Memulai Pengembangan

### Prasyarat

Pastikan Anda telah menginstal:
- Node.js (v20+)
- PostgreSQL (Lokal atau Cloud seperti Supabase/Neon)
- Akun AWS (Untuk S3 Bucket)

### Instalasi

1. **Clone repositori**
   ```bash
   git clone https://github.com/lionz-it/campus-pre-loved.git
   cd campus-preloved
   ```

2. **Instal dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Duplikat file `.env.example` menjadi `.env` dan isi nilai yang diperlukan:
   ```bash
   cp .env.example .env
   ```
   
   *Contoh variabel yang dibutuhkan (lihat `.github/workflows/deploy.yml`):*
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
   - Kredensial SMTP untuk email

4. **Jalankan Migrasi Database**
   ```bash
   npx drizzle-kit push
   # atau jika menggunakan file migrasi:
   # npm run db:migrate (tambahkan script ini jika perlu)
   ```

5. **Mulai Server Pengembangan**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

## 📜 Skema Database

Database menggunakan PostgreSQL dengan Drizzle ORM. Tabel utama meliputi:
- `profiles`: Data pengguna mahasiswa PENS
- `products`: Daftar barang yang dijual/dibarter
- `chats` & `messages`: Sistem pesan antar pengguna
- `wishlists`: Barang favorit pengguna
- `reviews`: Ulasan transaksi
- `verification_tokens`: Token verifikasi email

*Skema lengkap dapat dilihat di `lib/db/schema.ts`.*

## 🧪 Testing

Proyek ini menggunakan Vitest untuk unit dan integrasi testing.

```bash
# Menjalankan semua test
npm run test
```

## 🚢 Deployment

Aplikasi ini di-deploy menggunakan arsitektur Docker dan CI/CD GitHub Actions.

1. Setiap *push* ke branch `main` akan memicu GitHub Actions.
2. Pipeline akan mem-build *Docker image* dan melakukan push ke GitHub Container Registry (GHCR).
3. Pipeline kemudian terhubung ke server AWS EC2 via SSH, menarik *image* terbaru, dan me-restart *container*.

### Menjalankan Docker Secara Lokal

```bash
docker-compose up --build
```

---
*Dibangun dengan ❤️ oleh Mahasiswa PENS.*
