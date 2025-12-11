import {
	integer,
	jsonb,
	numeric,
	pgTable,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core'

import { paymentMethodEnum, paymentStatusEnum } from './enums'
import { subscriptions } from './subscriptions.schema'
import { userPaymentMethods } from './user-payment-methods.schema'
import { users } from './users.schema'

export const payments = pgTable('payments', {
	id: uuid('id').primaryKey().defaultRandom(),

	amount: numeric('amount').notNull(),
	currency: varchar('currency', { length: 20 }).notNull(),

	status: paymentStatusEnum('status').notNull().default('PENDING'),
	method: paymentMethodEnum('method').notNull(),

	providerPaymentId: varchar('provider_payment_id', {
		length: 255
	}).default(null),
	invoiceId: varchar('invoice_id').default(null),

	metadata: jsonb('metadata').default(null),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	paymentMethodId: uuid('payment_method_id')
		.references(() => userPaymentMethods.id)
		.default(null),
	subscriptionId: uuid('subscription_id')
		.references(() => subscriptions.id)
		.default(null),

	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
})
