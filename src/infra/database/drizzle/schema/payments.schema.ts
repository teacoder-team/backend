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

	providerPaymentId: varchar('provider_payment_id', { length: 255 }),
	invoiceId: integer('invoice_id'),

	metadata: jsonb('metadata'),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	paymentMethodId: uuid('payment_method_id').references(
		() => userPaymentMethods.id
	),

	subscriptionId: uuid('subscription_id').references(() => subscriptions.id),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
