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
import { AUTH_PROVIDER_TITLES } from '~/lib/integrations/oauth'
import { formatDate, formatDateTime } from '~/lib/utils/date'
import { PAYMENT_PROVIDER_NAMES, paymentMethodName } from '~/modules/billing/service'

import type { SignUpMethod } from './queue'
import type {
	PurchasedCourse,
	PurchaseDetails,
	RegistrationDetails,
	VisitorAccount
} from './repository'

const DAY_MS = 24 * 60 * 60 * 1000

const relativeFormat = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })

const CHAT_TYPE_NAMES: Record<string, string> = {
	private: 'личный чат',
	group: 'группа',
	supergroup: 'группа',
	channel: 'канал'
}

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

export interface RegistrationMessageInput {
	user: RegistrationDetails
	email: string | null
	via: SignUpMethod
	/** Other accounts already seen on the same Fingerprint visitor. */
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
