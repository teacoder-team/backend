ALTER TABLE "payments" ALTER COLUMN "provider_payment_id" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "metadata" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "payment_method_id" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "subscription_id" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "invoice_id";