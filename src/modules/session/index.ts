import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard } from '~/plugins/auth-guard'

import { RevokeResponse, SessionListResponse, SessionParams } from './model'
import { getUserSessions, revokeAllSessions, revokeSession } from './service'

export const session = new Elysia({ prefix: '/sessions', tags: [TAG.sessions] })
	.use(authGuard)
	.model({ SessionListResponse, RevokeResponse, SessionParams })
	.guard({ auth: true, detail: { security: [{ bearerAuth: [] }] } })
	.get('/', async ({ session }) => await getUserSessions(session.userId, session.id), {
		response: 'SessionListResponse',
		detail: {
			summary: 'Активные сессии',
			description:
				'Все устройства, на которых выполнен вход в аккаунт, с примерным местоположением. Текущая сессия помечена `current: true`.'
		}
	})
	.delete('/:id', async ({ session, params }) => await revokeSession(session.userId, params.id), {
		params: 'SessionParams',
		response: 'RevokeResponse',
		detail: {
			summary: 'Завершение сессии',
			description: 'Выходит из аккаунта на одном устройстве.'
		}
	})
	.delete('/', async ({ session }) => await revokeAllSessions(session.userId), {
		response: 'RevokeResponse',
		detail: {
			summary: 'Завершение всех сессий',
			description: 'Выходит из аккаунта на всех устройствах, включая текущее.'
		}
	})
