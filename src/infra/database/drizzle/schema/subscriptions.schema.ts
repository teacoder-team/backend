import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users.schema'

export const subscriptions = pgTable('subscriptions', {
	id: text('id').primaryKey(),

	startedAt: timestamp('started_at').defaultNow(),
	expiresAt: timestamp('expires_at'),

	isActive: boolean('is_active').default(true).notNull(),

	userId: uuid('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
