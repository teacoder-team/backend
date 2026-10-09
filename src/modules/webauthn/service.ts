import {
	type AuthenticationResponseJSON,
	generateAuthenticationOptions,
	generateRegistrationOptions,
	type RegistrationResponseJSON,
	verifyAuthenticationResponse,
	verifyRegistrationResponse
} from '@simplewebauthn/server'
import { UAParser } from 'ua-parser-js'

import { Prisma, WebAuthnDeviceType } from '@prisma/generated/client'

import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '~/lib/errors'
import { WEBAUTHN_RP } from '~/lib/integrations/webauthn'
import { extendLogContext, logger } from '~/lib/logger'
import { redis } from '~/lib/redis'
import { updateLastLogin } from '~/modules/auth/repository'
import { completeMfaSignIn, takeTicket } from '~/modules/auth/service'
import { issueRecoveryCodesIfMissing } from '~/modules/mfa/service'
import type { RequestOrigin } from '~/modules/session/model'
import { issueTokenPair } from '~/modules/session/service'

import type { WebAuthnLoginInput, WebAuthnLoginOptionsInput, WebAuthnRegisterInput } from './model'
import {
	createWebAuthnCredential,
	deleteWebAuthnCredential,
	findRegistrationSubject,
	findWebAuthnCredential,
	listWebAuthnCredentials,
	recordWebAuthnUse
} from './repository'

const CHALLENGE_TTL = 5 * 60

const EMPTY_AAGUID = '00000000-0000-0000-0000-000000000000'

const registrationKey = (userId: string) => `webauthn:register:${userId}`
const loginKey = (challenge: string) => `webauthn:login:${challenge}`

interface LoginChallenge {
	userId: string | null
}

type StoredCredential = Awaited<ReturnType<typeof listWebAuthnCredentials>>[number]

const toBase64Url = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64url')

const toDescriptor = (credential: Pick<StoredCredential, 'credentialId' | 'transports'>) => ({
	id: toBase64Url(credential.credentialId),
	transports: credential.transports
})

const toCredentialResponse = (credential: StoredCredential) => ({
	id: credential.id,
	name: credential.name,
	deviceType: credential.deviceType,
	backedUp: credential.backedUp,
	transports: credential.transports,
	lastUsedAt: credential.lastUsedAt?.toISOString() ?? null,
	createdAt: credential.createdAt.toISOString()
})

const defaultName = (transports: string[], userAgent: string) => {
	const isHardwareKey =
		!transports.includes('internal') && transports.some((transport) => transport !== 'hybrid')

	if (isHardwareKey) {
		return 'Ключ безопасности'
	}

	const agent = new UAParser(userAgent).getResult()
	const parts = [agent.browser.name, agent.os.name].filter(Boolean)

	return parts.length ? parts.join(', ') : 'Ключ доступа'
}

const isUniqueViolation = (err: unknown) =>
	err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'

const describe = (err: unknown) => (err instanceof Error ? err.message : String(err))

export const startRegistration = async (userId: string) => {
	const subject = await findRegistrationSubject(userId)

	if (!subject) {
		throw new NotFoundError('User not found')
	}

	const options = await generateRegistrationOptions({
		rpName: WEBAUTHN_RP.name,
		rpID: WEBAUTHN_RP.id,
		userID: new TextEncoder().encode(userId),
		userName: subject.email ?? `@${subject.username}`,
		userDisplayName: subject.displayName,
		attestationType: 'none',
		excludeCredentials: subject.webauthnCredentials.map(toDescriptor),
		authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
		timeout: CHALLENGE_TTL * 1000
	})

	await redis.set(registrationKey(userId), options.challenge, 'EX', CHALLENGE_TTL)

	return options
}

export const finishRegistration = async (
	userId: string,
	{ response, name }: WebAuthnRegisterInput,
	userAgent: string
) => {
	const expectedChallenge = await redis.getdel(registrationKey(userId))

	if (!expectedChallenge) {
		throw new BadRequestError('Registration expired - request new options')
	}

	const verification = await verifyRegistrationResponse({
		response: response as RegistrationResponseJSON,
		expectedChallenge,
		expectedOrigin: WEBAUTHN_RP.origins,
		expectedRPID: WEBAUTHN_RP.id,
		requireUserVerification: false
	}).catch((err: unknown) => {
		throw new BadRequestError(`Security key could not be verified: ${describe(err)}`)
	})

	if (!verification.verified) {
		throw new BadRequestError('Security key could not be verified')
	}

	const { credential, aaguid, credentialDeviceType, credentialBackedUp } =
		verification.registrationInfo
	const transports = credential.transports ?? []

	if (await findWebAuthnCredential(Buffer.from(credential.id, 'base64url'))) {
		throw new ConflictError('This security key is already registered')
	}

	let created: StoredCredential

	try {
		created = await createWebAuthnCredential({
			userId,
			credentialId: Buffer.from(credential.id, 'base64url'),
			publicKey: credential.publicKey,
			signCount: credential.counter,
			transports,
			aaguid: aaguid === EMPTY_AAGUID ? null : aaguid,
			deviceType:
				credentialDeviceType === 'multiDevice'
					? WebAuthnDeviceType.MULTI_DEVICE
					: WebAuthnDeviceType.SINGLE_DEVICE,
			backedUp: credentialBackedUp,
			name: name?.trim() || defaultName(transports, userAgent)
		})
	} catch (err) {
		if (isUniqueViolation(err)) {
			throw new ConflictError('This security key is already registered')
		}

		throw err
	}

	const recoveryCodes = await issueRecoveryCodesIfMissing(userId)

	extendLogContext({ event: 'webauthn_credential_registered', userId, credentialId: created.id })

	return { credential: toCredentialResponse(created), recoveryCodes }
}

export const startLogin = async ({ mfaToken }: WebAuthnLoginOptionsInput) => {
	let challenge: LoginChallenge = { userId: null }
	let allowCredentials: ReturnType<typeof toDescriptor>[] | undefined

	if (mfaToken) {
		const ticket = await takeTicket(mfaToken)
		const credentials = await listWebAuthnCredentials(ticket.userId)

		if (credentials.length === 0) {
			throw new BadRequestError('No security keys registered for this account')
		}

		challenge = { userId: ticket.userId }
		allowCredentials = credentials.map(toDescriptor)
	}

	const options = await generateAuthenticationOptions({
		rpID: WEBAUTHN_RP.id,
		allowCredentials,
		userVerification: mfaToken ? 'preferred' : 'required',
		timeout: CHALLENGE_TTL * 1000
	})

	await redis.set(loginKey(options.challenge), JSON.stringify(challenge), 'EX', CHALLENGE_TTL)

	return options
}

const readChallenge = (clientDataJSON: string) => {
	try {
		const clientData = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8'))

		if (typeof clientData.challenge === 'string') {
			return clientData.challenge
		}
	} catch {

	}

	throw new BadRequestError('Malformed WebAuthn response')
}

export const finishLogin = async (
	{ response, mfaToken }: WebAuthnLoginInput,
	origin: RequestOrigin
) => {
	const challenge = readChallenge(response.response.clientDataJSON)
	const parked = await redis.getdel(loginKey(challenge))

	if (!parked) {
		throw new BadRequestError('Sign-in request expired - request new options')
	}

	const { userId: expectedUserId } = JSON.parse(parked) as LoginChallenge
	const ticket = mfaToken ? await takeTicket(mfaToken) : null

	if ((ticket?.userId ?? null) !== expectedUserId) {
		throw new BadRequestError('These options were issued for a different sign-in')
	}

	const stored = await findWebAuthnCredential(Buffer.from(response.id, 'base64url'))
	const userHandle = response.response.userHandle

	if (
		!stored ||
		(ticket && stored.userId !== ticket.userId) ||
		(userHandle && Buffer.from(userHandle, 'base64url').toString('utf8') !== stored.userId)
	) {
		throw new UnauthorizedError('Unknown security key')
	}

	const verification = await verifyAuthenticationResponse({
		response: response as AuthenticationResponseJSON,
		expectedChallenge: challenge,
		expectedOrigin: WEBAUTHN_RP.origins,
		expectedRPID: WEBAUTHN_RP.id,
		credential: {
			id: toBase64Url(stored.credentialId),
			publicKey: new Uint8Array(stored.publicKey),
			counter: Number(stored.signCount),
			transports: stored.transports
		},
		requireUserVerification: !ticket
	}).catch((err: unknown) => {
		logger.warn(
			{
				context: 'webauthn',
				credentialId: stored.id,
				userId: stored.userId,
				reason: describe(err)
			},
			'webauthn_assertion_rejected'
		)

		throw new UnauthorizedError('Security key verification failed')
	})

	const { newCounter, credentialBackedUp } = verification.authenticationInfo

	if (
		!verification.verified ||
		!(await recordWebAuthnUse(stored.id, stored.signCount, newCounter, credentialBackedUp))
	) {
		throw new UnauthorizedError('Security key verification failed')
	}

	if (ticket && mfaToken) {
		return await completeMfaSignIn(mfaToken, ticket, 'WEBAUTHN', origin)
	}

	await updateLastLogin(stored.userId)

	extendLogContext({ event: 'passkey_sign_in', userId: stored.userId, credentialId: stored.id })

	const tokens = await issueTokenPair(stored.userId, origin)

	return { id: stored.userId, ...tokens, linkedProvider: null }
}

export const getCredentials = async (userId: string) =>
	(await listWebAuthnCredentials(userId)).map(toCredentialResponse)

export const removeCredential = async (userId: string, credentialId: string) => {
	if (!(await deleteWebAuthnCredential(userId, credentialId))) {
		throw new NotFoundError('Security key not found')
	}

	extendLogContext({ event: 'webauthn_credential_removed', userId, credentialId })
}
