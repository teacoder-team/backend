import { jwtVerify, SignJWT } from 'jose'

import { env } from '~/config/env'
import { UnauthorizedError } from '~/shared/errors'

const secret = new TextEncoder().encode(env.JWT_SECRET)

export interface AccessTokenPayload {
	[claim: string]: unknown
	/** User id. */
	sub: string
	/** Session id. */
	sid: string
}

export const signAccessToken = (payload: AccessTokenPayload): Promise<string> =>
	new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(`${env.ACCESS_TOKEN_TTL}s`)
		.sign(secret)

export const verifyAccessToken = async (token: string): Promise<AccessTokenPayload> => {
	try {
		const { payload } = await jwtVerify(token, secret)

		if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
			throw new Error('Malformed access token payload')
		}

		return { sub: payload.sub, sid: payload.sid }
	} catch {
		throw new UnauthorizedError('Invalid or expired access token')
	}
}
