-- Baseline migration: existing tables were created by 001_init.sql
-- Prisma takes over management from here.
-- New tables: categories, refresh_tokens (column category_id added to products)

-- ─────────────────────────────────────────────
-- جدول الكاتيجوريز (جديد)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

-- ─────────────────────────────────────────────
-- إضافة category_id لـ products (جديد)
-- ─────────────────────────────────────────────
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category_id" UUID REFERENCES "categories"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products"("category_id");

-- إضافة updated_at لـ products (لو مش موجود — Prisma بيديرها)
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- إضافة updated_at لـ orders (لو مش موجود)
ALTER TABLE "orders" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- ─────────────────────────────────────────────
-- جدول Refresh Tokens (جديد)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "admin_user" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX IF NOT EXISTS "refresh_tokens_admin_user_idx" ON "refresh_tokens"("admin_user");
