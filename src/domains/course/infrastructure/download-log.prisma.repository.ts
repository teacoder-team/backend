import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

import type { DownloadLogRepository } from '../domain/repositories/download-log.repository.interface'

@Injectable()
export class PrismaDownloadLogRepository implements DownloadLogRepository {
	constructor(private readonly prisma: PrismaService) {}

	public async logDownload(params: {
		token: string
		ip: string
		userAgent: string
		downloadedAt: Date
		userId: string
		courseId: string
	}) {
		await this.prisma.downloadLog.create({
			data: {
				token: params.token,
				ip: params.ip,
				userAgent: params.userAgent,
				downloadedAt: params.downloadedAt,
				user: { connect: { id: params.userId } },
				course: { connect: { id: params.courseId } }
			}
		})
	}
}
