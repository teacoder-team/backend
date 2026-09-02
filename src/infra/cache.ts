import { logger } from './logger'
import { redis } from './redis'

/**
 * Marks "the source of truth has no such value". Cached values are always
 * JSON, so a bare sentinel can never collide with one. Without a tombstone,
 * every lookup for an id that does not exist would reach PostgreSQL — which
 * is exactly what someone guessing session ids would do.
 */
const TOMBSTONE = '__miss__'

type Entry<T> = { hit: true; value: T | null } | { hit: false }

export interface CacheOptions<T> {
	/** Seconds to keep a value. A function receives the loaded value. */
	ttl: number | ((value: T) => number)
	/** Seconds to remember that the source had nothing. `0` disables it. */
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
		// Redis is a cache, never the source of truth: a failure here degrades
		// the request to a slower one, never to a wrong answer.
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

const write = (key: string, value: unknown, ttl: number) =>
	store(key, JSON.stringify(value), ttl)

const drop = async (...keys: string[]) => {
	if (!keys.length) return

	try {
		await redis.del(...keys)
	} catch (err) {
		logger.warn({ context: 'cache', keys, err }, 'cache_drop_failed')
	}
}

/**
 * Returns the cached value, or loads it from the source of truth and caches
 * the result. A cached `null` means the source was already asked and had
 * nothing — that is not the same as a miss.
 */
const readThrough = async <T>(
	key: string,
	{ ttl, missTtl = 0 }: CacheOptions<T>,
	load: () => Promise<T | null>,
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
