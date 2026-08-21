import { t } from 'elysia'

export const RootResponse = t.Object({
	message: t.String({
		description: 'A friendly welcome message.',
		examples: ["What's up motherfuckers! 🤘"],
	}),
})

export const HealthResponse = t.Object({
	status: t.Union([t.Literal('operational'), t.Literal('degraded')], {
		description: 'Overall state of this instance.',
	}),
	database: t.Boolean({ description: 'Whether PostgreSQL answers.' }),
	cache: t.Boolean({ description: 'Whether Redis answers.' }),
	timestamp: t.String({
		description: 'ISO 8601 formatted server timestamp.',
		examples: ['2026-07-04T14:16:54.000Z'],
	}),
})
