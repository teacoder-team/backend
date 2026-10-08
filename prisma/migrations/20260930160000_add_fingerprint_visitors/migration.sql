-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "visitor_id" TEXT;

-- CreateTable
CREATE TABLE "user_visitors" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_user_visitors_visitor_id" ON "user_visitors"("visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_visitors_user_id_visitor_id" ON "user_visitors"("user_id", "visitor_id");

-- AddForeignKey
ALTER TABLE "user_visitors" ADD CONSTRAINT "user_visitors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
