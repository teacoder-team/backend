import { createHmac, randomInt } from 'node:crypto'

import { env } from '~/config/env'

import { loadKey } from './aes-gcm'

export const RECOVERY_CODE_COUNT = 10

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const GROUP_LENGTH = 5

const hashKey = loadKey(env.VERIFICATION_CODE_HASH_KEY, 'VERIFICATION_CODE_HASH_KEY')

const randomGroup = () =>
	Array.from({ length: GROUP_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

export const generateRecoveryCodes = (count = RECOVERY_CODE_COUNT) =>
	Array.from({ length: count }, () => `${randomGroup()}-${randomGroup()}`)

export const normalizeRecoveryCode = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, '')

export const hashRecoveryCode = (code: string): Buffer =>
	createHmac('sha256', hashKey)
		.update(`recovery:${normalizeRecoveryCode(code)}`)
		.digest()
