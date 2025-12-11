ALTER TABLE "receipts" RENAME COLUMN "total_amount" TO "amount";--> statement-breakpoint
ALTER TABLE "receipts" ALTER COLUMN "status" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "receipts" ALTER COLUMN "status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "receipts" ALTER COLUMN "raw" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "receipts" ALTER COLUMN "fiscal_provider_id" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "receipts" ALTER COLUMN "error_message" SET DEFAULT null;