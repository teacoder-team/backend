/*
  Warnings:

  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "intent_statuses" AS ENUM ('requires_payment', 'processing', 'captured', 'failed', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "reconciliation_statuses" AS ENUM ('ok', 'mismatch', 'failed');

-- DropForeignKey
ALTER TABLE "course_purchases" DROP CONSTRAINT "course_purchases_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_subscription_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_payment_id_fkey";

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "payment_statuses";

-- CreateTable
CREATE TABLE "payment_intents" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "intent_statuses" NOT NULL DEFAULT 'requires_payment',
    "method" "payment_methods" NOT NULL,
    "provider" "payment_providers" NOT NULL,
    "psp_intent_id" TEXT,
    "psp_payload" JSONB NOT NULL DEFAULT '{}',
    "failure_code" TEXT,
    "idempotency_key" TEXT,
    "invoice_number" SERIAL NOT NULL,
    "course_id" TEXT,
    "metadata" JSONB,
    "user_id" TEXT NOT NULL,
    "payment_method_id" TEXT,
    "subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "psp_name" TEXT NOT NULL,
    "psp_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "signature_ok" BOOLEAN NOT NULL,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3),
    "process_error" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_runs" (
    "id" TEXT NOT NULL,
    "period_date" DATE NOT NULL,
    "psp_total" BIGINT NOT NULL,
    "ledger_total" BIGINT NOT NULL,
    "diff_amount" BIGINT NOT NULL,
    "mismatches" JSONB NOT NULL DEFAULT '[]',
    "status" "reconciliation_statuses" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_intents_idempotency_key" ON "payment_intents"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_intents_invoice_number" ON "payment_intents"("invoice_number");

-- CreateIndex
CREATE INDEX "ix_payment_intents_status_created_at" ON "payment_intents"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ix_payment_intents_subscription_id" ON "payment_intents"("subscription_id");

-- CreateIndex
CREATE INDEX "ix_payment_intents_provider_psp_intent_id" ON "payment_intents"("provider", "psp_intent_id");

-- CreateIndex
CREATE INDEX "ix_payment_intents_course_id_created_at" ON "payment_intents"("course_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_webhook_events_psp_event" ON "webhook_events"("psp_name", "psp_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_reconciliation_runs_period_date" ON "reconciliation_runs"("period_date");

-- AddForeignKey
ALTER TABLE "course_purchases" ADD CONSTRAINT "course_purchases_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "user_payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
