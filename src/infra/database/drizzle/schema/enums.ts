import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_roles', ['STUDENT', 'ADMIN'])

export const accountProviderEnum = pgEnum('account_providers', [
	'GOOGLE',
	'GITHUB',
	'DISCORD',
	'TELEGRAM',
	'YANDEX'
])

export const emailVerificationStatusEnum = pgEnum(
	'email_verification_statuses',
	['PENDING', 'VERIFIED']
)

export const totpStatusEnum = pgEnum('totp_statuses', [
	'DISABLED',
	'PENDING',
	'ENABLED'
])

export const restrictionReasonEnum = pgEnum('restriction_reasons', [
	'INAPPROPRIATE_USERNAME',
	'SPAM',
	'OFFENSIVE_BEHAVIOR'
])

export const restrictionStatusEnum = pgEnum('restriction_statuses', [
	'ACTIVE',
	'EXPIRED',
	'CANCELED'
])

export const paymentStatusEnum = pgEnum('payment_statuses', [
	'PENDING',
	'SUCCESS',
	'FAILED'
])

export const paymentProviderEnum = pgEnum('payment_providers', [
	'YOOKASSA',
	'ROBOKASSA'
])

export const paymentMethodEnum = pgEnum('payment_methods', [
	'BANK_CARD',
	'SBP',
	'T_PAY',
	'SBER_PAY',
	'YOOMONEY',
	'CRYPTO',
	'INTERNATIONAL_CARD',
	'TELEGRAM_STARS'
])
