import { FormatRegistry, type Static, Type as t } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!FormatRegistry.Has('email')) {
	FormatRegistry.Set('email', (value) => EMAIL_PATTERN.test(value))
}

if (!FormatRegistry.Has('uri')) {
	FormatRegistry.Set('uri', (value) => URL.canParse(value))
}

const envSchema = t.Object({
	NODE_ENV: t.Union([t.Literal('development'), t.Literal('production'), t.Literal('test')], {
		default: 'development'
	}),

	APP_ADDRESS: t.String({ default: '0.0.0.0' }),
	APP_PORT: t.Number({ default: 3000 }),
	APP_PUBLIC_URL: t.String({ format: 'uri' }),

	LOG_LEVEL: t.Union(
		[
			t.Literal('trace'),
			t.Literal('debug'),
			t.Literal('info'),
			t.Literal('warn'),
			t.Literal('error'),
			t.Literal('fatal')
		],
		{ default: 'info' }
	),
	LOG_SAMPLE_RATE: t.Number({ default: 1, minimum: 0, maximum: 1 }),
	LOG_SLOW_REQUEST_MS: t.Number({ default: 1000 }),

	RESOURCES_DIR: t.String({ default: './resources' }),

	JWT_SECRET: t.String({ minLength: 32 }),
	ACCESS_TOKEN_TTL: t.Number({ default: 15 * 60 }),

	EMAIL_ENCRYPTION_KEY: t.String(),
	EMAIL_HASH_KEY: t.String(),
	VERIFICATION_CODE_HASH_KEY: t.String(),

	COOKIE_DOMAIN: t.String({ default: 'localhost' }),
	COOKIE_SECURE: t.Boolean({ default: false }),
	COOKIE_SAMESITE: t.Union([t.Literal('lax'), t.Literal('strict'), t.Literal('none')], {
		default: 'lax'
	}),
	SESSION_TTL: t.Number({ default: 60 * 60 * 24 * 30 }),
	SESSION_CACHE_TTL: t.Number({ default: 15 * 60 }),

	DATABASE_URL: t.String(),
	REDIS_URL: t.String(),

	SMTP_HOST: t.String(),
	SMTP_PORT: t.Number({ default: 587 }),
	SMTP_USERNAME: t.String(),
	SMTP_PASSWORD: t.String(),
	SMTP_SECURE: t.Boolean({ default: false }),

	SMTP_FROM_HELLO: t.String({
		format: 'email',
		default: 'hello@teacoder.ru'
	}),
	SMTP_FROM_NOREPLY: t.String({
		format: 'email',
		default: 'no-reply@teacoder.ru'
	}),

	YOOKASSA_SHOP_ID: t.String(),
	YOOKASSA_SECRET_KEY: t.String(),

	CRYPTO_BOT_TOKEN: t.String(),
	CRYPTO_BOT_TESTNET: t.Boolean({ default: false }),

	TELEGRAM_BOT_TOKEN: t.String(),
	TELEGRAM_WEBHOOK_SECRET: t.String({ minLength: 16 }),

	GOOGLE_CLIENT_ID: t.String(),
	GOOGLE_CLIENT_SECRET: t.String(),

	GITHUB_CLIENT_ID: t.String(),
	GITHUB_CLIENT_SECRET: t.String(),

	DISCORD_CLIENT_ID: t.String(),
	DISCORD_CLIENT_SECRET: t.String(),

	YANDEX_CLIENT_ID: t.String(),
	YANDEX_CLIENT_SECRET: t.String(),

	/** Issued by @BotFather for "Login with Telegram" - not the bot token. */
	TELEGRAM_CLIENT_ID: t.String(),
	TELEGRAM_CLIENT_SECRET: t.String(),

	OAUTH_STATE_TTL: t.Number({ default: 10 * 60 }),

	ROBOKASSA_MERCHANT_LOGIN: t.String(),
	ROBOKASSA_PASSWORD_1: t.String(),
	ROBOKASSA_PASSWORD_2: t.String(),
	ROBOKASSA_TEST_PASSWORD_1: t.String({ default: '' }),
	ROBOKASSA_TEST_PASSWORD_2: t.String({ default: '' }),
	ROBOKASSA_TEST_MODE: t.Boolean({ default: false }),
	ROBOKASSA_HASH_ALGORITHM: t.Union(
		[
			t.Literal('md5'),
			t.Literal('ripemd160'),
			t.Literal('sha1'),
			t.Literal('sha256'),
			t.Literal('sha384'),
			t.Literal('sha512')
		],
		{ default: 'md5' }
	),

	HELEKET_MERCHANT_ID: t.String(),
	HELEKET_PAYMENT_API_KEY: t.String(),

	NPD_INN: t.String(),
	NPD_PASSWORD: t.String(),
	NPD_DEVICE_ID: t.String({ default: '' })
})

export type Env = Static<typeof envSchema>

const parsed = Value.Convert(
	envSchema,
	Value.Default(envSchema, Value.Clean(envSchema, { ...Bun.env }))
)

if (!Value.Check(envSchema, parsed)) {
	console.error('Invalid environment variables:')

	for (const error of Value.Errors(envSchema, parsed)) {
		console.error(`  - ${error.path.slice(1)}: ${error.message}`)
	}

	process.exit(1)
}

export const env = parsed

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
