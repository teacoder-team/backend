import { type AuthProvider, Prisma } from '@prisma/generated/client'

import { ConflictError } from '~/lib/errors'
import { providerLabel } from '~/lib/integrations/oauth'
import { extendLogContext } from '~/lib/logger'

import { enqueueAccountLinked } from './jobs'
import { findOAuthAccount, findUserOAuthAccount, linkOAuthAccount } from './repository'

export interface OAuthIdentity {
	provider: AuthProvider
	providerAccountId: string
}

export const assertCanAttach = async (
	userId: string,
	{ provider, providerAccountId }: OAuthIdentity
) => {
	const [owner, sameProvider] = await Promise.all([
		findOAuthAccount(provider, providerAccountId),
		findUserOAuthAccount(userId, provider)
	])
	const label = providerLabel(provider)

	if (owner?.userId === userId) {
		throw new ConflictError(`This ${label} account is already linked to your profile`)
	}

	if (owner) {
		throw new ConflictError(
			`This ${label} account is already linked to another TeaCoder account`
		)
	}

	if (sameProvider) {
		throw new ConflictError(`Another ${label} account is already linked - unlink it first`)
	}
}

const isUniqueViolation = (err: unknown) =>
	err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'

export const attachOAuthAccount = async (
	userId: string,
	identity: OAuthIdentity,
	automatic: boolean
) => {
	await assertCanAttach(userId, identity)

	try {
		await linkOAuthAccount(userId, identity.provider, identity.providerAccountId)
	} catch (err) {
		if (isUniqueViolation(err)) {
			throw new ConflictError(
				`This ${providerLabel(identity.provider)} account is already linked`
			)
		}

		throw err
	}

	extendLogContext({
		event: automatic ? 'oauth_account_auto_linked' : 'oauth_account_linked',
		userId,
		provider: identity.provider
	})

	await enqueueAccountLinked({
		userId,
		provider: identity.provider,
		automatic,
		at: new Date().toISOString()
	})
}
