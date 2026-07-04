import { t, type Static } from 'elysia'

export const RootResponse = t.Object({
	message: t.String({
		description: 'A friendly welcome message.',
		examples: ["What's up motherfuckers! 🤘"],
	}),
})

export const HealthResponse = t.Object({
	status: t.String({
		description: 'Current operational state of the API instance.',
		examples: ['operational'],
	}),
	timestamp: t.String({
		description: 'ISO 8601 formatted server timestamp.',
		examples: ['2026-07-04T14:16:54.000Z'],
	}),
})

export type RootOutput = Static<typeof RootResponse>
export type HealthOutput = Static<typeof HealthResponse>
