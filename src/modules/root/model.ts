import { t } from 'elysia'

import { PaymentMethod } from '@prisma/generated/client'

import { PrismaEnum } from '~/shared/api'

const AuthFeature = t.Object({
	providers: t.Array(t.String(), {
		description: 'SSO providers currently wired up for login.',
		examples: [['google', 'github', 'discord', 'yandex', 'telegram']]
	})
})

const PaymentMethodSummary = t.Object({
	id: PrismaEnum(PaymentMethod, { examples: [PaymentMethod.BANK_CARD] }),
	name: t.String({ examples: ['Банковская карта'] }),
	description: t.String({ examples: ['Оплата картой российских банков'] })
})

const CaptchaFeature = t.Object({
	provider: t.Union([t.Literal('turnstile'), t.Literal('yandex'), t.Literal('none')], {
		description: 'Which CAPTCHA provider clients must solve a challenge for.'
	}),
	clientKey: t.Nullable(
		t.String({
			description:
				'Public site/client key for rendering the widget. Null when provider is none.',
			examples: ['0x4AAAAAAA_example_site_key']
		})
	)
})

const OrionFeature = t.Object({
	url: t.String({
		format: 'uri',
		description: 'Base URL for uploads and for retrieving files at /:tag/:id.',
		examples: ['https://orion.teacoder.ru']
	})
})

const Features = t.Object({
	auth: AuthFeature,
	payments: t.Array(PaymentMethodSummary),
	captcha: CaptchaFeature,
	orion: OrionFeature
})

const AppInfo = t.Object({
	url: t.String({ format: 'uri', examples: ['https://teacoder.ru'] })
})

export const RootResponse = t.Object({
	message: t.String({
		description: 'A friendly welcome message.',
		examples: ["What's up motherfuckers! 🤘"]
	}),
	version: t.String({ description: 'API version.', examples: ['1.0.0'] }),
	app: AppInfo,
	features: Features
})

export const HealthResponse = t.Object({
	status: t.Union([t.Literal('operational'), t.Literal('degraded')], {
		description: 'Overall state of this instance.'
	}),
	database: t.Boolean({ description: 'Whether PostgreSQL answers.' }),
	cache: t.Boolean({ description: 'Whether Redis answers.' }),
	timestamp: t.String({
		description: 'ISO 8601 formatted server timestamp.',
		examples: ['2026-07-04T14:16:54.000Z']
	})
})
