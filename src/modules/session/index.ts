import { Elysia } from 'elysia'

import { authGuard } from '@/plugins/auth-guard'
import { RevokeResponse, SessionListResponse, SessionParams } from './model'
import { getUserSessions, revokeAllSessions, revokeSession } from './service'

export const session = new Elysia({ prefix: '/sessions', tags: ['Sessions'] })
	.use(authGuard)
	.model({ SessionListResponse, RevokeResponse, SessionParams })
	.guard({ auth: true, detail: { security: [{ bearerAuth: [] }] } })
	.get('/', ({ session }) => getUserSessions(session.userId, session.id), {
		response: 'SessionListResponse',
		detail: {
			summary: 'List active sessions',
			description: 'Every device currently signed in to this account.',
		},
	})
	.delete(
		'/:id',
		({ session, params }) => revokeSession(session.userId, params.id),
		{
			params: 'SessionParams',
			response: 'RevokeResponse',
			detail: {
				summary: 'Revoke a session',
				description: 'Sign a single device out of this account.',
			},
		},
	)
	.delete('/', ({ session }) => revokeAllSessions(session.userId), {
		response: 'RevokeResponse',
		detail: {
			summary: 'Revoke all sessions',
			description: 'Sign every device out, including the current one.',
		},
	})
