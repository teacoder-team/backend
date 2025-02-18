import { Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes } from 'crypto'

import { slugify } from '@/common/utils'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { KinescopeService } from '@/libs/kinescope/kinescope.service'

@Injectable()
export class LessonService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly kinescopeService: KinescopeService
	) {}

	public async upload(id: string, file: Express.Multer.File) {
		const lesson = await this.prismaService.lesson.findUnique({
			where: {
				id
			}
		})

		if (!lesson) throw new NotFoundException('Lesson not found')

		const video = await this.kinescopeService.uploadVideo(
			lesson.title,
			file.buffer,
			file.originalname,
			file.mimetype
		)

		const kinescopeId = video.play_link.replace('https://kinescope.io/', '')

		await this.prismaService.lesson.update({
			where: {
				id
			},
			data: {
				kinescopeId
			}
		})

		return kinescopeId
	}

	private slugifyWithSuffix(title: string) {
		const slug = slugify(title)
		const suffix = randomBytes(2).toString('hex')

		return `${slug}-${suffix}`
	}
}
