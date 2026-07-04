import { Elysia } from 'elysia'
import { AppError } from './base'
import { logger } from '@/core/logger/pino'

export const errorHandler = (app: Elysia) =>
	app
		.error({
			APP_ERROR: AppError,
		})
		.onError(({ code, error, set }) => {
			set.headers['content-type'] = 'application/json; charset=utf-8'

			if (code === 'NOT_FOUND') {
				set.status = 404
				return {
					statusCode: 404,
					message: 'Route not found',
				}
			}

			if (error instanceof AppError || code === 'APP_ERROR') {
				const err = error as AppError
				set.status = err.statusCode

				return {
					statusCode: err.statusCode,
					message: err.message,
					details: err.details ?? null,
				}
			}

			if (code === 'VALIDATION') {
				set.status = 400
				return {
					statusCode: 400,
					message: 'Validation error',
					details: error.all,
				}
			}

			logger.error({ err: error }, 'unhandled_exception')

			set.status = 500
			return {
				statusCode: 500,
				message: 'Internal server error',
			}
		})
