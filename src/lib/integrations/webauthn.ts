import { env } from '~/config/env'
import { splitList } from '~/lib/utils/origin'

const appUrl = new URL(env.APP_URL)

export const WEBAUTHN_RP = {
	id: env.WEBAUTHN_RP_ID || appUrl.hostname,
	name: 'TeaCoder',
	origins: env.WEBAUTHN_ORIGINS ? splitList(env.WEBAUTHN_ORIGINS) : [appUrl.origin]
}
