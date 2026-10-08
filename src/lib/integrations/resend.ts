import { Resend } from 'resend'

import { env } from '~/config/env'

/**
 * Any Resend-compatible API works through `RESEND_BASE_URL` - the SDK only ever talks HTTP.
 * Passed explicitly because the SDK would otherwise read `process.env` behind the validated env.
 */
export const resend = new Resend(env.RESEND_API_KEY, {
	...(env.RESEND_BASE_URL ? { baseUrl: env.RESEND_BASE_URL.replace(/\/+$/, '') } : {})
})
