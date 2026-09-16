import { RESOURCES } from '~/config/paths'
import { lazy } from '~/shared/lazy'
import { type CityResponse, Reader } from 'maxmind'

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
