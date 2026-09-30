import { type Static, t } from 'elysia'

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
		email: Email,
		code: t.String({
			minLength: 6,
			maxLength: 6,
			description: '6-значный код из письма.',
			error: 'Reset code must be exactly 6 characters',
			examples: ['123456']
		}),
		newPassword: t.String({
			minLength: 6,
			description: 'Новый пароль, не короче 6 символов.',
			error: 'Password must be at least 6 characters',
			examples: ['newsecurepassword123']
		})
	},
	{ description: 'Код из письма и новый пароль.' }
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

const AccessToken = t.String({
	description:
		'Короткоживущий JWT. Передаётся в заголовке `Authorization: Bearer <token>`; браузеру достаточно cookie `tc_access`.',
	examples: ['eyJhbGciOiJIUzI1NiJ9...']
})

const RefreshToken = t.String({
	description:
		'Долгоживущий токен для получения новой пары через `POST /auth/refresh`. Одноразовый: после обмена становится недействительным.',
	examples: ['3f8a1c2e9b7d4a51-8c62-1d4e5f6a7b8c...']
})

export const AuthResponse = t.Object(
	{
		id: t.String({
			description: 'Идентификатор пользователя.',
			examples: ['49003cb8-7f31-4942-abec-ac9e29318681']
		}),
		accessToken: AccessToken,
		refreshToken: RefreshToken
	},
	{ description: 'Выполненный вход: пользователь и пара токенов.' }
)

export const RefreshPayload = t.Object(
	{
		refreshToken: t.Optional(
			t.String({
				description:
					'Нужен, только если клиент не отправляет cookie `tc_refresh` (например, мобильное приложение).'
			})
		)
	},
	{ description: 'Refresh-токен для обмена.' }
)

export const TokenPairResponse = t.Object(
	{
		accessToken: AccessToken,
		refreshToken: RefreshToken
	},
	{ description: 'Новая пара токенов.' }
)

export type RegisterInput = Static<typeof RegisterPayload>
export type VerifyRegisterInput = Static<typeof VerifyRegisterPayload>
export type LoginInput = Static<typeof LoginPayload>
export type RefreshInput = Static<typeof RefreshPayload>
export type ForgotPasswordInput = Static<typeof ForgotPasswordPayload>
export type ResetPasswordInput = Static<typeof ResetPasswordPayload>
