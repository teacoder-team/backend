import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { MessageResponse, TokenPairResponse } from '~/modules/auth/model'
import { authCookie } from '~/plugins/auth-cookie'
import { authGuard } from '~/plugins/auth-guard'
import { requestContext } from '~/plugins/request-context'

import {
	AvatarResponse,
	AvatarUploadPayload,
	ChangeEmailPayload,
	ChangePasswordPayload,
	ConfirmCodePayload,
	EmailChangeResponse,
	UserResponse
} from './model'
import {
	confirmEmailChange,
	confirmPasswordChange,
	getCurrentUser,
	requestEmailChange,
	requestPasswordChange,
	updateAvatar
} from './service'

export const users = new Elysia({ prefix: '/users', tags: [TAG.users] })
	.use(requestContext)
	.use(authCookie)
	.use(authGuard)
	.model({
		UserResponse,
		ChangeEmailPayload,
		ChangePasswordPayload,
		ConfirmCodePayload,
		EmailChangeResponse,
		AvatarUploadPayload,
		AvatarResponse,
		MessageResponse,
		TokenPairResponse
	})
	.guard({ auth: true, detail: { security: [{ bearerAuth: [] }] } })
	.get('/@me', async ({ session }) => await getCurrentUser(session.userId), {
		response: 'UserResponse',
		detail: {
			summary: 'Текущий пользователь',
			description: 'Профиль аккаунта, от имени которого сделан запрос.'
		}
	})
	.post('/@me/avatar', async ({ session, body }) => await updateAvatar(session.userId, body), {
		body: 'AvatarUploadPayload',
		response: 'AvatarResponse',
		detail: {
			summary: 'Смена аватара',
			description:
				'Загружает изображение в файловое хранилище и делает его аватаром аккаунта. Запрос в формате `multipart/form-data`, картинка до 5 МБ.'
		}
	})
	.post(
		'/@me/email/change',
		async ({ session, body }) => {
			await requestEmailChange(session.userId, body)

			return { message: 'Confirmation code sent to the new address' }
		},
		{
			body: 'ChangeEmailPayload',
			response: 'MessageResponse',
			detail: {
				summary: 'Запрос смены почты',
				description:
					'Отправляет код на новый адрес, чтобы убедиться, что он принадлежит пользователю. Почта меняется только после подтверждения кодом.'
			}
		}
	)
	.post(
		'/@me/email/confirm',
		async ({ session, body }) => await confirmEmailChange(session.userId, body),
		{
			body: 'ConfirmCodePayload',
			response: 'EmailChangeResponse',
			detail: {
				summary: 'Подтверждение смены почты',
				description: 'Проверяет код из письма и меняет почту аккаунта на новую.'
			}
		}
	)
	.post(
		'/@me/password/change',
		async ({ session, body }) => {
			await requestPasswordChange(session.userId, body)

			return { message: 'Confirmation code sent to your email' }
		},
		{
			body: 'ChangePasswordPayload',
			response: 'MessageResponse',
			detail: {
				summary: 'Запрос смены пароля',
				description:
					'Проверяет текущий пароль и отправляет на почту код подтверждения. Новый пароль применится только после подтверждения кодом.'
			}
		}
	)
	.post(
		'/@me/password/confirm',
		async ({ session, body, ip, userAgent, authCookie }) => {
			const tokens = await confirmPasswordChange(session.userId, body, { ip, userAgent })

			authCookie.set(tokens)

			return tokens
		},
		{
			body: 'ConfirmCodePayload',
			response: 'TokenPairResponse',
			detail: {
				summary: 'Подтверждение смены пароля',
				description:
					'Проверяет код и устанавливает новый пароль. Все остальные сессии завершаются, а на этом устройстве выдаётся новая пара токенов.'
			}
		}
	)
