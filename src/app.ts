import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'

import { API_VERSION } from '~/config/version'
import { auth } from '~/modules/auth'
import { billing } from '~/modules/billing'
import { course } from '~/modules/course'
import { lesson } from '~/modules/lesson'
import { oauth } from '~/modules/oauth'
import { progress } from '~/modules/progress'
import { root } from '~/modules/root'
import { session } from '~/modules/session'
import { users } from '~/modules/users'
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
				documentation: {
					info: {
						title: 'TeaCoder API',
						description: 'API for TeaCoder educational platform',
						version: API_VERSION,
						contact: {
							name: 'TeaCoder Support',
							email: 'support@teacoder.ru'
						},
						termsOfService: 'https://teacoder.ru/documents/terms-of-use'
					},
					components: {
						securitySchemes: {
							bearerAuth: {
								type: 'http',
								scheme: 'bearer',
								description:
									'Enter your valid active session token to access protected resources.'
							}
						}
					}
				}
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
		.use(billing)
		.use(webhook)
		.use(course)
		.use(lesson)
		.use(progress)

export type App = ReturnType<typeof createApp>
