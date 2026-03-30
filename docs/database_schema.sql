-- =============================================================================
-- CAMPUS PRE-LOVED MARKETPLACE — PostgreSQL Schema
-- PostgreSQL 16+ | Supabase Edition
-- Version: 1.0.0
-- =============================================================================
-- Urutan eksekusi:
-- extensions → types → tables → indexes → functions → triggers → RLS → storage
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- trigram index untuk full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- accent-insensitive search


-- ---------------------------------------------------------------------------
-- 1. CUSTOM TYPES / ENUMS
-- ---------------------------------------------------------------------------

-- State Machine: Tersedia → Di-booking → Terjual (bisa cancel: Di-booking → Tersedia)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM (
      'available',
      'booked',
      'sold'
    );
  END IF;
END $$;

-- Kategori spesifik ekosistem PENS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
    CREATE TYPE product_category AS ENUM (
      'microcontroller',
      'electronic_component',
      'module',
      'tool',
      'book_module',
      'laptop_accessory',
      'clothing',
      'stationery',
      'other'
    );
  END IF;
END $$;

-- Tipe pesan: tawar-menawar embedded dalam messages (TANPA tabel terpisah!)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
    CREATE TYPE message_type AS ENUM (
      'text',
      'offer',
      'offer_accept',
      'offer_reject',
      'system'
    );
  END IF;
END $$;

-- Tipe transaksi listing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
    CREATE TYPE listing_type AS ENUM (
      'sell',
      'barter'
    );
  END IF;
END $$;


-- ---------------------------------------------------------------------------
-- 2. TABEL
-- ---------------------------------------------------------------------------

-- ── 2a. PROFILES (extends auth.users Supabase, relasi 1-to-1) ───────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary Key = UUID dari Supabase Auth (auth.users.id)
  id              UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identitas kampus
  full_name       TEXT          NOT NULL,
  nim             TEXT          UNIQUE,        -- Nomor Induk Mahasiswa
  department      TEXT,                        -- Jurusan / Prodi
  campus_email    TEXT          NOT NULL UNIQUE,

  -- ╔══════════════════════════════════════════════════════════════╗
  -- ║  LAYER 2: SQL CHECK CONSTRAINT untuk domain email PENS      ║
  -- ║  Domain valid: @mhs.pens.ac.id                              ║
  -- ║               @it.student.pens.ac.id                        ║
  -- ║               @pens.ac.id                                   ║
  -- ╚══════════════════════════════════════════════════════════════╝
  CONSTRAINT chk_pens_email CHECK (
    campus_email ~* '^[A-Za-z0-9._%+\-]+@(mhs\.pens\.ac\.id|it\.student\.pens\.ac\.id|pens\.ac\.id)$'
  ),

  bio             TEXT,
  avatar_url      TEXT,                         -- URL Supabase Storage
  whatsapp_number TEXT,                         -- untuk koordinasi COD

  -- Counter denormalized, diupdate oleh trigger
  total_listings  INT           NOT NULL DEFAULT 0 CHECK (total_listings >= 0),
  total_sold      INT           NOT NULL DEFAULT 0 CHECK (total_sold >= 0),
  rating          NUMERIC(3,2)            DEFAULT NULL CHECK (rating BETWEEN 0 AND 5),

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.profiles IS 'Profil pengguna, terhubung 1-to-1 dengan Supabase Auth.';
COMMENT ON COLUMN public.profiles.campus_email IS
  'Wajib domain PENS. Divalidasi di Layer 1 (aplikasi) dan Layer 2 (SQL CHECK constraint ini).';


-- ── 2b. PRODUCTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  title           TEXT              NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description     TEXT              CHECK (char_length(description) <= 2000),
  price           INT               CHECK (
                                      -- Barter tidak perlu harga; jual wajib harga > 0
                                      (listing_type = 'barter' AND price IS NULL)
                                      OR (listing_type = 'sell' AND price > 0)
                                    ),
  listing_type    listing_type      NOT NULL DEFAULT 'sell',
  category        product_category  NOT NULL,
  condition       TEXT              NOT NULL DEFAULT 'good'
                                      CHECK (condition IN ('new','like_new','good','fair','poor')),

  -- STATE MACHINE — field utama
  status          product_status    NOT NULL DEFAULT 'available',
  booked_by       UUID              REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Array URL foto dari Supabase Storage
  image_urls      TEXT[]            NOT NULL DEFAULT '{}',

  campus_location TEXT              DEFAULT 'PENS — Surabaya',  -- titik COD
  is_negotiable   BOOLEAN           NOT NULL DEFAULT TRUE,

  -- Soft delete (tidak langsung hapus dari DB)
  is_deleted      BOOLEAN           NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.products        IS 'Listing produk/barang untuk Campus Pre-loved Marketplace.';
COMMENT ON COLUMN public.products.status IS
  'State machine: available → booked → sold. Cancel: booked → available.';
COMMENT ON COLUMN public.products.booked_by IS
  'Diisi saat pembeli booking; di-NULL saat cancel atau barang terjual.';


-- ── 2c. CHATS ───────────────────────────────────────────────────────────────
-- 1 room per pasangan (pembeli + produk). Penjual didenormalisasi untuk RLS efisien.
CREATE TABLE IF NOT EXISTS public.chats (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id        UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id       UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  last_message_at TIMESTAMPTZ   DEFAULT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- Cegah duplikasi room untuk pasangan (pembeli, produk) yang sama
  CONSTRAINT uq_chat_buyer_product UNIQUE (product_id, buyer_id),
  -- Penjual tidak bisa chat dengan dirinya sendiri
  CONSTRAINT chk_buyer_not_seller  CHECK  (buyer_id <> seller_id)
);

COMMENT ON TABLE public.chats IS '1 room chat per (pembeli, produk). seller_id didenormalisasi untuk RLS.';


-- ── 2d. MESSAGES ────────────────────────────────────────────────────────────
-- Kolom `payload` JSONB menampung data tawar-menawar TANPA tabel terpisah.
--
-- Skema payload per message_type:
--
-- 'offer':
--   { "offered_price": 150000, "original_price": 200000, "note": "Bisa kurang?" }
--
-- 'offer_accept':
--   { "agreed_price": 150000, "meet_point": "Kantin Teknik", "meet_time": "Besok 13.00" }
--
-- 'offer_reject':
--   { "counter_offer": 180000, "reason": "Harga segitu sudah pas." }
--
-- 'system':
--   { "event": "status_changed", "from": "available", "to": "booked" }
--
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id         UUID            NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id       UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  message_type    message_type    NOT NULL DEFAULT 'text',
  content         TEXT,     -- untuk tipe 'text' dan 'system'
  payload         JSONB     DEFAULT NULL,  -- untuk tipe offer/*

  -- Pastikan konsistensi: teks/system harus ada content, offer harus ada payload
  CONSTRAINT chk_message_content CHECK (
    (message_type IN ('text', 'system') AND content IS NOT NULL)
    OR
    (message_type IN ('offer', 'offer_accept', 'offer_reject') AND payload IS NOT NULL)
  ),

  is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.messages.payload IS
  'JSONB payload untuk offer/accept/reject. Tawar-menawar tanpa tabel DB terpisah.';


-- ---------------------------------------------------------------------------
-- 3. INDEXES
-- ---------------------------------------------------------------------------

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email  ON public.profiles (campus_email);
CREATE INDEX IF NOT EXISTS idx_profiles_nim    ON public.profiles (nim) WHERE nim IS NOT NULL;

-- Products — feed utama marketplace
CREATE INDEX IF NOT EXISTS idx_products_feed       ON public.products (status, category) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_products_seller     ON public.products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_booked_by  ON public.products (booked_by) WHERE booked_by IS NOT NULL;
-- Full-text search pakai trigram
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON public.products USING GIN (title       gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_desc_trgm  ON public.products USING GIN (description gin_trgm_ops);

-- Chats
CREATE INDEX IF NOT EXISTS idx_chats_buyer    ON public.chats (buyer_id);
CREATE INDEX IF NOT EXISTS idx_chats_seller   ON public.chats (seller_id);
CREATE INDEX IF NOT EXISTS idx_chats_last_msg ON public.chats (last_message_at DESC NULLS LAST);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_chat_time ON public.messages (chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread    ON public.messages (chat_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_payload   ON public.messages USING GIN (payload) WHERE message_type <> 'text';


-- ---------------------------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS
-- ---------------------------------------------------------------------------

-- ── 4a. Auto-update `updated_at` ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- ── 4b. Auto-buat profil saat user baru daftar via Supabase Auth ─────────────
CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, campus_email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();


-- ── 4c. Sinkronisasi email jika user mengubah email di Supabase Auth ─────────
CREATE OR REPLACE FUNCTION public.fn_sync_user_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET campus_email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_email_update ON auth.users;
CREATE TRIGGER trg_on_auth_user_email_update
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.fn_sync_user_email();


-- ── 4d. Update `chats.last_message_at` saat pesan baru masuk ────────────────
CREATE OR REPLACE FUNCTION public.fn_update_chat_last_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.chats SET last_message_at = NEW.created_at WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_new_message ON public.messages;
CREATE TRIGGER trg_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_chat_last_message();


-- ── 4e. ORDER STATE MACHINE GUARD ───────────────────────────────────────────
-- Validasi transisi status di level DATABASE (bukan hanya aplikasi).
--
-- Transisi yang VALID:
--   available → booked       (pembeli booking)
--   booked    → available    (CANCEL — kembali tersedia)
--   booked    → sold         (COD selesai)
--
-- Transisi LAINNYA akan throw exception.
--
CREATE OR REPLACE FUNCTION public.fn_guard_product_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Jika status tidak berubah, lewati
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;

  -- Validasi transisi
  IF NOT (
       (OLD.status = 'available' AND NEW.status = 'booked')
    OR (OLD.status = 'booked'    AND NEW.status = 'available')
    OR (OLD.status = 'booked'    AND NEW.status = 'sold')
  ) THEN
    RAISE EXCEPTION
      'Transisi status produk tidak valid: % → %. Transisi yang diizinkan: available→booked, booked→available (cancel), booked→sold.',
      OLD.status, NEW.status;
  END IF;

  -- Saat CANCEL (booked → available): bersihkan data pembeli secara otomatis
  IF OLD.status = 'booked' AND NEW.status = 'available' THEN
    NEW.booked_by = NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_product_state_machine ON public.products;
CREATE TRIGGER trg_product_state_machine
  BEFORE UPDATE OF status ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_product_status();


-- ── 4f. Update counter statistik penjual ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_update_seller_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Tambah total_listings saat produk baru ditambahkan
    UPDATE public.profiles SET total_listings = total_listings + 1 WHERE id = NEW.seller_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Kurangi total_listings saat soft-delete
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
      UPDATE public.profiles
        SET total_listings = GREATEST(total_listings - 1, 0)
        WHERE id = OLD.seller_id;
    END IF;
    -- Tambah total_sold saat status berubah ke 'sold'
    IF OLD.status <> 'sold' AND NEW.status = 'sold' THEN
      UPDATE public.profiles SET total_sold = total_sold + 1 WHERE id = NEW.seller_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_seller_stats ON public.products;
CREATE TRIGGER trg_seller_stats
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_seller_stats();


-- ---------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------------

-- Aktifkan RLS di semua tabel publik
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages  ENABLE ROW LEVEL SECURITY;


-- ── 5a. PROFILES ─────────────────────────────────────────────────────────────

-- Siapa saja (termasuk anonim) bisa melihat profil publik
DROP POLICY IF EXISTS "profiles: publik bisa baca" ON public.profiles;
CREATE POLICY "profiles: publik bisa baca"
  ON public.profiles FOR SELECT USING (TRUE);

-- Hanya pemilik yang bisa membuat profil miliknya (id harus = uid)
DROP POLICY IF EXISTS "profiles: pemilik buat profil" ON public.profiles;
CREATE POLICY "profiles: pemilik buat profil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Hanya pemilik yang bisa mengupdate datanya sendiri
DROP POLICY IF EXISTS "profiles: pemilik update profil" ON public.profiles;
CREATE POLICY "profiles: pemilik update profil"
  ON public.profiles FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tidak ada delete langsung dari client; hapus via auth.users (CASCADE)
DROP POLICY IF EXISTS "profiles: tidak bisa delete" ON public.profiles;
CREATE POLICY "profiles: tidak bisa delete"
  ON public.profiles FOR DELETE USING (FALSE);


-- ── 5b. PRODUCTS ─────────────────────────────────────────────────────────────

-- Semua orang bisa melihat produk yang tidak di-soft-delete (atau miliknya sendiri)
DROP POLICY IF EXISTS "products: baca produk aktif atau milik sendiri" ON public.products;
CREATE POLICY "products: baca produk aktif atau milik sendiri"
  ON public.products FOR SELECT
  USING (is_deleted = FALSE OR seller_id = auth.uid());

-- Hanya pengguna terautentikasi yang bisa menambah produk (seller_id harus = uid)
DROP POLICY IF EXISTS "products: penjual tambah produk" ON public.products;
CREATE POLICY "products: penjual tambah produk"
  ON public.products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = seller_id);

-- Hanya penjual yang bisa mengedit produknya sendiri
DROP POLICY IF EXISTS "products: penjual edit produk sendiri" ON public.products;
CREATE POLICY "products: penjual edit produk sendiri"
  ON public.products FOR UPDATE
  USING     (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Pembeli (bukan penjual) bisa men-trigger booking pada produk yang available
DROP POLICY IF EXISTS "products: pembeli bisa booking" ON public.products;
CREATE POLICY "products: pembeli bisa booking"
  ON public.products FOR UPDATE
  USING (
    status = 'available'
    AND auth.role() = 'authenticated'
    AND auth.uid() <> seller_id
  )
  WITH CHECK (
    status = 'booked'
    AND booked_by = auth.uid()
  );

DROP POLICY IF EXISTS "products: pembeli bisa cancel booking sendiri" ON public.products;
CREATE POLICY "products: pembeli bisa cancel booking sendiri"
  ON public.products FOR UPDATE
  USING (
    status = 'booked'
    AND booked_by = auth.uid()
  )
  WITH CHECK (
    status = 'available'
    AND (booked_by IS NULL OR booked_by = auth.uid())
  );

-- Tidak ada hard-delete dari client; gunakan soft-delete (is_deleted = TRUE)
DROP POLICY IF EXISTS "products: tidak bisa hard-delete" ON public.products;
CREATE POLICY "products: tidak bisa hard-delete"
  ON public.products FOR DELETE USING (FALSE);


-- ── 5c. CHATS ────────────────────────────────────────────────────────────────

-- Hanya peserta chat (pembeli atau penjual) yang bisa melihat room
DROP POLICY IF EXISTS "chats: hanya peserta bisa baca" ON public.chats;
CREATE POLICY "chats: hanya peserta bisa baca"
  ON public.chats FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Pembeli yang terautentikasi bisa membuat room (tidak bisa impersonate seller_id)
DROP POLICY IF EXISTS "chats: pembeli bisa buat room" ON public.chats;
CREATE POLICY "chats: pembeli bisa buat room"
  ON public.chats FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = buyer_id
    AND auth.uid() <> seller_id
  );

-- Update & delete hanya via server-side (Service Role)
DROP POLICY IF EXISTS "chats: tidak bisa update langsung" ON public.chats;
CREATE POLICY "chats: tidak bisa update langsung" ON public.chats FOR UPDATE USING (FALSE);
DROP POLICY IF EXISTS "chats: tidak bisa delete langsung" ON public.chats;
CREATE POLICY "chats: tidak bisa delete langsung" ON public.chats FOR DELETE USING (FALSE);


-- ── 5d. MESSAGES ─────────────────────────────────────────────────────────────

-- Hanya peserta chat yang bisa membaca pesan
DROP POLICY IF EXISTS "messages: hanya peserta bisa baca" ON public.messages;
CREATE POLICY "messages: hanya peserta bisa baca"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.id = messages.chat_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Peserta bisa mengirim pesan (sender_id harus = uid)
DROP POLICY IF EXISTS "messages: peserta bisa kirim" ON public.messages;
CREATE POLICY "messages: peserta bisa kirim"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.id = messages.chat_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Penerima bisa menandai pesan sebagai sudah dibaca
DROP POLICY IF EXISTS "messages: penerima tandai sudah dibaca" ON public.messages;
CREATE POLICY "messages: penerima tandai sudah dibaca"
  ON public.messages FOR UPDATE
  USING (
    is_read = FALSE
    AND EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.id = messages.chat_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        AND auth.uid() <> messages.sender_id
    )
  )
  WITH CHECK (is_read = TRUE);

-- Tidak ada delete pesan dari client
DROP POLICY IF EXISTS "messages: tidak bisa delete" ON public.messages;
CREATE POLICY "messages: tidak bisa delete" ON public.messages FOR DELETE USING (FALSE);


-- ---------------------------------------------------------------------------
-- 6. SUPABASE STORAGE BUCKETS
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', TRUE, 5242880,   -- 5 MB max
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars',        'avatars',        TRUE, 2097152,    -- 2 MB max
   ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- -- Semua orang bisa melihat foto produk (bucket public)
DROP POLICY IF EXISTS "storage product-images: baca publik" ON storage.objects;
CREATE POLICY "storage product-images: baca publik"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Pengguna terautentikasi bisa upload; path HARUS diawali dengan uid mereka
DROP POLICY IF EXISTS "storage product-images: upload terautentikasi" ON storage.objects;
CREATE POLICY "storage product-images: upload terautentikasi"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Hanya pemilik file yang bisa update/delete
DROP POLICY IF EXISTS "storage product-images: pemilik update" ON storage.objects;
CREATE POLICY "storage product-images: pemilik update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "storage product-images: pemilik delete" ON storage.objects;
CREATE POLICY "storage product-images: pemilik delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars
DROP POLICY IF EXISTS "storage avatars: baca publik" ON storage.objects;
CREATE POLICY "storage avatars: baca publik"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "storage avatars: pemilik upload" ON storage.objects;
CREATE POLICY "storage avatars: pemilik upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "storage avatars: pemilik delete" ON storage.objects;
CREATE POLICY "storage avatars: pemilik delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ---------------------------------------------------------------------------
-- 7. ENABLE SUPABASE REALTIME
-- ---------------------------------------------------------------------------
-- Aktifkan di Dashboard: Database → Replication → pilih tabel, atau jalankan:
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chats'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
  END IF;
END $$;


-- ---------------------------------------------------------------------------
-- 8. HELPER VIEW
-- ---------------------------------------------------------------------------

-- Feed marketplace: produk tersedia dengan info penjual (untuk halaman utama)
CREATE OR REPLACE VIEW public.v_marketplace_feed AS
SELECT
  p.id, p.title, p.price, p.listing_type,
  p.category, p.condition, p.status,
  p.image_urls, p.is_negotiable, p.campus_location, p.created_at,
  pr.full_name  AS seller_name,
  pr.avatar_url AS seller_avatar,
  pr.rating     AS seller_rating
FROM public.products  p
JOIN public.profiles pr ON pr.id = p.seller_id
WHERE p.status = 'available' AND p.is_deleted = FALSE;

-- =============================================================================
-- END OF SCHEMA — campus-preloved-marketplace v1.0.0
-- =============================================================================
