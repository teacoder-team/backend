import { Type as t, type Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const envSchema = t.Object({
	NODE_ENV: t.Enum(
		{
			development: 'development',
			production: 'production',
			test: 'test',
		},
		{ default: 'development' },
	),

	APP_ADDRESS: t.String({ default: '0.0.0.0' }),
	APP_PORT: t.Number({ default: 3000 }),
	APP_PUBLIC_URL: t.String({ format: 'uri' }),

	LOG_LEVEL: t.Enum(
		{
			trace: 'trace',
			debug: 'debug',
			info: 'info',
			warn: 'warn',
			error: 'error',
			fatal: 'fatal',
		},
		{ default: 'info' },
	),

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
})

type Env = Static<typeof envSchema>

const _env = {
	...process.env,
	APP_PORT: process.env.APP_PORT ? Number(process.env.APP_PORT) : undefined,
	SMTP_PORT: process.env.SMTP_PORT
		? Number(process.env.SMTP_PORT)
		: undefined,
	SMTP_SECURE: process.env.SMTP_SECURE === 'true',
}

if (!Value.Check(envSchema, _env)) {
	const errors = [...Value.Errors(envSchema, _env)]
	console.error('Invalid environment variables:')
	errors.forEach((err) => {
		console.error(
			`  - ${err.path}: ${err.message} (received: ${err.value})`,
		)
	})
	process.exit(1)
}

export const env = _env as Env
