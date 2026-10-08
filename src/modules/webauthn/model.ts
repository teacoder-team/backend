import { type Static, t } from 'elysia'

import { WebAuthnDeviceType } from '@prisma/generated/client'

import { PrismaEnum } from '~/lib/utils/schema'

const Base64Url = (description: string) =>
	t.String({
		pattern: '^[A-Za-z0-9_-]+$',
		description,
		error: `${description.replace(/\.$/, '')} must be base64url`
	})

const MfaToken = t.String({
	minLength: 1,
	maxLength: 128,
	description:
		'Билет второго шага из ответа на вход (`mfaToken`). С ним ключ подтверждает вход как второй фактор; без него - это вход по ключу доступа без пароля.',
	examples: ['q2fSx1Gd0Yk7uJ9ZlQm3cW8vB4nR6tHpE5aT1oKyL0s']
})

export const WebAuthnOptionsResponse = t.Object(
	{},
	{
		additionalProperties: true,
		description:
			'Параметры WebAuthn (`PublicKeyCredentialCreationOptionsJSON` или `PublicKeyCredentialRequestOptionsJSON`). Передайте объект целиком в `startRegistration` / `startAuthentication` из `@simplewebauthn/browser` (или в `navigator.credentials`). Действуют 5 минут и один раз.'
	}
)

const ClientExtensionResults = t.Record(t.String(), t.Unknown(), {
	description: 'Результаты расширений - как вернул браузер.'
})

const RegistrationCredential = t.Object(
	{
		id: Base64Url('Идентификатор ключа.'),
		rawId: Base64Url('Идентификатор ключа.'),
		type: t.Literal('public-key'),
		response: t.Object(
			{
				clientDataJSON: Base64Url('clientDataJSON.'),
				attestationObject: Base64Url('attestationObject.'),
				transports: t.Optional(t.Array(t.String()))
			},
			{ additionalProperties: true }
		),
		authenticatorAttachment: t.Optional(t.String()),
		clientExtensionResults: ClientExtensionResults
	},
	{
		additionalProperties: true,
		description: 'Ответ `startRegistration()` из `@simplewebauthn/browser` - без изменений.'
	}
)

const AuthenticationCredential = t.Object(
	{
		id: Base64Url('Идентификатор ключа.'),
		rawId: Base64Url('Идентификатор ключа.'),
		type: t.Literal('public-key'),
		response: t.Object(
			{
				clientDataJSON: Base64Url('clientDataJSON.'),
				authenticatorData: Base64Url('authenticatorData.'),
				signature: Base64Url('signature.'),
				userHandle: t.Optional(Base64Url('userHandle.'))
			},
			{ additionalProperties: true }
		),
		authenticatorAttachment: t.Optional(t.String()),
		clientExtensionResults: ClientExtensionResults
	},
	{
		additionalProperties: true,
		description: 'Ответ `startAuthentication()` из `@simplewebauthn/browser` - без изменений.'
	}
)

export const WebAuthnRegisterPayload = t.Object(
	{
		response: RegistrationCredential,
		name: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 64,
				description:
					'Название ключа в списке. Если не передать - подставится браузер и система («Chrome, Windows») или «Ключ безопасности».',
				error: 'Name must be 1 to 64 characters',
				examples: ['MacBook Touch ID']
			})
		)
	},
	{ description: 'Ответ браузера на создание ключа.' }
)

export const WebAuthnLoginOptionsPayload = t.Object(
	{ mfaToken: t.Optional(MfaToken) },
	{
		description:
			'Без `mfaToken` (или без тела) - вход по ключу доступа; с `mfaToken` - второй фактор.'
	}
)

export const WebAuthnLoginPayload = t.Object(
	{
		response: AuthenticationCredential,
		mfaToken: t.Optional(MfaToken)
	},
	{ description: 'Ответ браузера на запрос ключа.' }
)

export const WebAuthnCredentialResponse = t.Object(
	{
		id: t.String({
			description: 'Идентификатор ключа в TeaCoder - для удаления.',
			examples: ['6f1c2b0e-8a44-4f7e-9d1a-3b5c7e9f1a2b']
		}),
		name: t.String({ description: 'Название ключа.', examples: ['Chrome, macOS'] }),
		deviceType: PrismaEnum(WebAuthnDeviceType, {
			description:
				'`MULTI_DEVICE` - синхронизируемый ключ доступа (iCloud, Google, 1Password), `SINGLE_DEVICE` - привязан к одному устройству (аппаратный ключ).',
			examples: [WebAuthnDeviceType.MULTI_DEVICE]
		}),
		backedUp: t.Boolean({
			description: 'Сохранена ли копия ключа в облаке - переживёт ли он потерю устройства.'
		}),
		transports: t.Array(t.String(), {
			description: 'Как браузер может связаться с ключом.',
			examples: [['internal', 'hybrid']]
		}),
		lastUsedAt: t.Nullable(
			t.String({
				description: 'Когда ключом последний раз входили. `null`, если ещё ни разу.',
				examples: ['2026-09-30T14:16:54.000Z']
			})
		),
		createdAt: t.String({
			description: 'Когда ключ добавлен.',
			examples: ['2026-09-30T14:16:54.000Z']
		})
	},
	{ description: 'Ключ доступа или аппаратный ключ.' }
)

export const WebAuthnCredentialListResponse = t.Array(WebAuthnCredentialResponse, {
	description: 'Ключи аккаунта, от старых к новым.'
})

export const WebAuthnRegisterResponse = t.Object(
	{
		credential: WebAuthnCredentialResponse,
		recoveryCodes: t.Nullable(
			t.Array(t.String({ examples: ['k7m3p-x9q2w'] }), {
				description:
					'Резервные коды - только если это первый второй фактор аккаунта и кодов ещё не было. Показываются один раз. Иначе `null`.'
			})
		)
	},
	{ description: 'Добавленный ключ.' }
)

export const WebAuthnCredentialParams = t.Object({
	id: t.String({
		format: 'uuid',
		description: 'Идентификатор ключа.',
		error: 'Invalid credential id'
	})
})

export type WebAuthnRegisterInput = Static<typeof WebAuthnRegisterPayload>
export type WebAuthnLoginOptionsInput = Static<typeof WebAuthnLoginOptionsPayload>
export type WebAuthnLoginInput = Static<typeof WebAuthnLoginPayload>
