import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { restrictionReasonEnum, restrictionStatusEnum } from './enums'
import { users } from './users.schema'

export const restrictions = pgTable('restrictions', {
	id: text('id').primaryKey(),

	reason: restrictionReasonEnum('reason').notNull(),
	until: timestamp('until'),

	status: restrictionStatusEnum('status').default('ACTIVE').notNull(),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow()
})
