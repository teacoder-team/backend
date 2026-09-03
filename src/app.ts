import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'

import { auth } from '@/modules/auth'
import { payment } from '@/modules/payment'
import { root } from '@/modules/root'
import { session } from '@/modules/session'
import { errorHandler } from '@/plugins/error-handler'
import { requestContext, requestLogger } from '@/plugins/request-context'

export const createApp = () =>
	new Elysia()
		.use(
			openapi({
				provider: 'scalar',
				path: '/docs',
				specPath: '/openapi.json',
				documentation: {
					info: {
						title: 'TeaCoder API',
						description: 'API for TeaCoder educational platform',
						version: '1.0.0',
						contact: {
							name: 'TeaCoder Support',
							email: 'support@teacoder.ru',
						},
						termsOfService:
							'https://teacoder.ru/documents/terms-of-use',
					},
					components: {
						securitySchemes: {
							bearerAuth: {
								type: 'http',
								scheme: 'bearer',
								description:
									'Enter your valid active session token to access protected resources.',
							},
						},
					},
				},
			}),
		)
		.use(errorHandler)
		.use(requestContext)
		.use(requestLogger)
		.use(root)
		.use(auth)
		.use(session)
		.use(payment)

export type App = ReturnType<typeof createApp>
