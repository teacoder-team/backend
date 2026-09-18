import { createHash, randomBytes } from 'node:crypto'

import type { AuthProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { extendLogContext } from '~/infra/logger'
import { OAUTH_PROVIDERS, type OAuthProviderName } from '~/infra/oauth/registry'
import type { OAuthProfile } from '~/infra/oauth/types'
import { redis } from '~/infra/redis'
import { findUserByEmailHash } from '~/modules/auth/repository'
import { issueTokenPair, type RequestOrigin } from '~/modules/session/service'
import { normalizeEmail } from '~/shared/email'
import { BadRequestError, ForbiddenError } from '~/shared/errors'
import { encryptEmail, hashEmail } from '~/shared/security/email-crypto'
import { generateUsername } from '~/shared/username'

import { createOAuthUser, findOAuthAccount, linkOAuthAccount } from './repository'

const stateKey = (id: string) => `oauth:state:${id}`

interface OAuthState extends RequestOrigin {
	provider: OAuthProviderName
	codeVerifier?: string
}

const base64Url = (buffer: Buffer) =>
	buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const generatePkce = () => {
	const verifier = base64Url(randomBytes(64))
	const challenge = base64Url(createHash('sha256').update(verifier).digest())

	return { verifier, challenge }
}

const resolveProvider = (name: string) => {
	const provider = OAUTH_PROVIDERS[name as OAuthProviderName]

	if (!provider) throw new BadRequestError(`OAuth provider "${name}" is not supported`)

	return provider
}

const callbackUrl = (name: string) => `${env.APP_PUBLIC_URL}/oauth/${name}/callback`

export const startOAuth = async (providerName: string, origin: RequestOrigin) => {
	const provider = resolveProvider(providerName)
	const stateId = randomBytes(24).toString('base64url')

	const state: OAuthState = { provider: providerName as OAuthProviderName, ...origin }

	let codeChallenge: string | undefined

	if (provider.usesPkce) {
		const pkce = generatePkce()

		state.codeVerifier = pkce.verifier
		codeChallenge = pkce.challenge
	}

	await redis.set(stateKey(stateId), JSON.stringify(state), 'EX', env.OAUTH_STATE_TTL)

	const url = provider.buildAuthorizeUrl({
		state: stateId,
		redirectUri: callbackUrl(providerName),
		codeChallenge
	})

	return { url }
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

export const finishOAuth = async (
	providerName: string,
	query: Record<string, string | undefined>
) => {
	const stateId = query.state

	if (!stateId) throw new BadRequestError('Missing OAuth state')

	const raw = await redis.get(stateKey(stateId))

	if (!raw) throw new ForbiddenError('OAuth state expired or already used')

	await redis.del(stateKey(stateId))

	const state = JSON.parse(raw) as OAuthState

	if (state.provider !== providerName) {
		throw new ForbiddenError('OAuth state does not match provider')
	}

	const provider = resolveProvider(providerName)

	const profile = await provider.authenticate({
		query,
		redirectUri: callbackUrl(providerName),
		codeVerifier: state.codeVerifier
	})

	const { user, outcome } = await resolveUser(provider.provider, profile)

	extendLogContext({
		event: 'oauth_authenticated',
		provider: providerName,
		outcome,
		userId: user.id
	})

	const tokens = await issueTokenPair(user.id, { ip: state.ip, userAgent: state.userAgent })

	return { id: user.id, ...tokens }
}
