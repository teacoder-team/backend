import 'express-session'

import type { SessionMetadata } from './session-metadata.types'

declare module 'express-session' {
	interface SessionData {
		passport?: {
			user: string
		}
		createdAt?: Date | string
		metadata: SessionMetadata
	}
}
