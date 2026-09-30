import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { AccessTokenResponse, MessageResponse } from '~/modules/auth/model'
import { authCookie } from '~/plugins/auth-cookie'
import { authGuard } from '~/plugins/auth-guard'
import { requestContext } from '~/plugins/request-context'

import {
	AvatarResponse,
	AvatarUploadPayload,
	ChangeEmailPayload,
	ChangePasswordPayload,
	ConfirmCodePayload,
	CourseProgressListResponse,
	EmailChangeResponse,
	LeaderListResponse,
	StatisticsResponse,
	UpdateProfilePayload,
	UserResponse
} from './model'
import {
	confirmEmailChange,
	confirmPasswordChange,
	getCurrentUser,
	requestEmailChange,
	requestPasswordChange,
	updateAvatar,
	updateProfile
} from './service'
import { getCourseProgress, getLeaders, getStatistics } from './stats'

export const users = new Elysia({ prefix: '/users', tags: [TAG.users] })
	.use(requestContext)
	.use(authCookie)
	.use(authGuard)
	.model({
		UserResponse,
		UpdateProfilePayload,
		ChangeEmailPayload,
		ChangePasswordPayload,
		ConfirmCodePayload,
		EmailChangeResponse,
		AvatarUploadPayload,
		AvatarResponse,
		MessageResponse,
		AccessTokenResponse,
		StatisticsResponse,
		CourseProgressListResponse,
		LeaderListResponse
	})
	.get('/leaders', async () => await getLeaders(), {
		response: 'LeaderListResponse',
		detail: {
			tags: [TAG.progress],
			summary: 'Рейтинг',
			description:
				'Топ-15 пользователей по баллам (5 баллов за каждый пройденный урок). При равных баллах выше тот, кто зарегистрировался раньше, а место у них одно. Заблокированные не показываются. Обновляется раз в минуту.'
		}
	})
	.guard({ auth: true, detail: { security: [{ bearerAuth: [] }] } })
	.get('/@me/statistics', async ({ session }) => await getStatistics(session.userId), {
		response: 'StatisticsResponse',
		detail: {
			tags: [TAG.progress],
			summary: 'Моя статистика',
			description:
				'Баллы, место в рейтинге, пройденные уроки и курсы. Учитываются только опубликованные уроки опубликованных курсов.'
		}
	})
	.get('/@me/progress', async ({ session }) => await getCourseProgress(session.userId), {
		response: 'CourseProgressListResponse',
		detail: {
			tags: [TAG.progress],
			summary: 'Мои курсы',
			description:
				'Курсы, в которых пройден хотя бы один урок: прогресс, урок, с которого продолжить, и когда занимались последний раз. Сначала - недавние.'
		}
	})
	.get('/@me', async ({ session }) => await getCurrentUser(session.userId), {
		response: 'UserResponse',
		detail: {
			summary: 'Текущий пользователь',
			description: 'Профиль аккаунта, от имени которого сделан запрос.'
		}
	})
	.patch('/@me', async ({ session, body }) => await updateProfile(session.userId, body), {
		body: 'UpdateProfilePayload',
		response: 'UserResponse',
		detail: {
			summary: 'Изменение профиля',
			description: 'Меняет отображаемое имя. Возвращает обновлённый профиль.'
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
				summary: 'Смена или установка пароля',
				description:
					'Отправляет на почту код подтверждения; новый пароль применится только после `POST /users/@me/password/confirm`. Если пароль у аккаунта уже есть - нужен текущий (иначе 401). Если нет (аккаунт создан через соцсеть, `hasPassword: false`) - текущий не передаётся, и так пароль устанавливается впервые. Нужна почта на аккаунте, иначе 400.'
			}
		}
	)
	.post(
		'/@me/password/confirm',
		async ({ session, body, ip, userAgent, authCookie }) => {
			const tokens = await confirmPasswordChange(session.userId, body, { ip, userAgent })

			return authCookie.issue(tokens)
		},
		{
			body: 'ConfirmCodePayload',
			response: 'AccessTokenResponse',
			detail: {
				summary: 'Подтверждение смены пароля',
				description:
					'Проверяет код и устанавливает новый пароль. Все сессии, включая текущую, завершаются, а на этом устройстве открывается новая: access-токен в теле, refresh-токен в httpOnly-cookie `tc_refresh`.'
			}
		}
	)
