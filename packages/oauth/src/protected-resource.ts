import * as client from 'openid-client'

export const fetchJson = async <T>(
	config: client.Configuration,
	accessToken: string,
	url: string,
	headers?: HeadersInit
): Promise<T> => {
	const response = await client.fetchProtectedResource(
		config,
		accessToken,
		new URL(url),
		'GET',
		undefined,
		headers ? new Headers(headers) : undefined
	)

	if (!response.ok) throw new Error(`${url} responded with ${response.status}`)

	return (await response.json()) as T
}
