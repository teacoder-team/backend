import { randomUUID } from 'node:crypto'

import { redis } from '~/lib/redis'

const RELEASE_SCRIPT = `
if redis.call('get', KEYS[1]) == ARGV[1] then
	return redis.call('del', KEYS[1])
end
return 0
`

export class LockTakenError extends Error {
	constructor(readonly key: string) {
		super(`Lock "${key}" is held by another operation`)
		this.name = 'LockTakenError'
	}
}

export const withLock = async <T>(key: string, ttlMs: number, task: () => Promise<T>) => {
	const token = randomUUID()
	const acquired = await redis.set(key, token, 'PX', ttlMs, 'NX')

	if (!acquired) {
		throw new LockTakenError(key)
	}

	try {
		return await task()
	} finally {
		await redis.eval(RELEASE_SCRIPT, 1, key, token)
	}
}
