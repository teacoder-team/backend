import { Elysia } from 'elysia'

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

export const users = new Elysia({ prefix: '/users', tags: ['Users'] })
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
			summary: 'Get current user',
			description: 'Profile of the account making the request.'
		}
	})
	.post('/@me/avatar', async ({ session, body }) => await updateAvatar(session.userId, body), {
		body: 'AvatarUploadPayload',
		response: 'AvatarResponse',
		detail: {
			summary: 'Change avatar',
			description: 'Uploads a new avatar image and sets it as the account avatar.'
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
				summary: 'Request an email change',
				description:
					'Sends a confirmation code to the new address to prove it is reachable.'
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
				summary: 'Confirm an email change',
				description: 'Applies the pending email change once the code checks out.'
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
				summary: 'Request a password change',
				description:
					'Verifies the current password, then emails a confirmation code before applying the new one.'
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
				summary: 'Confirm a password change',
				description:
					'Applies the new password, signs out every other session, and starts a fresh one here.'
			}
		}
	)
