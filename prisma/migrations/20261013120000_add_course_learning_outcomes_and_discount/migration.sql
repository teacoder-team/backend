ALTER TABLE "courses"
	ADD COLUMN "discount_price" DECIMAL(10,2),
	ADD COLUMN "learning_outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[];
