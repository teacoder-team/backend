import { Elysia } from 'elysia'

import { AppError } from '~/lib/errors'
import { extendLogContext, logContext } from '~/lib/logger'
import { enqueuePaymentErrorNotification } from '~/modules/admin-bot/service'

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

const messageFor = (issue: ValidationIssue) => {
	const declared = issue.schema?.error

	if (typeof declared === 'string') {
		return declared
	}

	return issue.summary ?? issue.message ?? 'Invalid value'
}

const describe = (issue: ValidationIssue) => {
	const field = issue.path?.replace(/^\//, '').replace(/\//g, '.')
	const message = messageFor(issue)

	return field ? `${field}: ${message}` : message
}

export const errorHandler = new Elysia({ name: 'error-handler' })
	.error({ APP_ERROR: AppError })
	.onError({ as: 'global' }, async ({ code, error, set, path }) => {
		set.headers['content-type'] = 'application/json; charset=utf-8'

		if (path === '/billing/create' || /^\/webhook\/(yookassa|heleket|prodamus|resend)$/.test(path)) {
			const context = logContext.getStore()
			const field = (name: string) =>
				typeof context?.[name] === 'string' ? context[name] as string : undefined
			const status = code === 'VALIDATION'
				? 422
				: error instanceof AppError ? error.statusCode : code === 'NOT_FOUND' ? 404 : 500

			await enqueuePaymentErrorNotification({
				source: path === '/billing/create' ? 'CREATE_PAYMENT' : 'WEBHOOK',
				error,
				status,
				path,
				provider: field('provider') ?? (path.startsWith('/webhook/') ? path.split('/').pop() : undefined),
				paymentId: field('paymentId'),
				webhookId: field('webhookId'),
				pspIntentId: field('pspIntentId'),
				userId: field('userId'),
				requestId: field('requestId')
			})
		}

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
			errorStack: error instanceof Error ? error.stack : undefined
		})

		set.status = 500

		return respond(500, ['Internal server error'])
	})
