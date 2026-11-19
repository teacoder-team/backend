ALTER TABLE "lessons" ADD COLUMN "attachment" TEXT;

ALTER TABLE "download_logs" ADD COLUMN "lesson_id" TEXT;

ALTER TABLE "download_logs"
	ADD CONSTRAINT "fk_download_logs_lesson_id"
	FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ix_download_logs_lesson_id_downloaded_at"
	ON "download_logs" ("lesson_id", "downloaded_at" DESC);
