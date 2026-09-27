import { env } from '~/config/env'
import { createHttpClient, HttpError } from '~/infra/http/client'
import { logger } from '~/infra/logger'

/** Matches the folders Orion's /upload handler recognizes - anything else lands in "misc". */
export type OrionTag = 'avatars' | 'courses' | 'attachments'

export class OrionError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message)
		this.name = 'OrionError'
	}
}

interface UploadResponse {
	message: string
	file_id: string
	filename: string
}

export interface UploadedFile {
	fileId: string
	filename: string
}

const client = createHttpClient({
	baseURL: env.ORION_API_URL,
	timeout: 15_000
})

export const uploadFile = async (tag: OrionTag, file: File): Promise<UploadedFile> => {
	const form = new FormData()

	form.append('tag', tag)
	form.append('file', file, file.name)

	try {
		const response = await client<UploadResponse>('/upload', {
			method: 'POST',
			headers: { 'X-Upload-Secret': env.ORION_MASTER_KEY },
			body: form
		})

		return { fileId: response.file_id, filename: response.filename }
	} catch (err) {
		if (!(err instanceof HttpError)) throw err

		const body = err.body as { error?: string } | null

		logger.error({ context: 'orion', status: err.status, err: body }, 'orion_upload_failed')

		throw new OrionError(err.status, body?.error ?? `Upload failed (${err.status})`)
	}
}

/** Orion serves files directly at GET /:tag/:id - no separate URL-resolution call needed. */
export const getFileUrl = (tag: OrionTag, fileId: string) => `${env.ORION_API_URL}/${tag}/${fileId}`
