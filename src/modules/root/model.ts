import { t } from 'elysia'

import { PaymentMethod } from '@prisma/generated/client'

import { PrismaEnum } from '~/lib/utils/schema'

const AuthFeature = t.Object(
	{
		providers: t.Array(t.String(), {
			description: 'Провайдеры, через которые сейчас можно войти.',
			examples: [['google', 'github', 'discord', 'yandex', 'telegram']]
		})
	},
	{ description: 'Вход через соцсети.' }
)

const PaymentMethodSummary = t.Object({
	id: PrismaEnum(PaymentMethod, {
		description: 'Идентификатор способа - передаётся в `method` при создании платежа.',
		examples: [PaymentMethod.BANK_CARD]
	}),
	name: t.String({ description: 'Название для интерфейса.', examples: ['Банковская карта'] }),
	description: t.String({
		description: 'Пояснение для интерфейса.',
		examples: ['Оплата картой российских банков']
	})
})

const CaptchaFeature = t.Object(
	{
		provider: t.Union([t.Literal('turnstile'), t.Literal('yandex'), t.Literal('none')], {
			description:
				'Какую капчу показывать при регистрации, входе и сбросе пароля. `none` - капча отключена.'
		}),
		key: t.Nullable(
			t.String({
				description: 'Публичный ключ для виджета капчи. `null`, если капча отключена.',
				examples: ['0x4AAAAAAA_example_site_key']
			})
		)
	},
	{ description: 'Капча.' }
)

const OrionFeature = t.Object(
	{
		url: t.String({
			format: 'uri',
			description: 'Адрес файлового хранилища. Файлы доступны по `{url}/{tag}/{id}`.',
			examples: ['https://orion.teacoder.ru']
		})
	},
	{ description: 'Файловое хранилище (аватары, обложки, вложения).' }
)

const Features = t.Object(
	{
		auth: AuthFeature,
		payments: t.Array(PaymentMethodSummary, {
			description: 'Способы оплаты, которые работают прямо сейчас.'
		}),
		captcha: CaptchaFeature,
		orion: OrionFeature
	},
	{ description: 'Возможности, включённые на этом сервере.' }
)

const AppInfo = t.Object(
	{
		url: t.String({
			format: 'uri',
			description: 'Адрес сайта.',
			examples: ['https://teacoder.ru']
		})
	},
	{ description: 'Сайт TeaCoder.' }
)

export const RootResponse = t.Object(
	{
		message: t.String({
			description: 'Приветствие.',
			examples: ["What's up motherfuckers! 🤘"]
		}),
		version: t.String({ description: 'Версия API.', examples: ['1.0.0'] }),
		app: AppInfo,
		features: Features
	},
	{ description: 'Конфигурация для клиента.' }
)

export const HealthResponse = t.Object(
	{
		status: t.Union([t.Literal('operational'), t.Literal('degraded')], {
			description: '`operational` - всё работает, `degraded` - недоступна база или Redis.'
		}),
		database: t.Boolean({ description: 'Отвечает ли PostgreSQL.' }),
		cache: t.Boolean({ description: 'Отвечает ли Redis.' }),
		timestamp: t.String({
			description: 'Время сервера в формате ISO 8601.',
			examples: ['2026-07-04T14:16:54.000Z']
		})
	},
	{ description: 'Состояние сервиса.' }
)
