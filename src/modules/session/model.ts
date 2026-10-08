import { t } from 'elysia'

const Detected = (description: string, examples: string[]) =>
	t.Nullable(t.String({ description, examples }))

export const SessionResponse = t.Object(
	{
		id: t.String({
			description: 'Идентификатор сессии.',
			examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
		}),
		ip: t.String({
			description: 'IP-адрес, с которого выполнен вход.',
			examples: ['104.28.225.185']
		}),
		friendlyName: Detected('Браузер и система, если их удалось определить.', [
			'Chrome on Windows'
		]),
		country: Detected('Страна по IP.', ['Россия']),
		city: Detected('Город по IP.', ['Москва']),
		current: t.Boolean({ description: 'Это сессия, из которой сделан запрос.' }),
		lastSeenAt: t.String({
			description: 'Когда сессия последний раз обращалась к API.',
			examples: ['2026-07-04T14:16:54.000Z']
		}),
		createdAt: t.String({
			description: 'Когда выполнен вход.',
			examples: ['2026-07-04T14:16:54.000Z']
		})
	},
	{ description: 'Устройство, на котором выполнен вход.' }
)

export const SessionListResponse = t.Array(SessionResponse, {
	description: 'Активные сессии аккаунта.'
})

export const RevokeResponse = t.Object(
	{
		revoked: t.Number({ description: 'Сколько сессий завершено.', examples: [1] })
	},
	{ description: 'Результат завершения сессий.' }
)

export const SessionParams = t.Object({
	id: t.String({ description: 'Идентификатор сессии, которую нужно завершить.' })
})
