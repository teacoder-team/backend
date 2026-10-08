-- Premium is sold by the month only. Should a row without an end date exist, it lapses
-- instead of failing the migration.
UPDATE "subscriptions" SET "expires_at" = "started_at", "is_active" = false WHERE "expires_at" IS NULL;

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "expires_at" SET NOT NULL;
