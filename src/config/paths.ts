import { resolve } from 'node:path'

import { env } from './env'

const resource = (...segments: string[]) =>
	resolve(env.RESOURCES_DIR, ...segments)

export const RESOURCES = {
	geoCity: resource('geo', 'city.mmdb'),
	disposableEmails: resource('email', 'disposable-domains.txt'),
} as const
