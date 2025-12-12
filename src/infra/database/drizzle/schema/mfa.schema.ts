import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { totpStatusEnum } from './enums'
import { users } from './users.schema'

export const totps = pgTable('totps', {
	id: uuid('id').primaryKey().defaultRandom(),
	status: totpStatusEnum('status').default('DISABLED').notNull(),
	secret: varchar('secret', { length: 255 }),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const mfa = pgTable('multi_factor_authentication', {
	id: uuid('id').primaryKey().defaultRandom(),

	recoveryCodes: text('recovery_codes').array().notNull().default([]),
	currentChallenge: varchar('current_challenge', { length: 255 }),

	totpId: uuid('totp_id')
		.unique()
		.references(() => totps.id, {
			onDelete: 'cascade'
		}),

	userId: uuid('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
