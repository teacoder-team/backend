import { Elysia } from 'elysia'

export const sessionRouter = new Elysia({ prefix: '/auth/sessions' }).get(
	'/',
	async () => {},
)
