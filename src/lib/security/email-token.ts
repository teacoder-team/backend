import { createHash, randomBytes } from 'node:crypto'

import { redis } from '~/lib/redis'

type EmailTokenPurpose = 'email-verification' | 'password-reset'

interface EmailTokenIdentity {
	userId: string
	email?: string
}

export const EMAIL_TOKEN_TTL = 30 * 60

const SAVE_TOKEN = `
local previous = redis.call('GET', KEYS[1])
if previous then
    redis.call('DEL', ARGV[1] .. previous)
end
redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[4])
redis.call('SET', KEYS[1], ARGV[3], 'EX', ARGV[4])
return 1
`

const TAKE_TOKEN = `
local payload = redis.call('GET', KEYS[1])
if not payload then
    return nil
end
local userId = payload
if string.sub(payload, 1, 1) == '{' then
    userId = cjson.decode(payload).userId
end
local userKey = ARGV[1] .. userId
local current = redis.call('GET', userKey)
redis.call('DEL', KEYS[1])
if current and current ~= ARGV[2] then
    return nil
end
if current == ARGV[2] then
    redis.call('DEL', userKey)
end
return payload
`

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export const issueEmailToken = async (purpose: EmailTokenPurpose, identity: EmailTokenIdentity) => {
	const token = randomBytes(32).toString('base64url')
	const hash = hashToken(token)
	const prefix = `${purpose}:token:`

	await redis.eval(
		SAVE_TOKEN,
		2,
		`${purpose}:user:${identity.userId}`,
		`${prefix}${hash}`,
		prefix,
		JSON.stringify(identity),
		hash,
		EMAIL_TOKEN_TTL
	)

	return token
}

export const consumeEmailToken = async (
	purpose: EmailTokenPurpose,
	token: string
): Promise<EmailTokenIdentity | null> => {
	const hash = hashToken(token)
	const payload = await redis.eval(
		TAKE_TOKEN,
		1,
		`${purpose}:token:${hash}`,
		`${purpose}:user:`,
		hash
	)

	if (typeof payload !== 'string') {
		return null
	}

	return payload.startsWith('{')
		? (JSON.parse(payload) as EmailTokenIdentity)
		: { userId: payload }
}
