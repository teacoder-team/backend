-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "invoice_number" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "uq_payments_invoice_number" ON "payments"("invoice_number");

