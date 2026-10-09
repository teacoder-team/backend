import { createHash, randomUUID } from 'node:crypto'

import { HttpError } from '@teacoder/http'
import {
	type ChatTarget,
	customEmoji,
	formatChatTarget,
	type HtmlValue,
	joinHtml,
	tg
} from '@teacoder/telegram'

import { UserRole } from '@prisma/generated/client'

import { env } from '~/config/env'
import { PAYMENT_METHODS, PAYMENT_PROVIDER_NAMES } from '~/config/payments'
import { AppError } from '~/lib/errors'
import { AUTH_PROVIDER_TITLES } from '~/lib/integrations/oauth'
import { adminNotifier } from '~/lib/integrations/telegram'
import { logContext, logger } from '~/lib/logger'
import { notificationsQueue } from '~/lib/queue/queues'
import { redis } from '~/lib/redis'
import { formatDate, formatDateTime } from '~/lib/utils/date'
import { truncateText } from '~/lib/utils/email-text'

import type {
	NotificationJobs,
	PaymentErrorContext,
	PaymentErrorNotification,
	SignUpMethod,
	SupportEmail
} from './model'
import type {
	PurchasedCourse,
	PurchaseDetails,
	RegistrationDetails,
	SupportSender,
	VisitorAccount
} from './repository'

const enqueue = async <Name extends keyof NotificationJobs>(
	name: Name,
	payload: NotificationJobs[Name]
) => {
	if (!adminNotifier) {
		return
	}

	await notificationsQueue.add(name, payload).catch((err: unknown) => {
		logger.warn({ context: 'admin_bot', job: name, err }, 'admin_notification_enqueue_failed')
	})
}

export const enqueueCoursePurchaseNotification = (
	payload: NotificationJobs['notifyCoursePurchase']
) => enqueue('notifyCoursePurchase', payload)

export const enqueueRegistrationNotification = (payload: NotificationJobs['notifyRegistration']) =>
	enqueue('notifyRegistration', payload)

export const enqueueSubscriptionPurchaseNotification = (
	payload: NotificationJobs['notifySubscriptionPurchase']
) => enqueue('notifySubscriptionPurchase', payload)

export const enqueueSubscriptionRenewalNotification = (
	payload: NotificationJobs['notifySubscriptionRenewal']
) => enqueue('notifySubscriptionRenewal', payload)

export const enqueueSupportEmailNotification = (payload: NotificationJobs['notifySupportEmail']) =>
	enqueue('notifySupportEmail', payload)

const errorDetails = (error: unknown) => {
	const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error
	const errorName = cause instanceof Error ? cause.name : 'UnknownError'
	const errorCode =
		cause instanceof Error && 'code' in cause && typeof cause.code === 'string'
			? truncateText(cause.code, 40)
			: undefined

	if (cause instanceof HttpError) {
		const host = URL.canParse(cause.url) ? new URL(cause.url).hostname : 'payment provider'

		return { errorName, errorCode, reason: `HTTP ${cause.status} from ${host}` }
	}

	if (cause instanceof AppError) {
		return { errorName, errorCode, reason: truncateText(cause.message, 500) }
	}

	return { errorName, errorCode, reason: 'Internal error; check the request logs' }
}

export const enqueuePaymentErrorNotification = async (context: PaymentErrorContext) => {
	if (!adminNotifier) {
		return
	}

	try {
		const { error, ...fields } = context
		const details = errorDetails(error)
		const payload: PaymentErrorNotification = {
			...fields,
			requestId: context.requestId ?? logContext.getStore()?.requestId,
			...details,
			occurredAt: new Date().toISOString()
		}
		const fingerprint = createHash('sha256')
			.update(
				JSON.stringify([
					payload.source,
					payload.provider,
					payload.paymentId ?? payload.userId,
					payload.status,
					payload.errorName,
					payload.errorCode,
					payload.reason
				])
			)
			.digest('hex')
		const key = `admin-alert:payment:${fingerprint}`
		const claim = randomUUID()
		const claimed = await redis.set(key, claim, 'EX', 60, 'NX')

		if (!claimed) {
			return
		}

		try {
			await notificationsQueue.add('notifyPaymentError', payload)
		} catch (err) {
			await redis.eval(
				`if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
end
return 0`,
				1,
				key,
				claim
			)

			throw err
		}
	} catch (err) {
		logger.warn(
			{ context: 'admin_bot', source: context.source, err },
			'payment_error_notification_enqueue_failed'
		)
	}
}

const DAY_MS = 24 * 60 * 60 * 1000

const relativeFormat = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })

const CHAT_TYPE_NAMES: Record<string, string> = {
	private: 'личный чат',
	group: 'группа',
	supergroup: 'группа',
	channel: 'канал'
}

const formatAge = (date: Date, now = new Date()) => {
	const days = Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_MS))

	if (days < 30) {
		return relativeFormat.format(-days, 'day')
	}

	if (days < 365) {
		return relativeFormat.format(-Math.floor(days / 30), 'month')
	}

	return relativeFormat.format(-Math.floor(days / 365), 'year')
}

const formatMoney = (amount: number, currency: string) => {
	try {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(amount)
	} catch {
		return `${amount} ${currency}`
	}
}

type Row = readonly [label: string, value: HtmlValue]

const isShown = (value: HtmlValue) =>
	value !== null && value !== undefined && value !== false && value !== ''

const tree = (rows: readonly Row[]) => {
	const shown = rows.filter(([, value]) => isShown(value))

	return joinHtml(
		shown.map(
			([label, value], index) =>
				tg`${index === shown.length - 1 ? '└' : '├'} <b>${label}:</b> ${value}`
		)
	)
}

const section = (title: HtmlValue, rows: readonly Row[]) => tg`<b>${title}</b>\n${tree(rows)}`

const EMOJI = {
	signUp: customEmoji('5382357040008021292', '🆕'),
	user: customEmoji('5193018431875587270', '👤'),
	device: customEmoji('5444965061749644170', '👨‍💻'),
	time: customEmoji('5382194935057372936', '⏱')
}

const code = (value: string | null | undefined) => value && tg`<code>${value}</code>`

export const paymentErrorMessage = (failure: PaymentErrorNotification) =>
	joinHtml(
		[
			tg`🚨 <b>${failure.source === 'CREATE_PAYMENT' ? 'Ошибка создания платежа' : 'Ошибка обработки вебхука'}</b>`,
			section('Контекст', [
				['Среда', env.NODE_ENV],
				['Провайдер', failure.provider],
				['Маршрут', code(failure.path)],
				['Платёж', code(failure.paymentId)],
				['ID провайдера', code(failure.pspIntentId)],
				['Вебхук', code(failure.webhookId)],
				['Пользователь', code(failure.userId)],
				['Request ID', code(failure.requestId)]
			]),
			section('Ошибка', [
				['HTTP-статус', failure.status],
				['Тип', failure.errorName],
				['Код', failure.errorCode],
				['Причина', failure.reason]
			]),
			tg`${formatDateTime(new Date(failure.occurredAt))}\n#платежи #ошибка`
		],
		'\n\n'
	)

export interface CoursePurchaseMessageInput {
	purchase: PurchaseDetails
	course: PurchasedCourse | null
	email: string | null
	hasPremium: boolean
}

const signInMethods = (user: PurchaseDetails['user']) => {
	const methods = [
		user.passwordCredential ? 'почта и пароль' : null,
		...user.oauthAccounts.map((account) => AUTH_PROVIDER_TITLES[account.provider])
	].filter(Boolean)

	return methods.length ? methods.join(', ') : '—'
}

const buyerSection = (user: PurchaseDetails['user'], email: string | null) =>
	section('👤 Покупатель', [
		[
			'Имя',
			user.role === UserRole.ADMIN
				? tg`${user.displayName} <i>(администратор)</i>`
				: user.displayName
		],
		['Почта', email],
		['Вход', signInMethods(user)],
		['Регистрация', `${formatDate(user.createdAt)} (${formatAge(user.createdAt)})`],
		['Последний вход', user.lastLoginAt && formatDateTime(user.lastLoginAt)],
		['Куплено курсов', user._count.coursePurchases]
	])

const monthsPlural = new Intl.PluralRules('ru')

const MONTH_FORMS: Record<string, string> = {
	one: 'месяц',
	few: 'месяца',
	many: 'месяцев',
	other: 'месяца'
}

const formatMonths = (months: number) => `${months} ${MONTH_FORMS[monthsPlural.select(months)]}`

export interface SubscriptionPurchaseMessageInput {
	purchase: PurchaseDetails
	email: string | null
	months: number

	previousExpiresAt: Date | null
}

export const subscriptionPurchaseMessage = ({
	purchase,
	email,
	months,
	previousExpiresAt
}: SubscriptionPurchaseMessageInput) => {
	const { user } = purchase
	const amount = formatMoney(purchase.amount, purchase.currency)
	const method = PAYMENT_METHODS[purchase.method]?.name ?? purchase.method
	const subscription = user.subscription

	const heading = previousExpiresAt
		? tg`🔁 <b>Продление подписки</b>`
		: tg`💎 <b>Новая подписка</b>`

	const term = section('⭐ Премиум', [
		['Период', formatMonths(months)],
		['Действует до', subscription && tg`<b>${formatDate(subscription.expiresAt)}</b>`],
		['Было до', previousExpiresAt && formatDate(previousExpiresAt)],
		['Непрерывно с', subscription && formatDate(subscription.startedAt)],
		['Оплат подписки', user._count.payments]
	])

	const payment = section('💳 Платёж', [
		['Сумма', tg`<b>${amount}</b>`],
		['Способ', method],
		['Провайдер', PAYMENT_PROVIDER_NAMES[purchase.provider]],
		['Создан', formatDateTime(purchase.createdAt)],
		['ID', code(purchase.id)],
		['У провайдера', code(purchase.pspIntentId)]
	])

	const tags = [
		'#подписка',
		previousExpiresAt ? '#продление' : '#новая',
		`#${purchase.provider.toLowerCase()}`
	]

	return joinHtml(
		[
			heading,
			tg`💰 <b>${amount}</b> · ${method}`,
			term,
			buyerSection(user, email),
			payment,
			tg`🕒 Оплачен ${formatDateTime(purchase.updatedAt)}\n${tags.join(' ')}`
		],
		'\n\n'
	)
}

const DECLINE_REASONS: Record<string, string> = {
	insufficient_funds: 'недостаточно средств',
	card_expired: 'истёк срок карты',
	issuer_unavailable: 'банк не ответил',
	payment_method_limit_exceeded: 'превышен лимит',
	payment_method_restricted: 'операции по карте запрещены',
	permission_revoked: 'автоплатежи отозваны пользователем',
	fraud_suspected: 'подозрение на мошенничество',
	general_decline: 'отказ без объяснения причин',
	no_saved_payment_method: 'нет сохранённой карты'
}

const declineReason = (code: string | null) => (code ? (DECLINE_REASONS[code] ?? code) : '—')

const cardLabel = (method: PurchaseDetails['paymentMethod']) =>
	method && (method.title ?? (method.last4 ? `карта •••• ${method.last4}` : null))

export interface SubscriptionRenewalMessageInput {
	purchase: PurchaseDetails
	email: string | null
	outcome: 'charged' | 'declined'
}

export const subscriptionRenewalMessage = ({
	purchase,
	email,
	outcome
}: SubscriptionRenewalMessageInput) => {
	const { user } = purchase
	const amount = formatMoney(purchase.amount, purchase.currency)
	const charged = outcome === 'charged'

	const result = charged
		? section('⭐ Премиум', [
				[
					'Действует до',
					user.subscription && tg`<b>${formatDate(user.subscription.expiresAt)}</b>`
				],
				['Непрерывно с', user.subscription && formatDate(user.subscription.startedAt)],
				['Оплат подписки', user._count.payments]
			])
		: section('⛔ Итог', [
				['Причина', declineReason(purchase.failureCode)],
				['Подписка', 'завершена, автопродление выключено'],
				['Повторных попыток', 'не будет']
			])

	const payment = section('💳 Платёж', [
		['Сумма', tg`<b>${amount}</b>`],
		['Карта', cardLabel(purchase.paymentMethod)],
		['Провайдер', PAYMENT_PROVIDER_NAMES[purchase.provider]],
		['ID', code(purchase.id)],
		['У провайдера', code(purchase.pspIntentId)]
	])

	const tags = ['#подписка', '#автосписание', charged ? '#успех' : '#отказ']

	return joinHtml(
		[
			charged
				? tg`🔄 <b>Автосписание за подписку</b>\n💰 <b>${amount}</b>`
				: tg`❌ <b>Автосписание не прошло</b>\n💸 ${amount} не списано`,
			result,
			buyerSection(user, email),
			payment,
			tg`🕒 ${formatDateTime(purchase.updatedAt)}\n${tags.join(' ')}`
		],
		'\n\n'
	)
}

export const coursePurchaseMessage = ({
	purchase,
	course,
	email,
	hasPremium
}: CoursePurchaseMessageInput) => {
	const { user } = purchase
	const amount = formatMoney(purchase.amount, purchase.currency)
	const method = PAYMENT_METHODS[purchase.method]?.name ?? purchase.method
	const coursePrice = course && course.price !== null ? Number(course.price) : null

	const courseLine = course
		? tg`📚 <b><a href="${env.APP_URL}/courses/${course.slug}">${course.title}</a></b>`
		: tg`📚 <i>Курс удалён</i>`

	const buyer = buyerSection(user, email)

	const payment = section('💳 Платёж', [
		['Сумма', tg`<b>${amount}</b>`],
		[
			'Цена курса сейчас',
			coursePrice !== null && coursePrice !== purchase.amount
				? formatMoney(coursePrice, purchase.currency)
				: null
		],
		['Способ', method],
		['Провайдер', PAYMENT_PROVIDER_NAMES[purchase.provider]],
		['Создан', formatDateTime(purchase.createdAt)],
		['ID', code(purchase.id)],
		['У провайдера', code(purchase.pspIntentId)]
	])

	const tags = ['#покупка', '#курс', `#${purchase.provider.toLowerCase()}`]

	return joinHtml(
		[
			tg`🎉 <b>Новая покупка курса</b>`,
			tg`${courseLine}\n💰 <b>${amount}</b> · ${method}`,
			buyer,
			payment,
			tg`🕒 Оплачен ${formatDateTime(purchase.updatedAt)}\n${tags.join(' ')}`
		],
		'\n\n'
	)
}

export interface RegistrationMessageInput {
	user: RegistrationDetails
	email: string | null
	via: SignUpMethod

	sameDevice: readonly VisitorAccount[]
}

const SAME_DEVICE_SHOWN = 5

const sameDeviceList = (accounts: readonly VisitorAccount[]) => {
	const shown = accounts
		.slice(0, SAME_DEVICE_SHOWN)
		.map((account) => tg`${account.displayName} (<code>@${account.username}</code>)`)
	const rest = accounts.length - shown.length

	return tg`⚠️ <b>${accounts.length}</b>: ${joinHtml(shown, ', ')}${rest > 0 && ` и ещё ${rest}`}`
}

export const registrationMessage = ({ user, email, via, sameDevice }: RegistrationMessageInput) => {
	const session = user.sessions[0]
	const tags = [
		'#регистрация',
		`#${via.toLowerCase()}`,
		sameDevice.length > 0 && '#мультиаккаунт'
	]

	return joinHtml(
		[
			tg`${EMOJI.signUp} <b>Новая регистрация</b>`,
			section(tg`${EMOJI.user} Пользователь`, [
				['Имя', user.displayName],
				['Почта', email],
				['Способ', via === 'EMAIL' ? 'почта и пароль' : AUTH_PROVIDER_TITLES[via]]
			]),
			session &&
				section(tg`${EMOJI.device} Устройство`, [
					['IP', code(session.ip)],
					['Страна', session.country],
					['Город', session.city],
					['ОС', session.os],
					['Браузер', session.browser],
					['Fingerprint', code(session.visitorId)],
					['Другие аккаунты', sameDevice.length > 0 && sameDeviceList(sameDevice)]
				]),
			tg`${EMOJI.time} ${formatDateTime(session?.createdAt ?? user.createdAt)}\n${joinHtml(tags, ' ')}`
		],
		'\n\n'
	)
}

export interface StartMessageInput {
	target: ChatTarget
	chatType: string

	delivers: boolean
}

const chatKind = ({ target, chatType }: StartMessageInput) =>
	target.threadId ? 'тема в группе' : (CHAT_TYPE_NAMES[chatType] ?? chatType)

export const startMessage = (input: StartMessageInput) =>
	joinHtml(
		[
			tg`👋 <b>Админ-бот TeaCoder</b>`,
			tg`Сюда приходят служебные уведомления платформы`,
			section('💬 Этот чат', [
				['Тип', chatKind(input)],
				['ID', code(formatChatTarget(input.target))]
			]),
			tg`🌐 <a href="${env.APP_URL}">Сайт</a> · окружение: <code>${env.NODE_ENV}</code>`
		],
		'\n\n'
	)

export const accessDeniedMessage = (target: ChatTarget) =>
	joinHtml(
		[
			tg`🔒 <b>Служебный бот TeaCoder</b>`,
			tg`Бот работает только для команды TeaCoder. Чтобы получать уведомления здесь, передайте этот ID администратору:`,
			code(formatChatTarget(target))
		],
		'\n\n'
	)

const SUPPORT_BODY_MAX = 2000
const SUPPORT_SUBJECT_MAX = 200
const SUPPORT_ATTACHMENTS_SHOWN = 5

const AUTH_CHECKS = ['spf', 'dkim', 'dmarc'] as const

const formatBytes = (bytes: number) => {
	if (bytes < 1024) {
		return `${bytes} Б`
	}

	if (bytes < 1024 * 1024) {
		return `${Math.round(bytes / 1024)} КБ`
	}

	return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}

export interface SupportEmailMessageInput {
	email: SupportEmail

	sender: SupportSender | null
}

const senderAccount = (sender: SupportSender | null, verified: boolean) => {
	if (!sender) {
		return [['Аккаунт', tg`<i>не найден</i>`]] as const
	}

	const premium = sender.subscription?.isActive
		? `до ${formatDate(sender.subscription.expiresAt)}`
		: 'нет'

	return [
		[
			verified ? 'Аккаунт' : 'Аккаунт (адрес не подтверждён)',
			tg`${sender.displayName} (<code>@${sender.username}</code>)${sender.role === UserRole.ADMIN && tg` <i>(администратор)</i>`}`
		],
		['Регистрация', `${formatDate(sender.createdAt)} (${formatAge(sender.createdAt)})`],
		['Премиум', premium],
		['Куплено курсов', sender._count.coursePurchases]
	] as const
}

const attachmentList = (attachments: SupportEmail['attachments']) => {
	const shown = attachments.slice(0, SUPPORT_ATTACHMENTS_SHOWN)
	const rest = attachments.length - shown.length
	const lines = [
		...shown.map((file) => `${file.filename ?? 'без имени'} · ${formatBytes(file.size)}`),
		...(rest > 0 ? [`и ещё ${rest} - смотрите в Resend`] : [])
	]

	return tg`<b>📎 Вложения (${attachments.length})</b>\n${joinHtml(
		lines.map((line, index) => tg`${index === lines.length - 1 ? '└' : '├'} ${line}`)
	)}`
}

const spoofWarning = (authentication: SupportEmail['authentication']) => {
	if (!authentication || authentication.dmarc === 'pass') {
		return null
	}

	const checks = AUTH_CHECKS.map((check) => `${check.toUpperCase()} ${authentication[check]}`)

	return tg`⚠️ <b>Отправитель не подтверждён</b> (${checks.join(' · ')}) - адрес может быть подделан, не выдавайте данные аккаунта по этому письму`
}

export const supportEmailMessage = ({ email, sender }: SupportEmailMessageInput) => {
	const verified = email.authentication?.dmarc === 'pass'
	const subject = email.subject?.trim()
	const body = truncateText(email.body, SUPPORT_BODY_MAX)

	return joinHtml(
		[
			tg`📨 <b>Обращение в поддержку</b>`,
			subject
				? tg`💬 <b>${truncateText(subject, SUPPORT_SUBJECT_MAX)}</b>`
				: tg`💬 <i>Без темы</i>`,
			section('👤 Отправитель', [
				['Имя', email.fromName],
				['Почта', code(email.from)],
				['Ответ на', email.replyTo !== email.from && code(email.replyTo)],
				...senderAccount(sender, verified)
			]),
			body ? tg`<blockquote expandable>${body}</blockquote>` : tg`<i>Письмо без текста</i>`,
			email.attachments.length > 0 && attachmentList(email.attachments),
			spoofWarning(email.authentication),
			tg`🕒 ${formatDateTime(email.receivedAt)}\n#поддержка`
		],
		'\n\n'
	)
}
