import { AccountSchema } from '@/modules/account/schema'
import { accountService } from '@/modules/account/service'
import { Elysia } from 'elysia'

export const accountRouter = new Elysia({
	prefix: '/auth/account',
}).post(
	'/create',
	async ({ body }) => {
		const user = await accountService.register(body)

		return { userId: user.id }
	},
	{
		body: AccountSchema.create,
		detail: {
			tags: ['Account'],
			summary: 'Create a new account',
		},
	},
)
