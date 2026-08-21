import { type CityResponse, Reader } from 'maxmind'

import { RESOURCES } from '@/config/paths'
import { lazy } from '@/shared/lazy'

const UNKNOWN = 'Unknown'

const reader = lazy(async () => {
	const database = await Bun.file(RESOURCES.geoCity).arrayBuffer()

	return new Reader<CityResponse>(Buffer.from(database))
})

/** Warmed in bootstrap so a missing database fails the start, not a request. */
export const warmGeoDatabase = reader

export interface Location {
	country: string
	city: string
}

export const lookupLocation = async (ip: string): Promise<Location> => {
	const record = (await reader()).get(ip)

	return {
		country:
			record?.country?.names.ru ?? record?.country?.names.en ?? UNKNOWN,
		city: record?.city?.names.ru ?? record?.city?.names.en ?? UNKNOWN,
	}
}
