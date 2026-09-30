import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { MessageResponse } from '~/modules/auth/model'
import { authGuard } from '~/plugins/auth-guard'
import { requestContext } from '~/plugins/request-context'

import {
	MfaCodePayload,
	RecoveryCodesResponse,
	RecoveryCodesStatusResponse,
	TotpCodePayload,
	TotpSetupResponse
} from './model'
import {
	confirmTotp,
	disableTotp,
	getRecoveryCodesStatus,
	regenerateRecoveryCodes,
	setupTotp
} from './service'

export const mfa = new Elysia({ prefix: '/mfa', tags: [TAG.mfa] })
	.use(requestContext)
	.use(authGuard)
	.model({
		TotpSetupResponse,
		TotpCodePayload,
		MfaCodePayload,
		RecoveryCodesResponse,
		RecoveryCodesStatusResponse,
		MessageResponse
	})
	.guard({ auth: true, detail: { security: [{ bearerAuth: [] }] } })
	.post('/totp/setup', async ({ session }) => await setupTotp(session.userId), {
		response: 'TotpSetupResponse',
		detail: {
			summary: 'Подключение приложения-аутентификатора',
			description:
				'Первый шаг: выдаёт секрет и QR-код для Google Authenticator, 1Password, Aegis и т.п. Двухфакторная защита включится только после подтверждения кодом в `POST /mfa/totp/verify`. Повторный вызов до подтверждения выдаёт новый секрет, старый QR-код перестаёт работать.'
		}
	})
	.post('/totp/verify', async ({ session, body }) => await confirmTotp(session.userId, body), {
		body: 'TotpCodePayload',
		response: 'RecoveryCodesResponse',
		detail: {
			summary: 'Подтверждение приложения-аутентификатора',
			description:
				'Второй шаг: проверяет код из приложения и включает двухфакторную защиту. В ответе - 10 резервных кодов на случай потери телефона; они показываются один раз, пользователю нужно их сохранить. После 5 неверных кодов проверка блокируется на 15 минут.'
		}
	})
	.post(
		'/totp/disable',
		async ({ session, body }) => {
			await disableTotp(session.userId, body)

			return { message: 'Authenticator app disabled' }
		},
		{
			body: 'MfaCodePayload',
			response: 'MessageResponse',
			detail: {
				summary: 'Отключение приложения-аутентификатора',
				description:
					'Требует код из приложения или резервный код - одной сессии недостаточно. Если других способов подтверждения (ключей WebAuthn) нет, резервные коды удаляются вместе с приложением.'
			}
		}
	)
	.get('/recovery-codes', async ({ session }) => await getRecoveryCodesStatus(session.userId), {
		response: 'RecoveryCodesStatusResponse',
		detail: {
			summary: 'Состояние резервных кодов',
			description:
				'Сколько резервных кодов выпущено и сколько осталось. Сами коды на сервере не хранятся (только хэши), поэтому повторно их показать нельзя - если коды потеряны, выпустите новые.'
		}
	})
	.post(
		'/recovery-codes',
		async ({ session, body }) => await regenerateRecoveryCodes(session.userId, body),
		{
			body: 'MfaCodePayload',
			response: 'RecoveryCodesResponse',
			detail: {
				summary: 'Перевыпуск резервных кодов',
				description:
					'Выдаёт новый набор из 10 кодов, все прежние перестают действовать. Требует код из приложения или резервный код.'
			}
		}
	)
