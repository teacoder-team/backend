import { type CityResponse, Reader } from 'maxmind'

import { RESOURCES } from '~/config/paths'
import { lazy } from '~/lib/utils/lazy'

const reader = lazy(async () => {
	const database = await Bun.file(RESOURCES.geoCity).arrayBuffer()

	return new Reader<CityResponse>(Buffer.from(database))
})

export const warmGeoDatabase = reader

export interface Location {
	country: string | null
	city: string | null
}

export const lookupLocation = async (ip: string): Promise<Location> => {
	const record = (await reader()).get(ip)

	return {
		country: record?.country?.names.ru ?? record?.country?.names.en ?? null,
		city: record?.city?.names.ru ?? record?.city?.names.en ?? null
	}
}

/** ISO 3166-1 alpha-2, e.g. `RU`. Null for an address the database does not know. */
export const lookupCountryCode = async (ip: string) =>
	(await reader()).get(ip)?.country?.iso_code ?? null
