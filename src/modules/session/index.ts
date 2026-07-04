import { Elysia } from 'elysia'

export const session = new Elysia({
	prefix: '/sessions',
	tags: ['Sessions'],
})
