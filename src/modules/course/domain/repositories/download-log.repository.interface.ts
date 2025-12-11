export interface DownloadLogRepository {
	logDownload(params: {
		token: string
		ip: string
		userAgent: string
		downloadedAt: Date
		userId: string
		courseId: string
	}): Promise<void>
}
