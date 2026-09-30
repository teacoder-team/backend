import { Elysia } from 'elysia'

import { env } from '~/config/env'

if (env.COOKIE_SAMESITE === 'none' && !env.COOKIE_SECURE) {
	throw new Error('COOKIE_SAMESITE=none requires COOKIE_SECURE=true - browsers drop such cookies')
}

export const REFRESH_COOKIE = 'tc_refresh'
export const OAUTH_BINDING_COOKIE = 'tc_oauth'

const BASE_OPTIONS = {
	httpOnly: true,
	domain: env.COOKIE_DOMAIN,
	secure: env.COOKIE_SECURE,
	sameSite: env.COOKIE_SAMESITE
} as const

const REFRESH_OPTIONS = { ...BASE_OPTIONS, path: '/auth/refresh' } as const

const OAUTH_BINDING_OPTIONS = { ...BASE_OPTIONS, path: '/auth/sso' } as const

export const authCookie = new Elysia({ name: 'auth-cookie' }).derive(
	{ as: 'global' },
	({ cookie }) => ({
		authCookie: {
			issue: <T extends { refreshToken: string }>({
				refreshToken,
				...body
			}: T): Omit<T, 'refreshToken'> => {
				cookie[REFRESH_COOKIE].set({
					value: refreshToken,
					maxAge: env.SESSION_TTL,
					...REFRESH_OPTIONS
				})

				return body
			},
			read: () => cookie[REFRESH_COOKIE]?.value as string | undefined,
			clear: () => {
				cookie[REFRESH_COOKIE].set({ value: '', maxAge: 0, ...REFRESH_OPTIONS })
			}
		},
		/** Ties an OAuth flow to the browser that started it - see `oauth/service.ts`. */
		oauthBinding: {
			read: () => cookie[OAUTH_BINDING_COOKIE]?.value as string | undefined,
			set: (value: string) => {
				cookie[OAUTH_BINDING_COOKIE].set({
					value,
					maxAge: env.OAUTH_STATE_TTL,
					...OAUTH_BINDING_OPTIONS
				})
			}
		}
	})
)
