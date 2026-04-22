import { Elysia } from 'elysia'

export const sessionRouter = new Elysia({ prefix: '/auth/session' }).post(
	'/login',
	() => 'Login',
)
