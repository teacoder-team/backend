
-- AlterEnum
BEGIN;
CREATE TYPE "payment_methods_new" AS ENUM ('bank_card', 'sbp', 't_pay', 'sber_pay', 'yoomoney', 'crypto_bot', 'heleket', 'international_card', 'telegram_stars');
ALTER TABLE "payment_intents" ALTER COLUMN "method" TYPE "payment_methods_new" USING ("method"::text::"payment_methods_new");
ALTER TABLE "user_payment_methods" ALTER COLUMN "type" TYPE "payment_methods_new" USING ("type"::text::"payment_methods_new");
ALTER TYPE "payment_methods" RENAME TO "payment_methods_old";
ALTER TYPE "payment_methods_new" RENAME TO "payment_methods";
DROP TYPE "public"."payment_methods_old";
COMMIT;

