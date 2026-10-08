-- CreateEnum
CREATE TYPE "course_access_modes" AS ENUM ('free', 'premium', 'purchase');

-- AlterTable: existing courses keep today's rule - premium or a purchase opens them.
ALTER TABLE "courses" ADD COLUMN     "access_mode" "course_access_modes" NOT NULL DEFAULT 'premium';

-- A free course is never sold, a purchase-only course must have a price.
ALTER TABLE "courses" ADD CONSTRAINT "ck_courses_free_has_no_price"
    CHECK ("access_mode" <> 'free' OR "price" IS NULL);
ALTER TABLE "courses" ADD CONSTRAINT "ck_courses_purchase_has_price"
    CHECK ("access_mode" <> 'purchase' OR "price" > 0);
