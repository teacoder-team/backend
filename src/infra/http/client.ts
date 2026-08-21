import { logger } from '@/infra/logger'
import { delay } from '@/shared/delay'

const DEFAULT_TIMEOUT = 10_000
const DEFAULT_RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504]

export interface RetryPolicy {
	retries: number
	minTimeout: number
	factor: number
	retryableStatuses?: number[]
}

export interface HttpClientOptions extends Omit<RequestInit, 'signal'> {
	baseURL?: string
	timeout?: number
	retry?: RetryPolicy
	/** Runs on every outgoing request. */
	beforeRequest?: (request: Request) => Request | Promise<Request>
}

export type HttpClient = <T>(
	path: string,
	init?: Omit<RequestInit, 'signal'>,
) => Promise<T>

export class HttpError extends Error {
	constructor(
		readonly status: number,
		readonly body: unknown,
		readonly url: string,
	) {
		super(`HTTP ${status} for ${url}`)
		this.name = 'HttpError'
	}
}

const mergeHeaders = (...sources: (HeadersInit | undefined)[]) => {
	const merged = new Headers()

	for (const source of sources) {
		new Headers(source).forEach((value, key) => merged.set(key, value))
	}

	return merged
}

const readBody = async (response: Response) => {
	if (response.status === 204) return null

	return response.json().catch(() => null)
}

export const createHttpClient = ({
	baseURL = '',
	timeout = DEFAULT_TIMEOUT,
	retry,
	beforeRequest,
	...defaults
}: HttpClientOptions): HttpClient => {
	const maxAttempts = (retry?.retries ?? 0) + 1
	const retryableStatuses =
		retry?.retryableStatuses ?? DEFAULT_RETRYABLE_STATUSES

	const backoff = (attempt: number) =>
		delay(
			(retry?.minTimeout ?? 500) * (retry?.factor ?? 2) ** (attempt - 1),
		)

	return async <T>(path: string, init: Omit<RequestInit, 'signal'> = {}) => {
		const url = `${baseURL}${path}`
		let lastError: unknown

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				let request = new Request(url, {
					...defaults,
					...init,
					headers: mergeHeaders(defaults.headers, init.headers),
					signal: AbortSignal.timeout(timeout),
				})

				if (beforeRequest) request = await beforeRequest(request)

				const response = await fetch(request)

				if (response.ok) return (await readBody(response)) as T

				if (
					attempt < maxAttempts &&
					retryableStatuses.includes(response.status)
				) {
					logger.warn(
						{
							context: 'http',
							url,
							status: response.status,
							attempt,
						},
						'http_request_retrying',
					)

					await backoff(attempt)
					continue
				}

				throw new HttpError(
					response.status,
					await readBody(response),
					url,
				)
			} catch (err) {
				// A non-retryable HTTP status is a final answer, not a glitch.
				if (err instanceof HttpError) throw err

				lastError = err

				if (attempt >= maxAttempts) break

				logger.warn(
					{ context: 'http', url, err, attempt },
					'http_request_retrying',
				)

				await backoff(attempt)
			}
		}

		throw lastError
	}
}
