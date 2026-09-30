import QRCode from 'qrcode'

import { BadRequestError, ConflictError, TooManyRequestsError } from '~/lib/errors'
import { extendLogContext } from '~/lib/logger'
import { redis } from '~/lib/redis'
import { decryptEmail } from '~/lib/security/email-crypto'
import { generateRecoveryCodes, hashRecoveryCode } from '~/lib/security/recovery-code'
import {
	buildTotpUri,
	decryptTotpSecret,
	encryptTotpSecret,
	generateTotpSecret,
	isTotpCode,
	matchTotp
} from '~/lib/security/totp'

import type { CodeMfaMethod, MfaCodeInput, MfaMethod, TotpCodeInput } from './model'
import {
	claimTotpStep,
	consumeRecoveryCode,
	enableTotp,
	findAccountLabel,
	findMfaFactors,
	findTotpAuthenticator,
	listRecoveryCodes,
	removeTotp,
	replaceRecoveryCodes,
	savePendingTotp
} from './repository'

const TOTP_ISSUER = 'TeaCoder'

const ATTEMPT_MAX = 5
const ATTEMPT_WINDOW = 15 * 60

const attemptKey = (userId: string) => `mfa_attempts:${userId}`

const assertAttemptsLeft = async (userId: string) => {
	const attempts = Number(await redis.get(attemptKey(userId)))

	if (attempts >= ATTEMPT_MAX) {
		throw new TooManyRequestsError('Too many invalid codes - try again later')
	}
}

const recordFailedAttempt = async (userId: string) => {
	await redis
		.pipeline()
		.incr(attemptKey(userId))
		.expire(attemptKey(userId), ATTEMPT_WINDOW)
		.exec()
}

const findEnabledTotp = async (userId: string) => {
	const totp = await findTotpAuthenticator(userId)

	return totp?.confirmedAt ? totp : null
}

export const setupTotp = async (userId: string) => {
	const [existing, account] = await Promise.all([
		findTotpAuthenticator(userId),
		findAccountLabel(userId)
	])

	if (existing?.confirmedAt) {
		throw new ConflictError('Authenticator app is already enabled')
	}

	const secret = generateTotpSecret()

	await savePendingTotp(userId, encryptTotpSecret(secret))

	const otpauthUrl = buildTotpUri({
		secret,
		issuer: TOTP_ISSUER,
		account: account?.emailCipher ? decryptEmail(account.emailCipher) : `@${account?.username}`
	})

	const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
		errorCorrectionLevel: 'M',
		margin: 1,
		width: 256
	})

	extendLogContext({ event: 'totp_setup_started', userId })

	return { secret, otpauthUrl, qrCodeUrl }
}

export const confirmTotp = async (userId: string, { code }: TotpCodeInput) => {
	const totp = await findTotpAuthenticator(userId)

	if (!totp) {
		throw new BadRequestError('Start authenticator setup first')
	}

	if (totp.confirmedAt) {
		throw new ConflictError('Authenticator app is already enabled')
	}

	await assertAttemptsLeft(userId)

	const step = matchTotp(decryptTotpSecret(totp.secretCipher), code, null)

	if (step === null) {
		await recordFailedAttempt(userId)

		throw new BadRequestError('Invalid code')
	}

	const codes = generateRecoveryCodes()
	const enabled = await enableTotp(userId, step, codes.map(hashRecoveryCode))

	if (!enabled) {
		throw new ConflictError('Authenticator app is already enabled')
	}

	await redis.del(attemptKey(userId))

	extendLogContext({ event: 'totp_enabled', userId })

	return { codes }
}

const checkTotp = async (userId: string, code: string) => {
	const totp = await findEnabledTotp(userId)
	const step = totp
		? matchTotp(decryptTotpSecret(totp.secretCipher), code, totp.lastUsedStep)
		: null

	return step !== null && (await claimTotpStep(userId, step))
}

const checkRecoveryCode = async (userId: string, code: string) => {
	const used = await consumeRecoveryCode(userId, hashRecoveryCode(code))

	if (used) {
		extendLogContext({ recoveryCodeUsed: true })
	}

	return used
}

const CHECKS: Record<CodeMfaMethod, (userId: string, code: string) => Promise<boolean>> = {
	TOTP: checkTotp,
	RECOVERY_CODE: checkRecoveryCode
}

/**
 * Methods the user can finish sign-in with. Empty means MFA is off. A WebAuthn key counts as a
 * second factor on its own - with one registered, a password alone no longer signs in.
 */
export const getMfaMethods = async (userId: string): Promise<MfaMethod[]> => {
	const factors = await findMfaFactors(userId)
	const hasWebAuthn = (factors?._count.webauthnCredentials ?? 0) > 0
	const hasTotp = Boolean(factors?.totpAuthenticator?.confirmedAt)

	if (!hasWebAuthn && !hasTotp) {
		return []
	}

	const methods: MfaMethod[] = []

	if (hasWebAuthn) {
		methods.push('WEBAUTHN')
	}

	if (hasTotp) {
		methods.push('TOTP')
	}

	if ((factors?._count.recoveryCodes ?? 0) > 0) {
		methods.push('RECOVERY_CODE')
	}

	return methods
}

/** The first factor gets a batch of recovery codes, so losing the key or phone isn't a lockout. */
export const issueRecoveryCodesIfMissing = async (userId: string) => {
	const existing = await listRecoveryCodes(userId)

	if (existing.length > 0) {
		return null
	}

	const codes = generateRecoveryCodes()

	await replaceRecoveryCodes(userId, codes.map(hashRecoveryCode))

	return codes
}

export const verifyMfaCode = async (userId: string, method: CodeMfaMethod, code: string) => {
	await assertAttemptsLeft(userId)

	if (!(await CHECKS[method](userId, code.trim()))) {
		await recordFailedAttempt(userId)

		throw new BadRequestError('Invalid code')
	}

	await redis.del(attemptKey(userId))
}

/** For forms with one input: the format tells an authenticator code from a recovery code. */
export const verifySecondFactor = (userId: string, code: string) =>
	verifyMfaCode(userId, isTotpCode(code.trim()) ? 'TOTP' : 'RECOVERY_CODE', code)

export const disableTotp = async (userId: string, { code }: MfaCodeInput) => {
	if (!(await findEnabledTotp(userId))) {
		throw new BadRequestError('Authenticator app is not enabled')
	}

	await verifySecondFactor(userId, code)
	await removeTotp(userId)

	extendLogContext({ event: 'totp_disabled', userId })
}

export const getRecoveryCodesStatus = async (userId: string) => {
	const codes = await listRecoveryCodes(userId)
	const generatedAt = codes[0]?.createdAt ?? null

	return {
		total: codes.length,
		remaining: codes.filter((code) => !code.usedAt).length,
		generatedAt: generatedAt?.toISOString() ?? null
	}
}

export const regenerateRecoveryCodes = async (userId: string, { code }: MfaCodeInput) => {
	if ((await getMfaMethods(userId)).length === 0) {
		throw new BadRequestError('Enable two-factor authentication first')
	}

	await verifySecondFactor(userId, code)

	const codes = generateRecoveryCodes()

	await replaceRecoveryCodes(userId, codes.map(hashRecoveryCode))

	extendLogContext({ event: 'recovery_codes_regenerated', userId })

	return { codes }
}
