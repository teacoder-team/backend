import { type CityResponse, Reader } from 'maxmind'
import { env } from '@/core/config/env'
import { logger } from '@/core/logger/pino'

const globalForGeo = globalThis as unknown as {
	geoReader: Reader<CityResponse> | undefined
}

const DB_PATH = `${import.meta.dir}/../../../resources/geo-city.mmdb`

export const initGeoProvider = async () => {
	if (globalForGeo.geoReader) return globalForGeo.geoReader

	try {
		const file = Bun.file(DB_PATH)

		if (!(await file.exists())) {
			throw new Error(`Geo database not found at ${DB_PATH}`)
		}

		const arrayBuffer = await file.arrayBuffer()
		const reader = new Reader<CityResponse>(Buffer.from(arrayBuffer))

		if (env.NODE_ENV !== 'production') {
			globalForGeo.geoReader = reader
		}

		logger.info(
			{ context: 'geo_provider' },
			'geo_database_initialized_via_bun',
		)
		return reader
	} catch (err) {
		logger.error({ err, context: 'geo_provider' }, 'geo_init_failed')
		return null
	}
}

export const getLocation = (ip: string) => {
	const reader = globalForGeo.geoReader

	return reader?.get(ip) ?? null
}
