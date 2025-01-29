import { User } from '@prisma/generated'
import 'http'

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}

declare module 'http' {
	interface IncomingHttpHeaders {
		'x-session-token'?: string
	}
}
