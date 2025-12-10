import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { emailVerificationStatusEnum } from './enums'
import { users } from './users.schema'

export const emailVerification = pgTable('email_verification', {
	id: uuid('id').primaryKey().defaultRandom(),

	token: varchar('token', { length: 255 }).notNull().unique(),
	expiry: timestamp('expiry'),

	status: emailVerificationStatusEnum('status').default('PENDING').notNull(),

	userId: uuid('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
