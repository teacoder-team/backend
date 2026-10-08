/*
  Warnings:

  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `display_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_auto_billing` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `email_verification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `external_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `password_resets` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('PASSWORD', 'OAUTH');

-- CreateEnum
CREATE TYPE "PasswordResetStatus" AS ENUM ('PENDING', 'USED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "email_verification" DROP CONSTRAINT "email_verification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "external_accounts" DROP CONSTRAINT "external_accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "password_resets" DROP CONSTRAINT "password_resets_user_id_fkey";

-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "is_auto_billing" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
DROP COLUMN "display_name",
DROP COLUMN "email",
DROP COLUMN "is_auto_billing",
DROP COLUMN "password",
DROP COLUMN "username";

-- DropTable
DROP TABLE "email_verification";

-- DropTable
DROP TABLE "external_accounts";

-- DropTable
DROP TABLE "password_resets";

-- DropEnum
DROP TYPE "email_verification_statuses";

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "provider" "account_providers" NOT NULL,
    "type" "CredentialType" NOT NULL,
    "identifier" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_hashes" (
    "hash" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "credential_id" TEXT NOT NULL,

    CONSTRAINT "password_hashes_pkey" PRIMARY KEY ("credential_id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "PasswordResetStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "credential_id" TEXT NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "credentials_user_id_idx" ON "credentials"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "credentials_provider_identifier_key" ON "credentials"("provider", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_hashes" ADD CONSTRAINT "password_hashes_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
