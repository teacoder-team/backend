CREATE TYPE "course_stages" AS ENUM ('draft', 'in_production', 'completed', 'archived');

ALTER TABLE "courses"
	ADD COLUMN "stage" "course_stages" NOT NULL DEFAULT 'draft';

UPDATE "courses" SET "stage" = 'completed' WHERE "is_published";

ALTER TABLE "courses"
	ADD CONSTRAINT "ck_courses_draft_not_published" CHECK ("stage" <> 'draft' OR NOT "is_published");

DROP INDEX "ix_courses_is_published_created_at";

CREATE INDEX "ix_courses_is_published_stage_created_at"
	ON "courses" ("is_published", "stage", "created_at" DESC);

ALTER TABLE "lessons"
	ADD COLUMN "is_announced" BOOLEAN NOT NULL DEFAULT false,
	ADD COLUMN "planned_release_at" TIMESTAMP(3);

CREATE INDEX "ix_lessons_course_id_is_announced_position"
	ON "lessons" ("course_id", "is_announced", "position");
