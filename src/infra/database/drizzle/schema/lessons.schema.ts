import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core'

import { courses } from './courses.schema'

export const lessons = pgTable('lessons', {
	id: text('id').primaryKey(),

	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),

	description: text('description'),
	position: integer('position').notNull(),

	kinescopeId: varchar('kinescope_id', { length: 255 }),

	isPublished: boolean('is_published').notNull().default(false),

	courseId: uuid('course_id')
		.notNull()
		.references(() => courses.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
