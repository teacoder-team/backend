import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

import {
	type AuthorizationRequest,
	completeAuthorization,
	createAuthorization,
	describeOAuthFailure,
	OAuthDeniedError,
	OAuthError,
	OAuthExchangeError,
	type OAuthProfile
} from '@teacoder/oauth'

import { type AuthProvider, UserStatus } from '@prisma/generated/client'

import { env } from '~/config/env'
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '~/lib/errors'
import {
	AUTH_PROVIDER,
	isOAuthProvider,
	OAUTH_PROVIDER_NAMES,
	OAUTH_PROVIDERS,
	type OAuthProviderName,
	oauthRedirectUri,
	providerLabel
} from '~/lib/integrations/oauth'
import { extendLogContext, logger } from '~/lib/logger'
import { redis } from '~/lib/redis'
import { encryptEmail, hashEmail } from '~/lib/security/email-crypto'
import { normalizeEmail } from '~/lib/utils/email'
import { generateUsername } from '~/lib/utils/username'
import { enqueueRegistrationNotification } from '~/modules/admin-bot/queue'
import { deletePendingUser, findUserByEmailHash } from '~/modules/auth/repository'
import { completeSignIn } from '~/modules/auth/service'
import { findActiveSession } from '~/modules/session/repository'
import type { RequestOrigin } from '~/modules/session/service'

import { assertCanAttach, attachOAuthAccount, type OAuthIdentity } from './accounts'
import {
	createOAuthUser,
	findOAuthAccount,
	findSignInMethods,
	listUserOAuthAccounts,
	unlinkOAuthAccount
} from './repository'

const stateKey = (state: string) => `oauth:state:${state}`

/** Who started a link from the account settings - checked again when the provider returns. */
interface LinkRequest {
	userId: string
	sessionId: string
}

/** Parked in Redis under the state value between the redirect out and the callback. */
interface OAuthState extends RequestOrigin {
	provider: OAuthProviderName
	/** Kept rather than recomputed, so an env change mid-flow can't break the token exchange. */
	redirectUri: string
	/** SHA-256 of the browser binding cookie. */
	bindingHash: string
	codeVerifier?: string
	link?: LinkRequest
}

const BINDING_PATTERN = /^[A-Za-z0-9_-]{43}$/

const hashBinding = (binding: string) => createHash('sha256').update(binding).digest()

const ensureBinding = (existing: string | undefined) =>
	existing && BINDING_PATTERN.test(existing) ? existing : randomBytes(32).toString('base64url')

/**
 * Stops login CSRF: without it an attacker could start a flow on their own account and hand
 * the victim the provider's callback URL, silently signing the victim into it.
 */
const assertSameBrowser = (state: OAuthState, binding: string | undefined) => {
	const expected = Buffer.from(state.bindingHash, 'hex')

	if (
		!binding ||
		!BINDING_PATTERN.test(binding) ||
		!timingSafeEqual(hashBinding(binding), expected)
	) {
		throw new ForbiddenError('OAuth sign-in must be finished in the browser that started it')
	}
}

const isLinked = (accounts: { provider: AuthProvider }[], provider: AuthProvider) =>
	accounts.some((account) => account.provider === provider)

/** Password + linked providers - unlinking must never leave an account with none. */
const countSignInMethods = async (userId: string) => {
	const methods = await findSignInMethods(userId)

	return (methods?.passwordCredential ? 1 : 0) + (methods?._count.oauthAccounts ?? 0)
}

const resolveProvider = (name: string): OAuthProviderName => {
	if (!isOAuthProvider(name)) {
		throw new BadRequestError(`OAuth provider "${name}" is not supported`)
	}

	return name
}

/**
 * Sign-in and linking share one redirect URI - the site's callback page, registered with each
 * provider. `binding` is the browser's `tc_oauth` cookie, if it already has one.
 */
const beginAuthorization = async (
	name: OAuthProviderName,
	origin: RequestOrigin,
	existingBinding: string | undefined,
	link?: LinkRequest
) => {
	const redirectUri = oauthRedirectUri(name)
	const binding = ensureBinding(existingBinding)

	const { url, state, codeVerifier } = await createAuthorization(OAUTH_PROVIDERS[name], {
		redirectUri
	})

	const parked: OAuthState = {
		provider: name,
		redirectUri,
		bindingHash: hashBinding(binding).toString('hex'),
		codeVerifier,
		link,
		...origin
	}

	await redis.set(stateKey(state), JSON.stringify(parked), 'EX', env.OAUTH_STATE_TTL)

	return { url, binding }
}

export const startOAuth = async (
	providerName: string,
	origin: RequestOrigin,
	binding: string | undefined
) => await beginAuthorization(resolveProvider(providerName), origin, binding)

export const startOAuthLink = async (
	providerName: string,
	link: LinkRequest,
	origin: RequestOrigin,
	binding: string | undefined
) => {
	const name = resolveProvider(providerName)

	if (isLinked(await listUserOAuthAccounts(link.userId), AUTH_PROVIDER[name])) {
		throw new BadRequestError(`${providerLabel(AUTH_PROVIDER[name])} is already linked`)
	}

	return await beginAuthorization(name, origin, binding, link)
}

/** Atomic, so the same state can't be redeemed by two callbacks racing each other. */
const takeState = async (state: string) => {
	const raw = await redis.getdel(stateKey(state))

	if (!raw) {
		throw new ForbiddenError('OAuth state expired or already used')
	}

	return JSON.parse(raw) as OAuthState
}

const authenticate = async (
	name: OAuthProviderName,
	callback: URL,
	checks: Pick<AuthorizationRequest, 'state' | 'codeVerifier'>
) => {
	try {
		return await completeAuthorization(OAUTH_PROVIDERS[name], callback, checks)
	} catch (err) {
		if (!(err instanceof OAuthError)) {
			throw err
		}

		if (!(err instanceof OAuthDeniedError)) {
			logger.warn(
				{
					context: 'oauth',
					provider: name,
					reason: err instanceof OAuthExchangeError ? err.reason : 'profile',
					failure: describeOAuthFailure(err)
				},
				'oauth_authentication_failed'
			)
		}

		throw new BadRequestError(err.message)
	}
}

type ResolvedUser =
	| { outcome: 'login'; userId: string }
	| { outcome: 'email_match'; userId: string }
	| { outcome: 'signup'; userId: string }

const signUp = async (provider: AuthProvider, profile: OAuthProfile) => {
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

	return user.id
}

/** `profile.email` is set only when the provider verified it, so matching by it is safe. */
const resolveUser = async (
	provider: AuthProvider,
	profile: OAuthProfile
): Promise<ResolvedUser> => {
	const existing = await findOAuthAccount(provider, profile.providerAccountId)

	if (existing) {
		return { outcome: 'login', userId: existing.userId }
	}

	const byEmail = profile.email
		? await findUserByEmailHash(hashEmail(normalizeEmail(profile.email)))
		: null

	/**
	 * An unconfirmed email registration proves nothing about who owns the address - it may be
	 * a squatter's. The provider just proved ownership, so the pending account gives way.
	 */
	if (byEmail?.status === UserStatus.PENDING) {
		await deletePendingUser(byEmail.id)
	} else if (byEmail) {
		return { outcome: 'email_match', userId: byEmail.id }
	}

	return { outcome: 'signup', userId: await signUp(provider, profile) }
}

const finishSignIn = async (name: OAuthProviderName, state: OAuthState, profile: OAuthProfile) => {
	const provider = AUTH_PROVIDER[name]
	const { outcome, userId } = await resolveUser(provider, profile)
	const identity: OAuthIdentity = { provider, providerAccountId: profile.providerAccountId }

	if (outcome === 'email_match') {
		await assertCanAttach(userId, identity)
	}

	extendLogContext({ event: 'oauth_authenticated', provider: name, outcome, userId })

	const result = await completeSignIn(
		userId,
		{ ip: state.ip, userAgent: state.userAgent, visitorId: state.visitorId },
		name,
		{ link: outcome === 'email_match' ? identity : undefined }
	)

	if (outcome === 'signup') {
		await enqueueRegistrationNotification({ userId, via: provider })
	}

	return { intent: 'SIGN_IN' as const, ...result }
}

const finishLink = async (name: OAuthProviderName, link: LinkRequest, profile: OAuthProfile) => {
	const session = await findActiveSession(link.sessionId)

	if (session?.userId !== link.userId) {
		throw new UnauthorizedError('Session ended before linking finished - sign in and try again')
	}

	const provider = AUTH_PROVIDER[name]

	await attachOAuthAccount(
		link.userId,
		{ provider, providerAccountId: profile.providerAccountId },
		false
	)

	return { intent: 'LINK' as const, provider }
}

/** `search` is the raw callback query string, handed to openid-client untouched. */
/**
 * `query` is the query string the provider appended to the site's callback page, passed on
 * untouched - openid-client rebuilds the exact redirect_uri from it.
 */
export const finishOAuth = async (
	providerName: string,
	query: string,
	binding: string | undefined
) => {
	const name = resolveProvider(providerName)
	const stateValue = new URLSearchParams(query).get('state')

	if (!stateValue) {
		throw new BadRequestError('Missing OAuth state')
	}

	const state = await takeState(stateValue)

	if (state.provider !== name) {
		throw new ForbiddenError('OAuth state does not match provider')
	}

	assertSameBrowser(state, binding)

	const callback = new URL(state.redirectUri)

	callback.search = query

	const profile = await authenticate(name, callback, {
		state: stateValue,
		codeVerifier: state.codeVerifier
	})

	if (state.link) {
		return await finishLink(name, state.link, profile)
	}

	return await finishSignIn(name, state, profile)
}

export const getOAuthAccounts = async (userId: string) => {
	const [linked, signInMethods] = await Promise.all([
		listUserOAuthAccounts(userId),
		countSignInMethods(userId)
	])
	const linkedAt = new Map(linked.map((account) => [account.provider, account.linkedAt]))

	return {
		accounts: OAUTH_PROVIDER_NAMES.map((slug) => {
			const provider = AUTH_PROVIDER[slug]
			const at = linkedAt.get(provider)

			return {
				provider,
				slug,
				linked: Boolean(at),
				linkedAt: at?.toISOString() ?? null
			}
		}),
		canUnlink: signInMethods > 1
	}
}

export const unlinkOAuth = async (userId: string, providerName: string) => {
	const provider = AUTH_PROVIDER[resolveProvider(providerName)]
	const [linked, signInMethods] = await Promise.all([
		listUserOAuthAccounts(userId),
		countSignInMethods(userId)
	])

	if (!isLinked(linked, provider)) {
		throw new NotFoundError(`${providerLabel(provider)} is not linked`)
	}

	if (signInMethods <= 1) {
		throw new BadRequestError(
			'Cannot unlink the only way to sign in - set a password or link another provider first'
		)
	}

	await unlinkOAuthAccount(userId, provider)

	extendLogContext({ event: 'oauth_account_unlinked', userId, provider })
}
