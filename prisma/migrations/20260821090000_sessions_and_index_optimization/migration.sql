-- Every statement here is guarded.
--
-- The database this targets was partly shaped by `prisma db push`, so most of
-- the changes below already exist in it while the migration history says they
-- do not. Guarding each step lets the same file converge from either state: a
-- fresh database gets everything, a drifted one gets only what it is missing.

-- DropTable
-- CASCADE also removes profiles_user_id_fkey, so no separate constraint drop.
DROP TABLE IF EXISTS "profiles" CASCADE;

-- DropIndex
DROP INDEX IF EXISTS "user_progress_lesson_id_idx";

-- AlterTable
ALTER TABLE "multi_factor_authentication" DROP COLUMN IF EXISTS "current_challenge";

-- AlterTable
-- The profile fields move onto users. Added nullable first so the backfill
-- below can run; NOT NULL is applied once every row has a value.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Backfill from profiles, but only while that table is still around.
DO $$
BEGIN
    IF to_regclass('public.profiles') IS NOT NULL THEN
        UPDATE "users" u
        SET "username"     = p."username",
            "display_name" = p."display_name",
            "avatar"       = p."avatar"
        FROM "profiles" p
        WHERE p."user_id" = u."id";
    END IF;
END $$;

-- A user without a profile would block NOT NULL, so give it a stable
-- placeholder derived from its own id rather than failing the migration.
UPDATE "users"
SET "username"     = COALESCE("username", 'user_' || substr(replace("id", '-', ''), 1, 12)),
    "display_name" = COALESCE("display_name", 'User')
WHERE "username" IS NULL OR "display_name" IS NULL;

-- No-ops when the columns are already NOT NULL.
ALTER TABLE "users" ALTER COLUMN "display_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'sessions_user_id_fkey'
    ) THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_sessions_user_id_revoked_at_expires_at" ON "sessions"("user_id", "revoked_at", "expires_at");
CREATE INDEX IF NOT EXISTS "ix_sessions_expires_at" ON "sessions"("expires_at");
CREATE INDEX IF NOT EXISTS "ix_courses_is_published_created_at" ON "courses"("is_published", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "ix_download_logs_course_id_downloaded_at" ON "download_logs"("course_id", "downloaded_at" DESC);
CREATE INDEX IF NOT EXISTS "ix_lessons_course_id_is_published_position" ON "lessons"("course_id", "is_published", "position");
CREATE INDEX IF NOT EXISTS "ix_password_reset_tokens_status_expires_at" ON "password_reset_tokens"("status", "expires_at");
CREATE INDEX IF NOT EXISTS "ix_payments_status_created_at" ON "payments"("status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "ix_payments_subscription_id" ON "payments"("subscription_id");
CREATE INDEX IF NOT EXISTS "ix_receipts_payment_id" ON "receipts"("payment_id");
CREATE INDEX IF NOT EXISTS "ix_restrictions_user_id_status" ON "restrictions"("user_id", "status");
CREATE INDEX IF NOT EXISTS "ix_subscriptions_is_active_expires_at" ON "subscriptions"("is_active", "expires_at");
CREATE INDEX IF NOT EXISTS "ix_user_payment_methods_user_id_is_active" ON "user_payment_methods"("user_id", "is_active");
CREATE INDEX IF NOT EXISTS "ix_user_progress_user_id_is_completed" ON "user_progress"("user_id", "is_completed");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_users_username" ON "users"("username");

-- RenameIndex
-- Renames only when the old name is still there and the new one is not, so a
-- database that already carries the new names is left alone.
DO $$
DECLARE
    renames TEXT[][] := ARRAY[
        ['credentials_provider_identifier_key', 'uq_credentials_provider_identifier'],
        ['credentials_user_id_idx',             'ix_credentials_user_id'],
        ['user_progress_user_id_lesson_id_key', 'uq_user_progress_user_id_lesson_id']
    ];
    pair TEXT[];
BEGIN
    FOREACH pair SLICE 1 IN ARRAY renames LOOP
        IF to_regclass('public.' || quote_ident(pair[1])) IS NOT NULL
           AND to_regclass('public.' || quote_ident(pair[2])) IS NULL THEN
            EXECUTE format('ALTER INDEX %I RENAME TO %I', pair[1], pair[2]);
        END IF;
    END LOOP;
END $$;
