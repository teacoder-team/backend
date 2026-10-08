import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard } from '~/plugins/auth-guard'

import { RevokeResponse, SessionListResponse, SessionParams } from './model'
import { getUserSessions, revokeAllSessions, revokeOtherSession } from './service'

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
	.delete(
		'/:id',
		async ({ session, params }) =>
			await revokeOtherSession(session.userId, params.id, session.id),
		{
			params: 'SessionParams',
			response: 'RevokeResponse',
			detail: {
				summary: 'Завершение сессии',
				description:
					'Выходит из аккаунта на другом устройстве. Текущую сессию так завершить нельзя - 400; для неё есть `POST /auth/logout`, который заодно удаляет cookie.'
			}
		}
	)
	.delete('/', async ({ session }) => await revokeAllSessions(session.userId, session.id), {
		response: 'RevokeResponse',
		detail: {
			summary: 'Завершение всех других сессий',
			description:
				'Выходит из аккаунта на всех устройствах, кроме текущего. В ответе - сколько сессий завершено (текущая не считается).'
		}
	})
