import { env } from '~/config/env'

const appUrl = new URL(env.APP_URL)

const splitList = (value: string) =>
	value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean)

export const WEBAUTHN_RP = {
	id: env.WEBAUTHN_RP_ID || appUrl.hostname,
	name: 'TeaCoder',
	origins: env.WEBAUTHN_ORIGINS ? splitList(env.WEBAUTHN_ORIGINS) : [appUrl.origin]
}
