import { getClientIp } from '@/lib/utils/ip'
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
		async ({ body, request }) => {
			const ip = getClientIp(request.headers)
			const ua = request.headers.get('User-Agent') ?? 'Unknown'

			const { user, sessionId } = await authService.verifyRegister(body, {
				ip,
				ua,
			})

			return {
				userId: user.id,
				sessionId,
			}
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
	.post(
		'/login',
		async ({ body, request }) => {
			const ip = getClientIp(request.headers)
			const ua = request.headers.get('User-Agent') ?? 'Unknown'

			const { user, sessionId } = await authService.login(body, {
				ip,
				ua,
			})

			return {
				userId: user.id,
				sessionId,
			}
		},
		{
			body: AuthSchema.login,
			detail: {
				tags: ['Auth'],
				summary: 'Login with email',
				description: 'Authenticate and start a new session.',
			},
		},
	)
