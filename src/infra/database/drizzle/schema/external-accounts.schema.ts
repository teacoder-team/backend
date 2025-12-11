import { relations } from 'drizzle-orm'
import {
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core'

import { accountProviderEnum } from './enums'
import { users } from './users.schema'

export const externalAccounts = pgTable('external_accounts', {
	id: text('id').primaryKey(),

	provider: accountProviderEnum('provider').notNull(),
	providerAccountId: varchar('provider_account_id', { length: 255 })
		.notNull()
		.unique(),

	refreshToken: text('refresh_token'),
	accessToken: text('access_token'),
	expiry: integer('expiry'),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const externalAccountsRelations = relations(
	externalAccounts,
	({ one }) => ({
		user: one(users, {
			fields: [externalAccounts.userId],
			references: [users.id]
		})
	})
)
