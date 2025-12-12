import {
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core'

import { payments } from './payments.schema'

export const receipts = pgTable('receipts', {
	id: uuid('id').primaryKey().defaultRandom(),
	paymentId: uuid('payment_id')
		.notNull()
		.references(() => payments.id, { onDelete: 'cascade' }),
	status: varchar('status').notNull().default('PENDING'),
	amount: numeric('amount').notNull(),
	items: jsonb('items').notNull(),
	raw: jsonb('raw').default(null),
	fiscalProviderId: varchar('fiscal_provider_id', { length: 255 }).default(
		null
	),
	errorMessage: varchar('error_message', { length: 500 }).default(null),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
