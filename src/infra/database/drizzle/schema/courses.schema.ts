import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core'

export const courses = pgTable('courses', {
	id: text('id').primaryKey(),

	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),

	shortDescription: text('short_description'),
	fullDescription: text('full_description'),

	thumbnail: text('thumbnail'),

	youtubeUrl: text('youtube_url'),
	attachment: text('attachment'),

	isPublished: boolean('is_published').notNull().default(false),

	views: integer('views').notNull().default(0),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
