import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core'

import { paymentMethodEnum, paymentProviderEnum } from './enums'
import { users } from './users.schema'

export const userPaymentMethods = pgTable('user_payment_methods', {
	id: uuid('id').primaryKey().defaultRandom(),

	title: varchar('title', { length: 255 }),

	type: paymentMethodEnum('type').notNull(),
	provider: paymentProviderEnum('provider').notNull(),

	providerId: varchar('provider_id', { length: 255 }).notNull().unique(),

	last4: varchar('last4', { length: 4 }),
	first6: varchar('first6', { length: 6 }),
	expiryMonth: integer('expiry_month'),
	expiryYear: integer('expiry_year'),
	cardType: varchar('card_type', { length: 255 }),

	isActive: boolean('is_active').default(true).notNull(),

	metadata: jsonb('metadata'),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
