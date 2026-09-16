-- CreateEnum
CREATE TYPE "lesson_access" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "access" "lesson_access" NOT NULL DEFAULT 'FREE';

-- CreateIndex
CREATE INDEX "ix_lessons_course_id_access" ON "lessons"("course_id", "access");

