import { AuthSchema } from '@/modules/auth/schema'
import { authService } from '@/modules/auth/service'
import { Elysia } from 'elysia'

export const authRouter = new Elysia({
	prefix: '/auth',
})
	.post('/register', async ({ body }) => await authService.register(body), {
		body: AuthSchema.register,
		detail: {
			tags: ['Auth'],
			summary: 'Initialize register',
			description: 'Start the process of creating a new user account.',
		},
	})
	.post(
		'/register/verify',
		async ({ body }) => {
			const user = await authService.verifyRegister(body)

			return { userId: user.id }
		},
		{
			body: AuthSchema.verify,
			detail: {
				tags: ['Auth'],
				summary: 'Verify register',
				description: 'Confirm and activate your newly created account.',
			},
		},
	)
