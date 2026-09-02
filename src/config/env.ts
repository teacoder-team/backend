import { FormatRegistry, Type as t, type Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

/**
 * TypeBox only knows the formats that were registered with it. Elysia
 * registers its own set, but config is the bottom layer and must not depend
 * on anything above it having been imported first.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!FormatRegistry.Has('email')) {
	FormatRegistry.Set('email', (value) => EMAIL_PATTERN.test(value))
}

if (!FormatRegistry.Has('uri')) {
	FormatRegistry.Set('uri', (value) => URL.canParse(value))
}

const envSchema = t.Object({
	NODE_ENV: t.Union(
		[
			t.Literal('development'),
			t.Literal('production'),
			t.Literal('test'),
		],
		{ default: 'development' },
	),

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
			t.Literal('fatal'),
		],
		{ default: 'info' },
	),

	RESOURCES_DIR: t.String({ default: './resources' }),

	TOKEN_SECRET: t.String({ minLength: 32 }),

	COOKIE_DOMAIN: t.String({ default: 'localhost' }),
	COOKIE_SECURE: t.Boolean({ default: false }),
	COOKIE_SAMESITE: t.Union(
		[t.Literal('lax'), t.Literal('strict'), t.Literal('none')],
		{ default: 'lax' },
	),
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
		default: 'hello@teacoder.ru',
	}),
	SMTP_FROM_NOREPLY: t.String({
		format: 'email',
		default: 'no-reply@teacoder.ru',
	}),

	YOOKASSA_SHOP_ID: t.String(),
	YOOKASSA_SECRET_KEY: t.String(),
})

export type Env = Static<typeof envSchema>

/**
 * `Clean` drops everything that is not declared above, `Default` fills the
 * gaps and `Convert` coerces the string values Bun hands us into the declared
 * types. Adding a variable to the schema is therefore the only step required.
 */
/**
 * `Clean` drops undeclared variables, `Default` fills the gaps and `Convert`
 * coerces the strings Bun hands us into the declared types. Adding a variable
 * to the schema above is therefore the only step required.
 */
const parsed = Value.Convert(
	envSchema,
	Value.Default(envSchema, Value.Clean(envSchema, { ...Bun.env })),
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
