/*
  Warnings:

  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `credentials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `download_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lessons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `multi_factor_authentication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `passkeys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `password_hashes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `password_reset_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `receipts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `restrictions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `totps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_payment_methods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "credentials" DROP CONSTRAINT "credentials_user_id_fkey";

-- DropForeignKey
ALTER TABLE "download_logs" DROP CONSTRAINT "download_logs_course_id_fkey";

-- DropForeignKey
ALTER TABLE "download_logs" DROP CONSTRAINT "download_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_course_id_fkey";

-- DropForeignKey
ALTER TABLE "multi_factor_authentication" DROP CONSTRAINT "multi_factor_authentication_totp_id_fkey";

-- DropForeignKey
ALTER TABLE "multi_factor_authentication" DROP CONSTRAINT "multi_factor_authentication_user_id_fkey";

-- DropForeignKey
ALTER TABLE "passkeys" DROP CONSTRAINT "passkeys_mfa_id_fkey";

-- DropForeignKey
ALTER TABLE "password_hashes" DROP CONSTRAINT "password_hashes_credential_id_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_credential_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_subscription_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "restrictions" DROP CONSTRAINT "restrictions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_payment_methods" DROP CONSTRAINT "user_payment_methods_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_user_id_fkey";

-- DropTable
DROP TABLE "courses";

-- DropTable
DROP TABLE "credentials";

-- DropTable
DROP TABLE "download_logs";

-- DropTable
DROP TABLE "lessons";

-- DropTable
DROP TABLE "multi_factor_authentication";

-- DropTable
DROP TABLE "passkeys";

-- DropTable
DROP TABLE "password_hashes";

-- DropTable
DROP TABLE "password_reset_tokens";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "profiles";

-- DropTable
DROP TABLE "receipts";

-- DropTable
DROP TABLE "restrictions";

-- DropTable
DROP TABLE "subscriptions";

-- DropTable
DROP TABLE "totps";

-- DropTable
DROP TABLE "user_payment_methods";

-- DropTable
DROP TABLE "user_progress";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "CredentialType";

-- DropEnum
DROP TYPE "PasswordResetStatus";

-- DropEnum
DROP TYPE "account_providers";

-- DropEnum
DROP TYPE "payment_methods";

-- DropEnum
DROP TYPE "payment_providers";

-- DropEnum
DROP TYPE "payment_statuses";

-- DropEnum
DROP TYPE "receipt_statuses";

-- DropEnum
DROP TYPE "restriction_reasons";

-- DropEnum
DROP TYPE "restriction_statuses";

-- DropEnum
DROP TYPE "totp_statuses";

-- DropEnum
DROP TYPE "user_roles";
