import { type Static, t } from 'elysia'

export const MFA_METHODS = ['WEBAUTHN', 'TOTP', 'RECOVERY_CODE'] as const

export type MfaMethod = (typeof MFA_METHODS)[number]

/** Methods proven by typing a code. WebAuthn signs a challenge instead - see `/auth/webauthn/login`. */
export type CodeMfaMethod = Exclude<MfaMethod, 'WEBAUTHN'>

export const MfaMethodSchema = t.UnionEnum(MFA_METHODS, {
	description:
		'Способ подтверждения: `WEBAUTHN` - ключ доступа или аппаратный ключ (через `POST /auth/webauthn/login/options` и `/verify` с `mfaToken`), `TOTP` - код из приложения-аутентификатора, `RECOVERY_CODE` - один из резервных кодов.',
	error: 'Unknown MFA method',
	examples: ['TOTP']
})

export const TotpSetupResponse = t.Object(
	{
		secret: t.String({
			description:
				'Секрет в base32 - для ручного ввода, если QR-код отсканировать не получается. Показывается один раз.',
			examples: ['JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP']
		}),
		otpauthUrl: t.String({
			description:
				'Ссылка `otpauth://` - то же, что в QR-коде. На телефоне открывает приложение-аутентификатор.',
			examples: [
				'otpauth://totp/TeaCoder:torvalds.l%40teacoder.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=TeaCoder&algorithm=SHA1&digits=6&period=30'
			]
		}),
		qrCodeUrl: t.String({
			description:
				'QR-код в виде `data:image/png;base64,...` - можно сразу подставить в `<img src>`.',
			examples: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...']
		})
	},
	{ description: 'Данные для подключения приложения-аутентификатора.' }
)

export const TotpCodePayload = t.Object(
	{
		code: t.String({
			pattern: '^\\d{6}$',
			description: '6-значный код из приложения-аутентификатора.',
			error: 'Code must be 6 digits',
			examples: ['492039']
		})
	},
	{ description: 'Код из приложения-аутентификатора.' }
)

export type TotpCodeInput = Static<typeof TotpCodePayload>

export const MfaCodePayload = t.Object(
	{
		code: t.String({
			minLength: 6,
			maxLength: 32,
			description:
				'6-значный код из приложения-аутентификатора или один из резервных кодов (`xxxxx-xxxxx`, регистр и дефис не важны).',
			error: 'Code must be an authenticator or recovery code',
			examples: ['492039', 'k7m3p-x9q2w']
		})
	},
	{ description: 'Подтверждение действия вторым фактором.' }
)

export type MfaCodeInput = Static<typeof MfaCodePayload>

export const RecoveryCodesResponse = t.Object(
	{
		codes: t.Array(t.String({ examples: ['k7m3p-x9q2w'] }), {
			description:
				'Резервные коды, каждый одноразовый. Показываются только сейчас - на сервере хранятся лишь их хэши. Прежние коды больше не действуют.',
			examples: [['k7m3p-x9q2w', 'b4n8r-t2v6y', 'h3j9d-c5f7g']]
		})
	},
	{ description: 'Новый набор резервных кодов.' }
)

export const RecoveryCodesStatusResponse = t.Object(
	{
		total: t.Number({
			description: 'Сколько кодов выпущено в текущем наборе.',
			examples: [10]
		}),
		remaining: t.Number({ description: 'Сколько из них ещё не использовано.', examples: [8] }),
		generatedAt: t.Nullable(
			t.String({
				description: 'Когда выпущен текущий набор. `null`, если кодов нет.',
				examples: ['2026-09-30T14:16:54.000Z']
			})
		)
	},
	{ description: 'Состояние резервных кодов. Сами коды повторно не показываются.' }
)

export const MfaStatusResponse = t.Object(
	{
		enabled: t.Boolean({
			description:
				'Включена ли двухфакторная защита: подключено приложение-аутентификатор или добавлен хотя бы один ключ. Если да, вход по паролю или через соцсеть требует второй фактор.'
		}),
		methods: t.Array(MfaMethodSchema, {
			description:
				'Способы, которыми сейчас можно подтвердить вход - как `mfaMethods` в ответе на вход.',
			examples: [['WEBAUTHN', 'TOTP', 'RECOVERY_CODE']]
		}),
		totp: t.Object(
			{
				enabled: t.Boolean({ description: 'Подключено ли приложение-аутентификатор.' }),
				enabledAt: t.Nullable(
					t.String({
						description: 'Когда подключено. `null`, если не подключено.',
						examples: ['2026-09-30T14:16:54.000Z']
					})
				)
			},
			{ description: 'Приложение-аутентификатор.' }
		),
		webauthn: t.Object(
			{
				credentials: t.Number({
					description:
						'Сколько ключей добавлено. Список - `GET /auth/webauthn/credentials`.',
					examples: [2]
				})
			},
			{ description: 'Ключи доступа и аппаратные ключи.' }
		),
		recoveryCodes: RecoveryCodesStatusResponse
	},
	{ description: 'Состояние двухфакторной защиты аккаунта.' }
)
