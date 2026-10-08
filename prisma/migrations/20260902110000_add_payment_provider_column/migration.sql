-- AlterTable
-- Added with a default so the column can be NOT NULL on an already populated
-- table; the default is then dropped so every new payment must state its
-- provider explicitly.
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "provider" "payment_providers" NOT NULL DEFAULT 'YOOKASSA';
ALTER TABLE "payments" ALTER COLUMN "provider" DROP DEFAULT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_payments_provider_provider_payment_id" ON "payments"("provider", "provider_payment_id");
