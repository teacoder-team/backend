import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'

import { documentation } from '~/config/openapi'
import { auth } from '~/modules/auth'
import { billing } from '~/modules/billing'
import { course } from '~/modules/course'
import { lesson } from '~/modules/lesson'
import { oauth } from '~/modules/oauth'
import { progress } from '~/modules/progress'
import { root } from '~/modules/root'
import { session } from '~/modules/session'
import { mfa } from '~/modules/mfa'
import { users } from '~/modules/users'
import { webauthn } from '~/modules/webauthn'
import { errorHandler } from '~/plugins/error-handler'
import { requestContext, requestLogger } from '~/plugins/request-context'

import { webhook } from './modules/webhook'

export const createApp = () =>
	new Elysia()
		.use(
			openapi({
				provider: 'scalar',
				path: '/docs',
				specPath: '/spec.json',
				documentation
			})
		)
		.use(errorHandler)
		.use(requestContext)
		.use(requestLogger)
		.use(root)
		.use(auth)
		.use(oauth)
		.use(session)
		.use(users)
		.use(mfa)
		.use(webauthn)
		.use(billing)
		.use(webhook)
		.use(course)
		.use(lesson)
		.use(progress)

export type App = ReturnType<typeof createApp>
