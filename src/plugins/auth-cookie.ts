import { Elysia } from 'elysia'

import { env } from '~/config/env'

export const ACCESS_COOKIE = 'tc_access'
export const REFRESH_COOKIE = 'tc_refresh'

const BASE_OPTIONS = {
	httpOnly: true,
	domain: env.COOKIE_DOMAIN,
	secure: env.COOKIE_SECURE,
	sameSite: env.COOKIE_SAMESITE
} as const

export interface TokenPairCookies {
	accessToken: string
	refreshToken: string
}

export const authCookie = new Elysia({ name: 'auth-cookie' }).derive(
	{ as: 'global' },
	({ cookie }) => ({
		authCookie: {
			set: ({ accessToken, refreshToken }: TokenPairCookies) => {
				cookie[ACCESS_COOKIE].set({
					value: accessToken,
					path: '/',
					maxAge: env.ACCESS_TOKEN_TTL,
					...BASE_OPTIONS
				})

				/** Scoped to /auth/refresh so it's never sent along with ordinary requests. */
				cookie[REFRESH_COOKIE].set({
					value: refreshToken,
					path: '/auth/refresh',
					maxAge: env.SESSION_TTL,
					...BASE_OPTIONS
				})
			},
			clear: () => {
				cookie[ACCESS_COOKIE].set({ value: '', path: '/', maxAge: 0, ...BASE_OPTIONS })
				cookie[REFRESH_COOKIE].set({
					value: '',
					path: '/auth/refresh',
					maxAge: 0,
					...BASE_OPTIONS
				})
			}
		}
	})
)
