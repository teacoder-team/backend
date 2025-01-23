import 'http'

import type { Account } from '@/api/auth/account/entities'

declare global {
	namespace Express {
		interface Request {
			user?: Account
		}
	}
}

declare module 'http' {
	interface IncomingHttpHeaders {
		'x-session-token'?: string
	}
}
