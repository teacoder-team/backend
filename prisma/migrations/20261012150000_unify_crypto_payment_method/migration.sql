BEGIN;

CREATE TYPE "payment_methods_new" AS ENUM (
	'bank_card',
	'sbp',
	't_pay',
	'sber_pay',
	'yoomoney',
	'crypto',
	'international_card',
	'yandex_split',
	'telegram_stars'
);

ALTER TABLE "payment_intents"
	ALTER COLUMN "method" TYPE "payment_methods_new"
	USING (
		CASE "method"::text
			WHEN 'crypto_bot' THEN 'crypto'
			WHEN 'heleket' THEN 'crypto'
			ELSE "method"::text
		END
	)::"payment_methods_new";

ALTER TABLE "user_payment_methods"
	ALTER COLUMN "type" TYPE "payment_methods_new"
	USING (
		CASE "type"::text
			WHEN 'crypto_bot' THEN 'crypto'
			WHEN 'heleket' THEN 'crypto'
			ELSE "type"::text
		END
	)::"payment_methods_new";

UPDATE "payment_intents"
SET "metadata" = jsonb_set("metadata", '{checkoutMethod}', '"CRYPTO"'::jsonb)
WHERE "metadata" ->> 'checkoutMethod' IN ('CRYPTO_BOT', 'HELEKET');

ALTER TYPE "payment_methods" RENAME TO "payment_methods_old";
ALTER TYPE "payment_methods_new" RENAME TO "payment_methods";
DROP TYPE "payment_methods_old";

COMMIT;
