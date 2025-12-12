import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { users } from './users.schema'

export const passwordResets = pgTable('password_resets', {
	id: uuid('id').primaryKey().defaultRandom(),

	token: varchar('token', { length: 255 }).notNull().unique(),
	expiry: timestamp('expiry').notNull(),

	userId: uuid('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
