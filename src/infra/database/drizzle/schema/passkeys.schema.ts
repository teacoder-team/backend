import {
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core'

import { mfa } from './mfa.schema'

export const passkeys = pgTable('passkeys', {
	id: text('id').primaryKey(),

	deviceName: varchar('device_name', { length: 255 }).notNull(),
	credentialId: varchar('credential_id', { length: 500 }).unique().notNull(),
	publicKey: text('public_key').notNull(),

	counter: integer('counter').notNull().default(0),
	transports: text('transports').array().notNull(),

	lastUsedAt: timestamp('last_used_at'),

	ip: varchar('ip', { length: 255 }).notNull(),
	userAgent: varchar('user_agent', { length: 500 }).notNull(),

	mfaId: uuid('mfa_id')
		.notNull()
		.references(() => mfa.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
