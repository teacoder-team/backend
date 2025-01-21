import type { Lookup } from 'geoip-country'
import type { ResultClient, ResultDevice, ResultOs } from 'node-device-detector'

export interface Session {
	id: string
	token: string
	userId: string
}

export interface UserSession {
	id: string
	createdAt: Date | string
	ip: string
	geo: Lookup
	os: ResultOs
	client: ResultClient
	device: ResultDevice
	sessionId: string
}
