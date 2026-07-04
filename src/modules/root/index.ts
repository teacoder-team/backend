import { Elysia } from 'elysia'
import { RootResponse, HealthResponse } from './model'

export const root = new Elysia({
	tags: ['Core'],
})
	.model({
		RootResponse,
		HealthResponse,
	})
	.get('/', () => ({ message: "What's up motherfuckers! 🤘" }), {
		response: 'RootResponse',
		detail: {
			summary: 'Sytem Greeting',
			description: 'Main API entry point returning a vibe-check message.',
		},
	})
	.get(
		'/health',
		() => ({
			status: 'operational',
			timestamp: new Date().toISOString(),
		}),
		{
			response: 'HealthResponse',
			detail: {
				summary: 'System health check',
				description:
					'Check if the backend instance and its core features are fully functional.',
			},
		},
	)
