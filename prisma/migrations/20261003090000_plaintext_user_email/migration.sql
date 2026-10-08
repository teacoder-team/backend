-- AlterTable
ALTER TABLE "users" ADD COLUMN "email" TEXT;

-- DropIndex
DROP INDEX "uq_users_email_hash";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email_cipher",
DROP COLUMN "email_hash";

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_email" ON "users"("email");
