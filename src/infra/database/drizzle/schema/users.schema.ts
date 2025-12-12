import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core'

import { userRoleEnum } from './enums'

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),

	email: varchar('email', { length: 255 }).unique(),
	password: varchar('password', { length: 255 }),

	username: varchar('username', { length: 255 }).notNull().unique(),
	displayName: varchar('display_name', { length: 255 }),

	avatar: text('avatar'),
	points: integer('points').notNull().default(0),

	role: userRoleEnum('role').notNull().default('STUDENT'),

	isAutoBilling: boolean('is_auto_billing').notNull().default(false),

	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
})
