import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	unique,
	uuid
} from 'drizzle-orm/pg-core'

import { lessons } from './lessons.schema'
import { users } from './users.schema'

export const userProgress = pgTable(
	'user_progress',
	{
		id: text('id').primaryKey(),

		isCompleted: boolean('is_completed').notNull().default(false),

		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		lessonId: uuid('lesson_id')
			.notNull()
			.references(() => lessons.id, { onDelete: 'cascade' }),

		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow()
	},
	table => ({
		userLessonUnique: unique('user_lesson_unique').on(
			table.userId,
			table.lessonId
		),
		lessonIndex: index('lesson_idx').on(table.lessonId)
	})
)
