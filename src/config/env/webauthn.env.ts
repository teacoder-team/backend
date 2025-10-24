import { registerAs } from '@nestjs/config'

import type { WebAuthnConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { WebAuthnValidator } from '../validators'

export const webauthnEnv = registerAs<WebAuthnConfig>('webauthn', () => {
	validateEnv(process.env, WebAuthnValidator)

	return {
		rpName: process.env.WEBAUTHN_RP_NAME,
		rpId: process.env.WEBAUTHN_RP_ID,
		origin: process.env.WEBAUTHN_ORIGIN
	}
})
