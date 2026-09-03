import { HttpError, createHttpClient } from '@/infra/http/client'
import { getAccessToken, invalidateAccessToken } from './session'
import { API_URL } from './types'

const TIMEOUT = 10_000

const HEADERS = {
	'Content-Type': 'application/json',
	Accept: 'application/json, text/plain, */*',
	Referer: 'https://lknpd.nalog.ru/',
}

const readClient = createHttpClient({
	baseURL: API_URL,
	timeout: TIMEOUT,
	headers: HEADERS,
	retry: { retries: 2, minTimeout: 400, factor: 2 },
})

const writeClient = createHttpClient({
	baseURL: API_URL,
	timeout: TIMEOUT,
	headers: HEADERS,
})

export class NpdError extends Error {
	constructor(
		readonly status: number,
		message: string,
		readonly code?: string,
	) {
		super(message)
		this.name = 'NpdError'
	}
}

interface ApiErrorBody {
	code?: string
	message?: string
	exceptionType?: string
}

const toNpdError = (err: HttpError) => {
	const body = (err.body ?? {}) as ApiErrorBody

	return new NpdError(
		err.status,
		body.message ?? body.exceptionType ?? `Request failed (${err.status})`,
		body.code,
	)
}

interface RequestOptions {
	method?: 'GET' | 'POST'
	body?: unknown
	retryable?: boolean
}

export const request = async <T>(
	path: string,
	{ method = 'GET', body, retryable = method === 'GET' }: RequestOptions = {},
): Promise<T> => {
	const send = async () => {
		const client = retryable ? readClient : writeClient

		return client<T>(path, {
			method,
			headers: { Authorization: `Bearer ${await getAccessToken()}` },
			...(body === undefined ? {} : { body: JSON.stringify(body) }),
		})
	}

	try {
		return await send()
	} catch (err) {
		if (!(err instanceof HttpError)) throw err

		if (err.status === 401) {
			invalidateAccessToken()

			try {
				return await send()
			} catch (retried) {
				throw retried instanceof HttpError
					? toNpdError(retried)
					: retried
			}
		}

		throw toNpdError(err)
	}
}
