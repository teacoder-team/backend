import { resolve } from 'node:path'

import { env } from './env'

/**
 * Every path into `resources/` is resolved from RESOURCES_DIR at runtime.
 * Nothing may resolve paths relative to its own module location: bundling
 * collapses src/ into dist/main.js and any `../..` walk breaks silently.
 */
const resource = (...segments: string[]) =>
	resolve(env.RESOURCES_DIR, ...segments)

export const RESOURCES = {
	geoCity: resource('geo', 'city.mmdb'),
	disposableEmails: resource('email', 'disposable-domains.txt'),
} as const
