import { logger } from './logger'
import { redis } from './redis'

const TOMBSTONE = '__miss__'

type Entry<T> = { hit: true; value: T | null } | { hit: false }

export interface CacheOptions<T> {
	ttl: number | ((value: T) => number)
	missTtl?: number
}

const seconds = (ttl: number) => Math.max(1, Math.floor(ttl))

const read = async <T>(key: string): Promise<Entry<T>> => {
	try {
		const raw = await redis.get(key)

		if (raw === null) return { hit: false }
		if (raw === TOMBSTONE) return { hit: true, value: null }

		return { hit: true, value: JSON.parse(raw) as T }
	} catch (err) {
		logger.warn({ context: 'cache', key, err }, 'cache_read_failed')

		return { hit: false }
	}
}

const store = async (key: string, payload: string, ttl: number) => {
	try {
		await redis.set(key, payload, 'EX', seconds(ttl))
	} catch (err) {
		logger.warn({ context: 'cache', key, err }, 'cache_write_failed')
	}
}

const write = (key: string, value: unknown, ttl: number) => store(key, JSON.stringify(value), ttl)

const drop = async (...keys: string[]) => {
	if (!keys.length) return

	try {
		await redis.del(...keys)
	} catch (err) {
		logger.warn({ context: 'cache', keys, err }, 'cache_drop_failed')
	}
}

const readThrough = async <T>(
	key: string,
	{ ttl, missTtl = 0 }: CacheOptions<T>,
	load: () => Promise<T | null>
): Promise<T | null> => {
	const entry = await read<T>(key)

	if (entry.hit) return entry.value

	const value = await load()

	if (value !== null) {
		await write(key, value, typeof ttl === 'function' ? ttl(value) : ttl)
	} else if (missTtl > 0) {
		await store(key, TOMBSTONE, missTtl)
	}

	return value
}

export const cache = { readThrough, write, drop }
