import { Elysia } from 'elysia'

import { env } from '@/config/env'

export const SESSION_COOKIE = 'tc_token'

const COOKIE_OPTIONS = {
	httpOnly: true,
	path: '/',
	domain: env.COOKIE_DOMAIN,
	secure: env.COOKIE_SECURE,
	sameSite: env.COOKIE_SAMESITE,
	maxAge: env.SESSION_TTL,
} as const

/** One definition of the session cookie, shared by every route that sets it. */
export const authCookie = new Elysia({ name: 'auth-cookie' }).derive(
	{ as: 'global' },
	({ cookie }) => ({
		authCookie: {
			set: (token: string) =>
				cookie[SESSION_COOKIE].set({ value: token, ...COOKIE_OPTIONS }),
			clear: () =>
				cookie[SESSION_COOKIE].set({
					...COOKIE_OPTIONS,
					value: '',
					maxAge: 0,
				}),
		},
	}),
)
