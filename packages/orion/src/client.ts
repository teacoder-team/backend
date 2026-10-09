import { createHttpClient, HttpError, type HttpLogger } from '@teacoder/http'

export type OrionTag = 'avatars' | 'courses' | 'attachments'

export class OrionError extends Error {
	constructor(
		readonly status: number,
		message: string,
		options?: ErrorOptions
	) {
		super(message, options)
		this.name = 'OrionError'
	}
}

export interface OrionClientOptions {

	baseUrl: string

	masterKey: string

	timeout?: number
	logger?: HttpLogger
}

export interface UploadedFile {
	fileId: string
	filename: string

	url: string
}

interface UploadResponse {
	message: string
	file_id: string
	filename: string
}

export const createOrionClient = ({
	baseUrl,
	masterKey,
	timeout = 15_000,
	logger
}: OrionClientOptions) => {
	const http = createHttpClient({ baseURL: baseUrl, timeout, logger })

	const fileUrl = (tag: OrionTag, fileId: string) => `${baseUrl}/${tag}/${fileId}`

	const upload = async (tag: OrionTag, file: File): Promise<UploadedFile> => {
		const form = new FormData()

		form.append('tag', tag)
		form.append('file', file, file.name)

		try {
			const response = await http<UploadResponse>('/upload', {
				method: 'POST',
				headers: { 'X-Upload-Secret': masterKey },
				body: form
			})

			return {
				fileId: response.file_id,
				filename: response.filename,
				url: fileUrl(tag, response.file_id)
			}
		} catch (err) {
			if (!(err instanceof HttpError)) {
				throw err
			}

			const body = err.body as { error?: string } | null

			throw new OrionError(err.status, body?.error ?? `Upload failed (${err.status})`, {
				cause: err
			})
		}
	}

	return { upload, fileUrl }
}

export type OrionClient = ReturnType<typeof createOrionClient>
