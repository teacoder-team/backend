ALTER TABLE payments
    ALTER COLUMN id TYPE uuid USING id::uuid;
