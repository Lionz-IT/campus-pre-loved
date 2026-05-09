CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('available', 'booked', 'sold');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
    CREATE TYPE product_category AS ENUM (
      'microcontroller', 'electronic_component', 'module', 'tool', 
      'book_module', 'laptop_accessory', 'clothing', 'stationery', 'other'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
    CREATE TYPE message_type AS ENUM ('text', 'offer', 'offer_accept', 'offer_reject', 'system');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
    CREATE TYPE listing_type AS ENUM ('sell', 'barter');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT          NOT NULL,
  nim             TEXT          UNIQUE,
  department      TEXT,
  campus_email    TEXT          NOT NULL UNIQUE,
  CONSTRAINT chk_pens_email CHECK (
    campus_email ~* '^[A-Za-z0-9._%+\-]+@(mhs\.pens\.ac\.id|it\.student\.pens\.ac\.id|pens\.ac\.id)$'
  ),
  bio             TEXT,
  avatar_url      TEXT,
  whatsapp_number TEXT,
  total_listings  INT           NOT NULL DEFAULT 0 CHECK (total_listings >= 0),
  total_sold      INT           NOT NULL DEFAULT 0 CHECK (total_sold >= 0),
  rating          NUMERIC(3,2)            DEFAULT NULL CHECK (rating BETWEEN 0 AND 5),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT              NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description     TEXT              CHECK (char_length(description) <= 2000),
  price           INT               CHECK (
                                      (listing_type = 'barter' AND price IS NULL)
                                      OR (listing_type = 'sell' AND price > 0)
                                    ),
  listing_type    listing_type      NOT NULL DEFAULT 'sell',
  category        product_category  NOT NULL,
  condition       TEXT              NOT NULL DEFAULT 'good'
                                      CHECK (condition IN ('new','like_new','good','fair','poor')),
  status          product_status    NOT NULL DEFAULT 'available',
  booked_by       UUID              REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_urls      TEXT[]            NOT NULL DEFAULT '{}',
  campus_location TEXT              DEFAULT 'PENS — Surabaya',
  is_negotiable   BOOLEAN           NOT NULL DEFAULT TRUE,
  is_deleted      BOOLEAN           NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chats (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id        UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id       UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ   DEFAULT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT uq_chat_buyer_product UNIQUE (product_id, buyer_id),
  CONSTRAINT chk_buyer_not_seller  CHECK  (buyer_id <> seller_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id         UUID            NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id       UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type    message_type    NOT NULL DEFAULT 'text',
  content         TEXT,
  payload         JSONB     DEFAULT NULL,
  CONSTRAINT chk_message_content CHECK (
    (message_type IN ('text', 'system') AND content IS NOT NULL)
    OR
    (message_type IN ('offer', 'offer_accept', 'offer_reject') AND payload IS NOT NULL)
  ),
  is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email  ON public.profiles (campus_email);
CREATE INDEX IF NOT EXISTS idx_profiles_nim    ON public.profiles (nim) WHERE nim IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_feed       ON public.products (status, category) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_products_seller     ON public.products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_booked_by  ON public.products (booked_by) WHERE booked_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON public.products USING GIN (title       gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_desc_trgm  ON public.products USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_chats_buyer    ON public.chats (buyer_id);
CREATE INDEX IF NOT EXISTS idx_chats_seller   ON public.chats (seller_id);
CREATE INDEX IF NOT EXISTS idx_chats_last_msg ON public.chats (last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_messages_chat_time ON public.messages (chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread    ON public.messages (chat_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_payload   ON public.messages USING GIN (payload) WHERE message_type <> 'text';

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

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
CREATE TRIGGER trg_on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();

CREATE OR REPLACE FUNCTION public.fn_sync_user_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET campus_email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_email_update ON auth.users;
CREATE TRIGGER trg_on_auth_user_email_update AFTER UPDATE OF email ON auth.users FOR EACH ROW WHEN (OLD.email IS DISTINCT FROM NEW.email) EXECUTE FUNCTION public.fn_sync_user_email();

CREATE OR REPLACE FUNCTION public.fn_update_chat_last_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.chats SET last_message_at = NEW.created_at WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_new_message ON public.messages;
CREATE TRIGGER trg_on_new_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.fn_update_chat_last_message();

CREATE OR REPLACE FUNCTION public.fn_guard_product_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NOT (
       (OLD.status = 'available' AND NEW.status = 'booked')
    OR (OLD.status = 'booked'    AND NEW.status = 'available')
    OR (OLD.status = 'booked'    AND NEW.status = 'sold')
  ) THEN
    RAISE EXCEPTION 'Transisi status produk tidak valid: % → %', OLD.status, NEW.status;
  END IF;
  IF OLD.status = 'booked' AND NEW.status = 'available' THEN
    NEW.booked_by = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_product_state_machine ON public.products;
CREATE TRIGGER trg_product_state_machine BEFORE UPDATE OF status ON public.products FOR EACH ROW EXECUTE FUNCTION public.fn_guard_product_status();

CREATE OR REPLACE FUNCTION public.fn_update_seller_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET total_listings = total_listings + 1 WHERE id = NEW.seller_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
      UPDATE public.profiles SET total_listings = GREATEST(total_listings - 1, 0) WHERE id = OLD.seller_id;
    END IF;
    IF OLD.status <> 'sold' AND NEW.status = 'sold' THEN
      UPDATE public.profiles SET total_sold = total_sold + 1 WHERE id = NEW.seller_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_seller_stats ON public.products;
CREATE TRIGGER trg_seller_stats AFTER INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.fn_update_seller_stats();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: publik bisa baca" ON public.profiles;
CREATE POLICY "profiles: publik bisa baca" ON public.profiles FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "profiles: pemilik buat profil" ON public.profiles;
CREATE POLICY "profiles: pemilik buat profil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles: pemilik update profil" ON public.profiles;
CREATE POLICY "profiles: pemilik update profil" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles: tidak bisa delete" ON public.profiles;
CREATE POLICY "profiles: tidak bisa delete" ON public.profiles FOR DELETE USING (FALSE);

DROP POLICY IF EXISTS "products: baca produk aktif atau milik sendiri" ON public.products;
CREATE POLICY "products: baca produk aktif atau milik sendiri" ON public.products FOR SELECT USING (is_deleted = FALSE OR seller_id = auth.uid());
DROP POLICY IF EXISTS "products: penjual tambah produk" ON public.products;
CREATE POLICY "products: penjual tambah produk" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = seller_id);
DROP POLICY IF EXISTS "products: penjual edit produk sendiri" ON public.products;
CREATE POLICY "products: penjual edit produk sendiri" ON public.products FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
DROP POLICY IF EXISTS "products: pembeli bisa booking" ON public.products;
CREATE POLICY "products: pembeli bisa booking" ON public.products FOR UPDATE USING (status = 'available' AND auth.role() = 'authenticated' AND auth.uid() <> seller_id) WITH CHECK (status = 'booked' AND booked_by = auth.uid());
DROP POLICY IF EXISTS "products: pembeli bisa cancel booking sendiri" ON public.products;
CREATE POLICY "products: pembeli bisa cancel booking sendiri" ON public.products FOR UPDATE USING (status = 'booked' AND booked_by = auth.uid()) WITH CHECK (status = 'available' AND (booked_by IS NULL OR booked_by = auth.uid()));
DROP POLICY IF EXISTS "products: tidak bisa hard-delete" ON public.products;
CREATE POLICY "products: tidak bisa hard-delete" ON public.products FOR DELETE USING (FALSE);

DROP POLICY IF EXISTS "chats: hanya peserta bisa baca" ON public.chats;
CREATE POLICY "chats: hanya peserta bisa baca" ON public.chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
DROP POLICY IF EXISTS "chats: pembeli bisa buat room" ON public.chats;
CREATE POLICY "chats: pembeli bisa buat room" ON public.chats FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = buyer_id AND auth.uid() <> seller_id);
DROP POLICY IF EXISTS "chats: tidak bisa update langsung" ON public.chats;
CREATE POLICY "chats: tidak bisa update langsung" ON public.chats FOR UPDATE USING (FALSE);
DROP POLICY IF EXISTS "chats: tidak bisa delete langsung" ON public.chats;
CREATE POLICY "chats: tidak bisa delete langsung" ON public.chats FOR DELETE USING (FALSE);

DROP POLICY IF EXISTS "messages: hanya peserta bisa baca" ON public.messages;
CREATE POLICY "messages: hanya peserta bisa baca" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.chats c WHERE c.id = messages.chat_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));
DROP POLICY IF EXISTS "messages: peserta bisa kirim" ON public.messages;
CREATE POLICY "messages: peserta bisa kirim" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chats c WHERE c.id = messages.chat_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));
DROP POLICY IF EXISTS "messages: penerima tandai sudah dibaca" ON public.messages;
CREATE POLICY "messages: penerima tandai sudah dibaca" ON public.messages FOR UPDATE USING (is_read = FALSE AND EXISTS (SELECT 1 FROM public.chats c WHERE c.id = messages.chat_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid()) AND auth.uid() <> messages.sender_id)) WITH CHECK (is_read = TRUE);
DROP POLICY IF EXISTS "messages: tidak bisa delete" ON public.messages;
CREATE POLICY "messages: tidak bisa delete" ON public.messages FOR DELETE USING (FALSE);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage product-images: baca publik" ON storage.objects;
CREATE POLICY "storage product-images: baca publik" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "storage product-images: upload terautentikasi" ON storage.objects;
CREATE POLICY "storage product-images: upload terautentikasi" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "storage product-images: pemilik update" ON storage.objects;
CREATE POLICY "storage product-images: pemilik update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "storage product-images: pemilik delete" ON storage.objects;
CREATE POLICY "storage product-images: pemilik delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "storage avatars: baca publik" ON storage.objects;
CREATE POLICY "storage avatars: baca publik" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "storage avatars: pemilik upload" ON storage.objects;
CREATE POLICY "storage avatars: pemilik upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "storage avatars: pemilik delete" ON storage.objects;
CREATE POLICY "storage avatars: pemilik delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chats') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
  END IF;
END $$;

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

-- =============================================
-- WISHLISTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.wishlists (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user    ON public.wishlists (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON public.wishlists (product_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlists: pemilik bisa baca" ON public.wishlists;
CREATE POLICY "wishlists: pemilik bisa baca" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wishlists: user bisa tambah" ON public.wishlists;
CREATE POLICY "wishlists: user bisa tambah" ON public.wishlists FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
DROP POLICY IF EXISTS "wishlists: pemilik bisa hapus" ON public.wishlists;
CREATE POLICY "wishlists: pemilik bisa hapus" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- REVIEWS
-- =============================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id   UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INT           NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT          CHECK (char_length(comment) <= 500),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT uq_review_product_reviewer UNIQUE (product_id, reviewer_id),
  CONSTRAINT chk_reviewer_not_seller    CHECK  (reviewer_id <> seller_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller   ON public.reviews (seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product  ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews (reviewer_id);

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE FUNCTION public.fn_update_seller_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target_seller_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_seller_id := OLD.seller_id;
  ELSE
    target_seller_id := NEW.seller_id;
  END IF;

  UPDATE public.profiles
  SET rating = (
    SELECT ROUND(AVG(r.rating)::numeric, 2)
    FROM public.reviews r
    WHERE r.seller_id = target_seller_id
  )
  WHERE id = target_seller_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_seller_rating ON public.reviews;
CREATE TRIGGER trg_update_seller_rating AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.fn_update_seller_rating();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews: publik bisa baca" ON public.reviews;
CREATE POLICY "reviews: publik bisa baca" ON public.reviews FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "reviews: pembeli produk sold bisa review" ON public.reviews;
CREATE POLICY "reviews: pembeli produk sold bisa review" ON public.reviews FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
  AND auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id
    AND p.status = 'sold'
    AND p.seller_id = reviews.seller_id
  )
);
DROP POLICY IF EXISTS "reviews: reviewer bisa update" ON public.reviews;
CREATE POLICY "reviews: reviewer bisa update" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
DROP POLICY IF EXISTS "reviews: tidak bisa delete" ON public.reviews;
CREATE POLICY "reviews: tidak bisa delete" ON public.reviews FOR DELETE USING (FALSE);
