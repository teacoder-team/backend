import { Elysia } from 'elysia'

import { extendLogContext } from '~/infra/logger'
import { AppError } from '~/shared/errors'

interface ErrorBody {
	status: number
	messages: string[]
}

const respond = (status: number, messages: string[]): ErrorBody => ({ status, messages })

interface ValidationIssue {
	path?: string
	message?: string
	summary?: string | null
	schema?: { error?: unknown }
}

/** A schema-declared `error` string wins — it was written for the caller. */
const messageFor = (issue: ValidationIssue) => {
	const declared = issue.schema?.error

	if (typeof declared === 'string') return declared

	return issue.summary ?? issue.message ?? 'Invalid value'
}

/** "email: Invalid email format" — keeps which field failed as plain text, no separate property. */
const describe = (issue: ValidationIssue) => {
	const field = issue.path?.replace(/^\//, '').replace(/\//g, '.')
	const message = messageFor(issue)

	return field ? `${field}: ${message}` : message
}

/**
 * The single place where an error becomes an HTTP response, and the single
 * place errors are logged — services throw and stay quiet.
 */
export const errorHandler = new Elysia({ name: 'error-handler' })
	.error({ APP_ERROR: AppError })
	.onError({ as: 'global' }, ({ code, error, set, path }) => {
		set.headers['content-type'] = 'application/json; charset=utf-8'

		if (code === 'VALIDATION') {
			set.status = 422

			extendLogContext({ errorMessage: 'validation failed' })

			return respond(422, error.all.map(describe))
		}

		if (error instanceof AppError) {
			set.status = error.statusCode

			extendLogContext({ errorMessage: error.message })

			return respond(error.statusCode, [error.message])
		}

		if (code === 'NOT_FOUND') {
			set.status = 404

			return respond(404, ['Route not found'])
		}

		extendLogContext({
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined,
		})

		set.status = 500

		return respond(500, ['Internal server error'])
	})
