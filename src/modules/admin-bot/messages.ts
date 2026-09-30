import { type ChatTarget, formatChatTarget, type HtmlValue, joinHtml, tg } from '@teacoder/telegram'

import { AuthProvider, UserRole } from '@prisma/generated/client'

import { env } from '~/config/env'
import { PAYMENT_PROVIDER_NAMES, paymentMethodName } from '~/modules/billing/service'

import type { PurchasedCourse, PurchaseDetails } from './repository'

const TIME_ZONE = 'Europe/Moscow'
const DAY_MS = 24 * 60 * 60 * 1000

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
	timeZone: TIME_ZONE,
	day: 'numeric',
	month: 'long',
	year: 'numeric'
})

const timeFormat = new Intl.DateTimeFormat('ru-RU', {
	timeZone: TIME_ZONE,
	hour: '2-digit',
	minute: '2-digit'
})

const relativeFormat = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })

const SIGN_IN_NAMES: Record<AuthProvider, string> = {
	[AuthProvider.GOOGLE]: 'Google',
	[AuthProvider.GITHUB]: 'GitHub',
	[AuthProvider.DISCORD]: 'Discord',
	[AuthProvider.YANDEX]: 'Яндекс',
	[AuthProvider.TELEGRAM]: 'Telegram'
}

const CHAT_TYPE_NAMES: Record<string, string> = {
	private: 'личный чат',
	group: 'группа',
	supergroup: 'группа',
	channel: 'канал'
}

/** ICU writes "30 сентября 2026 г." - the trailing "г." is noise in a chat message. */
const formatDate = (date: Date) => dateFormat.format(date).replace(/\s*г\.$/, '')

const formatDateTime = (date: Date) => `${formatDate(date)}, ${timeFormat.format(date)} МСК`

/** "сегодня", "вчера", "5 дней назад", "3 месяца назад", "2 года назад". */
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

/** "├ label: value" rows, "└" on the last. Rows without a value are left out. */
const tree = (rows: readonly Row[]) => {
	const shown = rows.filter(([, value]) => isShown(value))

	return joinHtml(
		shown.map(
			([label, value], index) =>
				tg`${index === shown.length - 1 ? '└' : '├'} ${label}: ${value}`
		)
	)
}

const section = (title: string, rows: readonly Row[]) => tg`<b>${title}</b>\n${tree(rows)}`

const code = (value: string | null | undefined) => value && tg`<code>${value}</code>`

export interface CoursePurchaseMessageInput {
	purchase: PurchaseDetails
	course: PurchasedCourse | null
	email: string | null
	hasPremium: boolean
}

const signInMethods = (user: PurchaseDetails['user']) => {
	const methods = [
		user.passwordCredential ? 'почта и пароль' : null,
		...user.oauthAccounts.map((account) => SIGN_IN_NAMES[account.provider])
	].filter(Boolean)

	return methods.length ? methods.join(', ') : '—'
}

export const coursePurchaseMessage = ({
	purchase,
	course,
	email,
	hasPremium
}: CoursePurchaseMessageInput) => {
	const { user } = purchase
	const amount = formatMoney(purchase.amount, purchase.currency)
	const method = paymentMethodName(purchase.method)
	const coursePrice = course && course.price !== null ? Number(course.price) : null

	const courseLine = course
		? tg`📚 <b><a href="${env.APP_URL}/courses/${course.slug}">${course.title}</a></b>`
		: tg`📚 <i>Курс удалён</i>`

	const buyer = section('👤 Покупатель', [
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

export interface StartMessageInput {
	target: ChatTarget
	chatType: string
	/** This exact chat (and topic) is a notification target. */
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
