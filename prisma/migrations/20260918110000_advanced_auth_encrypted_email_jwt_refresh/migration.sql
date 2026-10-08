-- CreateEnum
CREATE TYPE "verification_purposes" AS ENUM ('email_confirm', 'password_reset');

-- CreateEnum
CREATE TYPE "user_statuses" AS ENUM ('pending', 'active');

-- AlterEnum (rename in place - "credentials.provider" keeps using the "_old" type until it's dropped below)
BEGIN;
CREATE TYPE "account_providers_new" AS ENUM ('google', 'github', 'discord', 'telegram', 'yandex');
ALTER TYPE "account_providers" RENAME TO "account_providers_old";
ALTER TYPE "account_providers_new" RENAME TO "account_providers";
COMMIT;

-- DropForeignKey
ALTER TABLE "credentials" DROP CONSTRAINT "credentials_user_id_fkey";

-- DropForeignKey
ALTER TABLE "password_hashes" DROP CONSTRAINT "password_hashes_credential_id_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_credential_id_fkey";

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "device_label" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_cipher" BYTEA,
ADD COLUMN     "email_hash" BYTEA,
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "status" "user_statuses" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "password_credentials" (
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'argon2id',
    "must_change" BOOLEAN NOT NULL DEFAULT false,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_credentials_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" TEXT NOT NULL,
    "provider" "account_providers" NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "purpose" "verification_purposes" NOT NULL,
    "code_hash" BYTEA NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "token_hash" BYTEA NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "session_id" TEXT NOT NULL,
    "replaced_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_oauth_accounts_user_id" ON "oauth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_oauth_accounts_provider_account" ON "oauth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE INDEX "ix_verification_codes_lookup" ON "verification_codes"("user_id", "purpose", "consumed_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_replaced_by_id_key" ON "refresh_tokens"("replaced_by_id");

-- CreateIndex
CREATE INDEX "ix_refresh_tokens_session_id" ON "refresh_tokens"("session_id");

-- CreateIndex
CREATE INDEX "ix_refresh_tokens_family_id" ON "refresh_tokens"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_refresh_tokens_token_hash" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_email_hash" ON "users"("email_hash");

-- AddForeignKey
ALTER TABLE "password_credentials" ADD CONSTRAINT "password_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_replaced_by_id_fkey" FOREIGN KEY ("replaced_by_id") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- MigrateData: preserve existing OAuth links (dev DB has 2, zero password/email credentials to migrate)
INSERT INTO "oauth_accounts" ("id", "user_id", "provider", "provider_account_id", "linked_at")
SELECT "id", "user_id", "provider"::text::"account_providers", "identifier", "created_at"
FROM "credentials"
WHERE "type" = 'oauth';

-- MigrateData: OAuth-only users never needed email verification - the provider already vouches for them
UPDATE "users" SET "status" = 'active'
WHERE "id" IN (SELECT "user_id" FROM "oauth_accounts");

-- DropTable
DROP TABLE "credentials";

-- DropTable
DROP TABLE "password_hashes";

-- DropTable
DROP TABLE "password_reset_tokens";

-- DropEnum
DROP TYPE "account_providers_old";

-- DropEnum
DROP TYPE "credential_types";

-- DropEnum
DROP TYPE "password_reset_statuses";
