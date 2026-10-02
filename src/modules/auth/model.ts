import { type Static, t } from 'elysia'

import { AuthProvider } from '@prisma/generated/client'

import { PrismaEnum } from '~/lib/utils/schema'
import { MfaMethodSchema } from '~/modules/mfa/model'

const CaptchaToken = t.Optional(
	t.String({
		description:
			'Токен из виджета капчи (Cloudflare Turnstile или Yandex SmartCaptcha). Обязателен, если капча включена - какая именно, отдаёт `GET /`.',
		examples: ['0.AAAA-token-from-widget']
	})
)

const Email = t.String({
	format: 'email',
	description: 'Адрес электронной почты.',
	error: 'Invalid email format',
	examples: ['torvalds.l@teacoder.com']
})

export const RegisterPayload = t.Object(
	{
		name: t.String({
			minLength: 2,
			maxLength: 50,
			description: 'Отображаемое имя, от 2 до 50 символов.',
			error: 'Name must be between 2 and 50 characters',
			examples: ['Linus Torvalds']
		}),
		email: Email,
		password: t.String({
			minLength: 6,
			description: 'Пароль, не короче 6 символов.',
			error: 'Password must be at least 6 characters',
			examples: ['securepassword123']
		}),
		captchaToken: CaptchaToken
	},
	{ description: 'Данные для регистрации.' }
)

export const VerifyRegisterPayload = t.Object(
	{
		email: Email,
		code: t.String({
			minLength: 6,
			maxLength: 6,
			description: '6-значный код из письма.',
			error: 'Verification code must be exactly 6 characters',
			examples: ['123456']
		})
	},
	{ description: 'Код подтверждения регистрации.' }
)

export const LoginPayload = t.Object(
	{
		email: Email,
		password: t.String({
			minLength: 6,
			description: 'Пароль от аккаунта.',
			error: 'Password is required',
			examples: ['securepassword123']
		}),
		captchaToken: CaptchaToken
	},
	{ description: 'Данные для входа.' }
)

export const ForgotPasswordPayload = t.Object(
	{
		email: Email,
		captchaToken: CaptchaToken
	},
	{ description: 'Почта аккаунта, пароль от которого нужно сбросить.' }
)

export const ResetPasswordPayload = t.Object(
	{
		token: t.String({
			minLength: 32,
			maxLength: 128,
			description:
				'Токен из ссылки в письме (`/auth/recovery/{token}`). Действует 30 минут и срабатывает один раз.',
			error: 'Reset link is invalid',
			examples: ['q2fSx1Gd0Yk7uJ9ZlQm3cW8vB4nR6tHpE5aT1oKyL0s']
		}),
		newPassword: t.String({
			minLength: 6,
			description: 'Новый пароль, не короче 6 символов.',
			error: 'Password must be at least 6 characters',
			examples: ['newsecurepassword123']
		})
	},
	{ description: 'Токен из ссылки в письме и новый пароль.' }
)

export const MessageResponse = t.Object(
	{
		message: t.String({
			description: 'Что произошло или что делать дальше.',
			examples: ['Verification code sent to email']
		})
	},
	{ description: 'Текстовый результат операции.' }
)

const UserId = t.String({
	description: 'Идентификатор пользователя.',
	examples: ['49003cb8-7f31-4942-abec-ac9e29318681']
})

const AccessToken = t.String({
	description:
		'Короткоживущий JWT. Храните в памяти (не в localStorage) и передавайте в заголовке `Authorization: Bearer <token>` - в cookie сервер его не кладёт. Когда истечёт, получите новый через `POST /auth/refresh`.',
	examples: ['eyJhbGciOiJIUzI1NiJ9...']
})

const LinkedProvider = t.Nullable(
	PrismaEnum(AuthProvider, {
		description:
			'Соцсеть, которую этот вход автоматически привязал к аккаунту: её подтверждённая почта совпала с почтой аккаунта. Привязка уже произошла и отменить её в этом окне нельзя - покажите пользователю уведомление. `null`, если ничего не привязывалось.',
		examples: [AuthProvider.GITHUB]
	})
)

export const AuthResponse = t.Object(
	{
		id: UserId,
		accessToken: AccessToken,
		linkedProvider: LinkedProvider
	},
	{
		description:
			'Выполненный вход: пользователь и access-токен. Refresh-токен приходит в httpOnly-cookie `tc_refresh`.'
	}
)

const MfaToken = t.String({
	minLength: 1,
	maxLength: 128,
	description:
		'Временный билет второго шага входа из ответа на вход. Действует 5 минут и срабатывает один раз.',
	error: 'MFA token is required',
	examples: ['q2fSx1Gd0Yk7uJ9ZlQm3cW8vB4nR6tHpE5aT1oKyL0s']
})

export const SignInCompletedFields = {
	mfaRequired: t.Literal(false, { description: 'Второй фактор не нужен.' }),
	mfaToken: t.Null({ description: 'Всегда `null`, если второй фактор не нужен.' }),
	id: UserId,
	accessToken: AccessToken,
	linkedProvider: LinkedProvider
}

export const SignInMfaRequiredFields = {
	mfaRequired: t.Literal(true, {
		description: 'Включена двухфакторная защита - нужен второй шаг.'
	}),
	mfaToken: MfaToken,
	mfaMethods: t.Array(MfaMethodSchema, {
		description: 'Способы, которыми можно подтвердить вход.',
		examples: [['TOTP', 'RECOVERY_CODE']]
	}),
	expiresIn: t.Number({
		description: 'Через сколько секунд `mfaToken` перестанет действовать.',
		examples: [300]
	})
}

export const SIGN_IN_COMPLETED_DESCRIPTION =
	'Вход выполнен: сессия открыта. Access-токен - в теле, refresh-токен - в httpOnly-cookie `tc_refresh`.'

export const SIGN_IN_MFA_REQUIRED_DESCRIPTION =
	'Первый фактор принят, но сессия ещё не открыта: нужно подтвердить вход через `POST /auth/mfa/challenge` и `POST /auth/mfa/confirm`. Автоматическая привязка соцсети (если есть) произойдёт после подтверждения - её покажет `linkedProvider` в ответе `confirm`.'

export const SignInResponse = t.Union(
	[
		t.Object(SignInCompletedFields, { description: SIGN_IN_COMPLETED_DESCRIPTION }),
		t.Object(SignInMfaRequiredFields, { description: SIGN_IN_MFA_REQUIRED_DESCRIPTION })
	],
	{
		description:
			'Результат входа. Если `mfaRequired` = `true`, токенов нет - вместо них `mfaToken` для второго шага.'
	}
)

export const MfaChallengePayload = t.Object(
	{
		mfaToken: MfaToken,
		method: MfaMethodSchema
	},
	{ description: 'Билет второго шага и выбранный способ подтверждения.' }
)

export const MfaChallengeResponse = t.Object(
	{
		challengeId: t.String({
			format: 'uuid',
			description: 'Идентификатор проверки - передаётся в `POST /auth/mfa/confirm`.',
			examples: ['9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d']
		}),
		message: t.String({
			description: 'Что произошло.',
			examples: ['Verification code initiated via TOTP']
		})
	},
	{ description: 'Начатая проверка второго фактора.' }
)

export const MfaConfirmPayload = t.Object(
	{
		mfaToken: MfaToken,
		challengeId: t.String({
			format: 'uuid',
			description: 'Идентификатор из `POST /auth/mfa/challenge`.',
			error: 'Invalid challenge id',
			examples: ['9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d']
		}),
		code: t.String({
			minLength: 6,
			maxLength: 32,
			description:
				'Код для выбранного способа: 6 цифр из приложения или резервный код (`xxxxx-xxxxx`, регистр и дефис не важны).',
			error: 'Code must be between 6 and 32 characters',
			examples: ['492039']
		})
	},
	{ description: 'Код второго фактора.' }
)

export const AccessTokenResponse = t.Object(
	{ accessToken: AccessToken },
	{
		description:
			'Новый access-токен. Новый refresh-токен приходит в httpOnly-cookie `tc_refresh`, прежний больше не действует.'
	}
)

export type RegisterInput = Static<typeof RegisterPayload>
export type VerifyRegisterInput = Static<typeof VerifyRegisterPayload>
export type LoginInput = Static<typeof LoginPayload>
export type ForgotPasswordInput = Static<typeof ForgotPasswordPayload>
export type ResetPasswordInput = Static<typeof ResetPasswordPayload>
export type MfaChallengeInput = Static<typeof MfaChallengePayload>
export type MfaConfirmInput = Static<typeof MfaConfirmPayload>
