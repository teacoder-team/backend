-- AlterEnum
ALTER TYPE "payment_providers" ADD VALUE 'heleket';

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "price" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "course_purchases" (
    "id" TEXT NOT NULL,
    "price_paid" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_course_purchases_payment_id" ON "course_purchases"("payment_id");

-- CreateIndex
CREATE INDEX "ix_course_purchases_course_id" ON "course_purchases"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_course_purchases_user_id_course_id" ON "course_purchases"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "course_purchases" ADD CONSTRAINT "course_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_purchases" ADD CONSTRAINT "course_purchases_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_purchases" ADD CONSTRAINT "course_purchases_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
