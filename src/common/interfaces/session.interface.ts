import type { Lookup } from 'geoip-country'
import type { IBrowser, ICPU, IDevice, IEngine, IOS } from 'ua-parser-js'

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
	ua: string
	browser: IBrowser
	cpu: ICPU
	device: IDevice
	engine: IEngine
	os: IOS
	sessionId: string
}
