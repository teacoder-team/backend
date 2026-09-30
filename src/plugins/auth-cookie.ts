import { Elysia } from 'elysia'

import { env } from '~/config/env'

export const REFRESH_COOKIE = 'tc_refresh'

const REFRESH_OPTIONS = {
	httpOnly: true,
	path: '/auth/refresh',
	domain: env.COOKIE_DOMAIN,
	secure: env.COOKIE_SECURE,
	sameSite: env.COOKIE_SAMESITE
} as const

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
		}
	})
)
