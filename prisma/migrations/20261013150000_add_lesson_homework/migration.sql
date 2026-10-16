ALTER TABLE "lessons"
	ADD COLUMN "homework_task" TEXT,
	ADD COLUMN "homework_checklist" TEXT[] DEFAULT ARRAY[]::TEXT[];
