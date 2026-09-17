-- Renames enum labels to lowercase to match the @map added on each value,
-- renames two enum types to snake_case, and gives the remaining default-named
-- unique constraints explicit uq_ names. RENAME VALUE / RENAME TYPE / RENAME
-- CONSTRAINT are all catalog-only changes: no table is rewritten, no data moves.

-- account_providers
ALTER TYPE "account_providers" RENAME VALUE 'EMAIL' TO 'email';
ALTER TYPE "account_providers" RENAME VALUE 'GOOGLE' TO 'google';
ALTER TYPE "account_providers" RENAME VALUE 'GITHUB' TO 'github';
ALTER TYPE "account_providers" RENAME VALUE 'DISCORD' TO 'discord';
ALTER TYPE "account_providers" RENAME VALUE 'TELEGRAM' TO 'telegram';
ALTER TYPE "account_providers" RENAME VALUE 'YANDEX' TO 'yandex';
ALTER TYPE "account_providers" RENAME VALUE 'GITLAB' TO 'gitlab';

-- CredentialType
ALTER TYPE "CredentialType" RENAME VALUE 'PASSWORD' TO 'password';
ALTER TYPE "CredentialType" RENAME VALUE 'OAUTH' TO 'oauth';

-- PasswordResetStatus
ALTER TYPE "PasswordResetStatus" RENAME VALUE 'PENDING' TO 'pending';
ALTER TYPE "PasswordResetStatus" RENAME VALUE 'USED' TO 'used';
ALTER TYPE "PasswordResetStatus" RENAME VALUE 'EXPIRED' TO 'expired';

-- lesson_access
ALTER TYPE "lesson_access" RENAME VALUE 'FREE' TO 'free';
ALTER TYPE "lesson_access" RENAME VALUE 'PREMIUM' TO 'premium';

-- totp_statuses
ALTER TYPE "totp_statuses" RENAME VALUE 'DISABLED' TO 'disabled';
ALTER TYPE "totp_statuses" RENAME VALUE 'PENDING' TO 'pending';
ALTER TYPE "totp_statuses" RENAME VALUE 'ENABLED' TO 'enabled';

-- restriction_reasons
ALTER TYPE "restriction_reasons" RENAME VALUE 'INAPPROPRIATE_USERNAME' TO 'inappropriate_username';
ALTER TYPE "restriction_reasons" RENAME VALUE 'SPAM' TO 'spam';
ALTER TYPE "restriction_reasons" RENAME VALUE 'OFFENSIVE_BEHAVIOR' TO 'offensive_behavior';

-- restriction_statuses
ALTER TYPE "restriction_statuses" RENAME VALUE 'ACTIVE' TO 'active';
ALTER TYPE "restriction_statuses" RENAME VALUE 'EXPIRED' TO 'expired';
ALTER TYPE "restriction_statuses" RENAME VALUE 'CANCELED' TO 'canceled';

-- payment_statuses
ALTER TYPE "payment_statuses" RENAME VALUE 'PENDING' TO 'pending';
ALTER TYPE "payment_statuses" RENAME VALUE 'SUCCESS' TO 'success';
ALTER TYPE "payment_statuses" RENAME VALUE 'FAILED' TO 'failed';

-- receipt_statuses
ALTER TYPE "receipt_statuses" RENAME VALUE 'PENDING' TO 'pending';
ALTER TYPE "receipt_statuses" RENAME VALUE 'SUCCESS' TO 'success';
ALTER TYPE "receipt_statuses" RENAME VALUE 'FAILED' TO 'failed';

-- payment_providers
ALTER TYPE "payment_providers" RENAME VALUE 'YOOKASSA' TO 'yookassa';
ALTER TYPE "payment_providers" RENAME VALUE 'ROBOKASSA' TO 'robokassa';
ALTER TYPE "payment_providers" RENAME VALUE 'PRODAMUS' TO 'prodamus';
ALTER TYPE "payment_providers" RENAME VALUE 'CRYPTO_BOT' TO 'crypto_bot';
ALTER TYPE "payment_providers" RENAME VALUE 'CLOUDPAYMENTS' TO 'cloudpayments';
ALTER TYPE "payment_providers" RENAME VALUE 'TELEGRAM' TO 'telegram';

-- payment_methods
ALTER TYPE "payment_methods" RENAME VALUE 'BANK_CARD' TO 'bank_card';
ALTER TYPE "payment_methods" RENAME VALUE 'SBP' TO 'sbp';
ALTER TYPE "payment_methods" RENAME VALUE 'T_PAY' TO 't_pay';
ALTER TYPE "payment_methods" RENAME VALUE 'SBER_PAY' TO 'sber_pay';
ALTER TYPE "payment_methods" RENAME VALUE 'YOOMONEY' TO 'yoomoney';
ALTER TYPE "payment_methods" RENAME VALUE 'CRYPTO' TO 'crypto';
ALTER TYPE "payment_methods" RENAME VALUE 'INTERNATIONAL_CARD' TO 'international_card';
ALTER TYPE "payment_methods" RENAME VALUE 'TELEGRAM_STARS' TO 'telegram_stars';

-- user_roles
ALTER TYPE "user_roles" RENAME VALUE 'STUDENT' TO 'student';
ALTER TYPE "user_roles" RENAME VALUE 'ADMIN' TO 'admin';

-- Rename the two enum types themselves to match @@map
ALTER TYPE "CredentialType" RENAME TO "credential_types";
ALTER TYPE "PasswordResetStatus" RENAME TO "password_reset_statuses";

-- Give the remaining default-named unique indexes explicit names. These are
-- plain unique indexes rather than named table constraints, so the index
-- itself is what gets renamed (ALTER TABLE ... RENAME CONSTRAINT does not
-- apply — there is no separately-named constraint object here).
ALTER INDEX "courses_slug_key" RENAME TO "uq_courses_slug";
ALTER INDEX "lessons_slug_key" RENAME TO "uq_lessons_slug";
ALTER INDEX "password_reset_tokens_token_key" RENAME TO "uq_password_reset_tokens_token";
ALTER INDEX "multi_factor_authentication_totp_id_key" RENAME TO "uq_multi_factor_authentication_totp_id";
ALTER INDEX "multi_factor_authentication_user_id_key" RENAME TO "uq_multi_factor_authentication_user_id";
ALTER INDEX "passkeys_credential_id_key" RENAME TO "uq_passkeys_credential_id";
ALTER INDEX "user_payment_methods_provider_id_key" RENAME TO "uq_user_payment_methods_provider_id";
ALTER INDEX "subscriptions_user_id_key" RENAME TO "uq_subscriptions_user_id";
