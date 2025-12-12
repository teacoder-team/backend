import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { courses } from './courses.schema'
import { users } from './users.schema'

export const downloadLogs = pgTable('download_logs', {
	id: uuid('id').primaryKey().defaultRandom(),

	token: varchar('token', { length: 255 }).notNull(),

	ip: varchar('ip', { length: 255 }),
	userAgent: varchar('user_agent', { length: 500 }),

	downloadedAt: timestamp('downloaded_at').defaultNow(),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	courseId: uuid('course_id')
		.notNull()
		.references(() => courses.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
