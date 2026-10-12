CREATE TABLE "course_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_sections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "uq_course_sections_id_course_id"
    ON "course_sections"("id", "course_id");

CREATE INDEX "ix_course_sections_course_id_position"
    ON "course_sections"("course_id", "position");

ALTER TABLE "course_sections"
    ADD CONSTRAINT "fk_course_sections_course_id"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lessons"
    ADD COLUMN "section_id" TEXT,
    ADD COLUMN "section_course_id" TEXT;

CREATE INDEX "ix_lessons_section_id_is_published_position"
    ON "lessons"("section_id", "is_published", "position");

ALTER TABLE "lessons"
    ADD CONSTRAINT "fk_lessons_section_id_section_course_id"
    FOREIGN KEY ("section_id", "section_course_id")
    REFERENCES "course_sections"("id", "course_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lessons"
    ADD CONSTRAINT "ck_lessons_section_same_course"
    CHECK (
        ("section_id" IS NULL AND "section_course_id" IS NULL)
        OR (
            "section_id" IS NOT NULL
            AND "section_course_id" IS NOT NULL
            AND "section_course_id" = "course_id"
        )
    );
