-- Idempotency keys are chosen by clients, so they only need to be unique per user.
-- A global unique index let one user's key collide with another's and fail with a 500.
DROP INDEX "uq_payment_intents_idempotency_key";

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_intents_user_id_idempotency_key" ON "payment_intents"("user_id", "idempotency_key");

-- Lookup of a user's open checkout for a course (or the subscription, course_id IS NULL).
CREATE INDEX "ix_payment_intents_user_id_course_id_status" ON "payment_intents"("user_id", "course_id", "status");
