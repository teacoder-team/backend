import { Elysia } from 'elysia'

import { extendLogContext } from '@/infra/logger'
import { type ApiIssue, fail } from '@/shared/api'
import { AppError, ErrorCode } from '@/shared/errors'

const issue = (code: ErrorCode, message: string, field?: string): ApiIssue =>
	field ? { code, message, field } : { code, message }

interface ValidationIssue {
	path?: string
	message?: string
	summary?: string | null
	schema?: { error?: unknown }
}

const messageFor = (issue: ValidationIssue) => {
	const declared = issue.schema?.error

	if (typeof declared === 'string') return declared

	return issue.summary ?? issue.message ?? 'Invalid value'
}

const validationIssues = (issues: readonly ValidationIssue[]) =>
	issues.map((each) =>
		issue(
			ErrorCode.VALIDATION_ERROR,
			messageFor(each),
			each.path?.replace(/^\//, '').replace(/\//g, '.') || undefined,
		),
	)

export const errorHandler = new Elysia({ name: 'error-handler' })
	.error({ APP_ERROR: AppError })
	.onError({ as: 'global' }, ({ code, error, set }) => {
		set.headers['content-type'] = 'application/json; charset=utf-8'

		if (code === 'VALIDATION') {
			set.status = 422

			extendLogContext({ errorCode: ErrorCode.VALIDATION_ERROR })

			return fail(validationIssues(error.all))
		}

		if (error instanceof AppError) {
			set.status = error.statusCode

			extendLogContext({
				errorCode: error.code,
				errorMessage: error.message,
			})

			return fail([issue(error.code, error.message)])
		}

		if (code === 'NOT_FOUND') {
			set.status = 404

			return fail([issue(ErrorCode.NOT_FOUND, 'Route not found')])
		}

		extendLogContext({
			errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined,
		})

		set.status = 500

		return fail([
			issue(ErrorCode.INTERNAL_SERVER_ERROR, 'Internal server error'),
		])
	})
