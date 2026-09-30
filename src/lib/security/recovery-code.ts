import { createHmac, randomInt } from 'node:crypto'

import { env } from '~/config/env'

import { loadKey } from './aes-gcm'

export const RECOVERY_CODE_COUNT = 10

/** No 0/o, 1/l/i - codes get read off paper and typed by hand. ~50 bits per code. */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const GROUP_LENGTH = 5

const hashKey = loadKey(env.VERIFICATION_CODE_HASH_KEY, 'VERIFICATION_CODE_HASH_KEY')

const randomGroup = () =>
	Array.from({ length: GROUP_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

/** `xxxxx-xxxxx`. */
export const generateRecoveryCodes = (count = RECOVERY_CODE_COUNT) =>
	Array.from({ length: count }, () => `${randomGroup()}-${randomGroup()}`)

/** Case, dashes and spaces don't matter - `ABCDE FGHJK` matches `abcde-fghjk`. */
export const normalizeRecoveryCode = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Prefixed so a recovery code can never collide with an email verification code hash. */
export const hashRecoveryCode = (code: string): Buffer =>
	createHmac('sha256', hashKey)
		.update(`recovery:${normalizeRecoveryCode(code)}`)
		.digest()
