-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropIndex
DROP INDEX "user_progress_lesson_id_idx";

-- AlterTable
ALTER TABLE "multi_factor_authentication" DROP COLUMN "current_challenge";

-- AlterTable
-- The profile fields move onto users. Added nullable first so the backfill
-- below can run; NOT NULL is applied once every row has a value.
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "username" TEXT;

-- Backfill from profiles before the table is dropped.
UPDATE "users" u
SET "username"     = p."username",
    "display_name" = p."display_name",
    "avatar"       = p."avatar"
FROM "profiles" p
WHERE p."user_id" = u."id";

-- A user without a profile would block NOT NULL, so give it a stable
-- placeholder derived from its own id rather than failing the migration.
UPDATE "users"
SET "username"     = COALESCE("username", 'user_' || substr(replace("id", '-', ''), 1, 12)),
    "display_name" = COALESCE("display_name", 'User')
WHERE "username" IS NULL OR "display_name" IS NULL;

ALTER TABLE "users" ALTER COLUMN "display_name" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;

-- DropTable
DROP TABLE "profiles";

-- CreateTable
CREATE TABLE "sessions" (
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

-- CreateIndex
CREATE INDEX "ix_sessions_user_id_revoked_at_expires_at" ON "sessions"("user_id", "revoked_at", "expires_at");

-- CreateIndex
CREATE INDEX "ix_sessions_expires_at" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "ix_courses_is_published_created_at" ON "courses"("is_published", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ix_download_logs_course_id_downloaded_at" ON "download_logs"("course_id", "downloaded_at" DESC);

-- CreateIndex
CREATE INDEX "ix_lessons_course_id_is_published_position" ON "lessons"("course_id", "is_published", "position");

-- CreateIndex
CREATE INDEX "ix_password_reset_tokens_status_expires_at" ON "password_reset_tokens"("status", "expires_at");

-- CreateIndex
CREATE INDEX "ix_payments_status_created_at" ON "payments"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ix_payments_subscription_id" ON "payments"("subscription_id");

-- CreateIndex
CREATE INDEX "ix_receipts_payment_id" ON "receipts"("payment_id");

-- CreateIndex
CREATE INDEX "ix_restrictions_user_id_status" ON "restrictions"("user_id", "status");

-- CreateIndex
CREATE INDEX "ix_subscriptions_is_active_expires_at" ON "subscriptions"("is_active", "expires_at");

-- CreateIndex
CREATE INDEX "ix_user_payment_methods_user_id_is_active" ON "user_payment_methods"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "ix_user_progress_user_id_is_completed" ON "user_progress"("user_id", "is_completed");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_username" ON "users"("username");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "credentials_provider_identifier_key" RENAME TO "uq_credentials_provider_identifier";

-- RenameIndex
ALTER INDEX "credentials_user_id_idx" RENAME TO "ix_credentials_user_id";

-- RenameIndex
ALTER INDEX "user_progress_user_id_lesson_id_key" RENAME TO "uq_user_progress_user_id_lesson_id";

