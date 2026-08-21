import { Elysia } from 'elysia'

import { logger } from '@/infra/logger'
import { AppError, ErrorCode } from '@/shared/errors'

interface ErrorResponse {
	statusCode: number
	code: ErrorCode
	message: string
	details: unknown
}

const respond = (
	statusCode: number,
	code: ErrorCode,
	message: string,
	details: unknown = null,
): ErrorResponse => ({ statusCode, code, message, details })

/**
 * The single place where an error becomes an HTTP response, and the single
 * place errors are logged - services throw and stay quiet.
 */
export const errorHandler = new Elysia({ name: 'error-handler' })
	.error({ APP_ERROR: AppError })
	.onError({ as: 'global' }, ({ code, error, set, path }) => {
		set.headers['content-type'] = 'application/json; charset=utf-8'

		if (code === 'VALIDATION') {
			set.status = 422
			return respond(
				422,
				ErrorCode.VALIDATION_ERROR,
				'Request validation failed',
				error.all,
			)
		}

		if (error instanceof AppError) {
			set.status = error.statusCode

			logger.warn(
				{
					code: error.code,
					path,
					message: error.message,
				},
				'request_rejected',
			)

			return respond(
				error.statusCode,
				error.code,
				error.message,
				error.details,
			)
		}

		if (code === 'NOT_FOUND') {
			set.status = 404
			return respond(404, ErrorCode.NOT_FOUND, 'Route not found')
		}

		logger.error({ err: error, path }, 'unhandled_exception')

		set.status = 500
		return respond(
			500,
			ErrorCode.INTERNAL_SERVER_ERROR,
			'Internal server error',
		)
	})
