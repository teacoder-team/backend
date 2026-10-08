-- CreateEnum
CREATE TYPE "webauthn_device_types" AS ENUM ('single_device', 'multi_device');

-- DropForeignKey
ALTER TABLE "multi_factor_authentication" DROP CONSTRAINT "multi_factor_authentication_totp_id_fkey";

-- DropForeignKey
ALTER TABLE "multi_factor_authentication" DROP CONSTRAINT "multi_factor_authentication_user_id_fkey";

-- DropForeignKey
ALTER TABLE "passkeys" DROP CONSTRAINT "passkeys_mfa_id_fkey";

-- DropTable
DROP TABLE "multi_factor_authentication";

-- DropTable
DROP TABLE "passkeys";

-- DropTable
DROP TABLE "totps";

-- DropEnum
DROP TYPE "totp_statuses";

-- CreateTable
CREATE TABLE "totp_authenticators" (
    "id" TEXT NOT NULL,
    "secret_cipher" BYTEA NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "last_used_step" BIGINT,
    "last_used_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "totp_authenticators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recovery_codes" (
    "id" TEXT NOT NULL,
    "code_hash" BYTEA NOT NULL,
    "used_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recovery_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webauthn_credentials" (
    "id" TEXT NOT NULL,
    "credential_id" BYTEA NOT NULL,
    "public_key" BYTEA NOT NULL,
    "sign_count" BIGINT NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "aaguid" TEXT,
    "device_type" "webauthn_device_types" NOT NULL,
    "backed_up" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_totp_authenticators_user_id" ON "totp_authenticators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_recovery_codes_user_id_code_hash" ON "recovery_codes"("user_id", "code_hash");

-- CreateIndex
CREATE INDEX "ix_webauthn_credentials_user_id" ON "webauthn_credentials"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_webauthn_credentials_credential_id" ON "webauthn_credentials"("credential_id");

-- AddForeignKey
ALTER TABLE "totp_authenticators" ADD CONSTRAINT "totp_authenticators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recovery_codes" ADD CONSTRAINT "recovery_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

