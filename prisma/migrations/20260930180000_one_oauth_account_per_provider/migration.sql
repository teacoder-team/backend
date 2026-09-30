-- DropIndex
DROP INDEX "ix_oauth_accounts_user_id";

-- CreateIndex
CREATE UNIQUE INDEX "uq_oauth_accounts_user_id_provider" ON "oauth_accounts"("user_id", "provider");
