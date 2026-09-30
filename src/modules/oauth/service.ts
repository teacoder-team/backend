import {
	type AuthorizationRequest,
	completeAuthorization,
	createAuthorization,
	OAuthDeniedError,
	OAuthError,
	type OAuthProfile
} from '@teacoder/oauth'

import type { AuthProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { normalizeEmail } from '~/lib/utils/email'
import { BadRequestError, ForbiddenError } from '~/lib/errors'
import { extendLogContext, logger } from '~/lib/logger'
import {
	AUTH_PROVIDER,
	isOAuthProvider,
	OAUTH_PROVIDERS,
	type OAuthProviderName
} from '~/lib/integrations/oauth'
import { redis } from '~/lib/redis'
import { encryptEmail, hashEmail } from '~/lib/security/email-crypto'
import { generateUsername } from '~/lib/utils/username'
import { findUserByEmailHash } from '~/modules/auth/repository'
import { issueTokenPair, type RequestOrigin } from '~/modules/session/service'

import { createOAuthUser, findOAuthAccount, linkOAuthAccount } from './repository'

const stateKey = (state: string) => `oauth:state:${state}`

/** Parked in Redis under the state value between the redirect out and the callback. */
interface OAuthSession extends RequestOrigin {
	provider: OAuthProviderName
	codeVerifier?: string
}

const resolveProvider = (name: string): OAuthProviderName => {
	if (!isOAuthProvider(name))
		throw new BadRequestError(`OAuth provider "${name}" is not supported`)

	return name
}

/** openid-client derives the token request's redirect_uri from this, minus the query. */
const callbackUrl = (name: OAuthProviderName) =>
	new URL(`${env.GATEWAY_URL}/oauth/${name}/callback`)

export const startOAuth = async (providerName: string, origin: RequestOrigin) => {
	const name = resolveProvider(providerName)

	const { url, state, codeVerifier } = await createAuthorization(OAUTH_PROVIDERS[name], {
		redirectUri: callbackUrl(name).href
	})

	const session: OAuthSession = { provider: name, codeVerifier, ...origin }

	await redis.set(stateKey(state), JSON.stringify(session), 'EX', env.OAUTH_STATE_TTL)

	return { url }
}

const takeSession = async (state: string) => {
	const raw = await redis.get(stateKey(state))

	if (!raw) throw new ForbiddenError('OAuth state expired or already used')

	await redis.del(stateKey(state))

	return JSON.parse(raw) as OAuthSession
}

const authenticate = async (
	name: OAuthProviderName,
	callback: URL,
	checks: Pick<AuthorizationRequest, 'state' | 'codeVerifier'>
) => {
	try {
		return await completeAuthorization(OAUTH_PROVIDERS[name], callback, checks)
	} catch (err) {
		if (!(err instanceof OAuthError)) throw err

		if (!(err instanceof OAuthDeniedError)) {
			logger.warn(
				{ context: 'oauth', provider: name, reason: err.name, err: err.cause ?? err },
				'oauth_authentication_failed'
			)
		}

		throw new BadRequestError(err.message)
	}
}

const resolveUser = async (provider: AuthProvider, profile: OAuthProfile) => {
	const existing = await findOAuthAccount(provider, profile.providerAccountId)

	if (existing) return { user: existing.user, outcome: 'login' as const }

	if (profile.email) {
		const byEmail = await findUserByEmailHash(hashEmail(normalizeEmail(profile.email)))

		if (byEmail) {
			await linkOAuthAccount(byEmail.id, provider, profile.providerAccountId)

			return { user: byEmail, outcome: 'linked' as const }
		}
	}

	const encrypted = profile.email ? encryptEmail(normalizeEmail(profile.email)) : null

	const user = await createOAuthUser({
		provider,
		providerAccountId: profile.providerAccountId,
		displayName: profile.name,
		username: generateUsername(),
		avatar: profile.avatarUrl,
		emailCipher: encrypted?.cipher ?? null,
		emailHash: encrypted?.hash ?? null
	})

	return { user, outcome: 'signup' as const }
}

/** `search` is the raw callback query string, handed to openid-client untouched. */
export const finishOAuth = async (providerName: string, search: string) => {
	const name = resolveProvider(providerName)
	const callback = callbackUrl(name)

	callback.search = search

	const state = callback.searchParams.get('state')

	if (!state) throw new BadRequestError('Missing OAuth state')

	const session = await takeSession(state)

	if (session.provider !== name) throw new ForbiddenError('OAuth state does not match provider')

	const profile = await authenticate(name, callback, {
		state,
		codeVerifier: session.codeVerifier
	})
	const { user, outcome } = await resolveUser(AUTH_PROVIDER[name], profile)

	extendLogContext({ event: 'oauth_authenticated', provider: name, outcome, userId: user.id })

	const tokens = await issueTokenPair(user.id, { ip: session.ip, userAgent: session.userAgent })

	return { id: user.id, ...tokens }
}
