import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated'
import { randomBytes } from 'crypto'
import { firstValueFrom } from 'rxjs'

import { RedisService } from '@/infra/redis/redis.service'
import { slugify } from '@/shared/utils'

import { CourseRepository } from './course.repository'

@Injectable()
export class CourseService {
	public constructor(
		private readonly courseRepository: CourseRepository,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {}

	public async getAll() {
		return this.courseRepository.findAll({
			where: {
				isPublished: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	}

	public async getPopular() {
		return this.courseRepository.findPopular(4)
	}

	public async getBySlug(slug: string) {
		const cached = await this.redisService.get(`courses:${slug}`)

		if (cached) return JSON.parse(cached)

		const course = await this.courseRepository.findBySlug(slug)

		if (!course || !course.isPublished)
			throw new NotFoundException('Course not found')

		const dto = {
			id: course.id,
			title: course.title,
			slug: course.slug,
			shortDescription: course.shortDescription,
			fullDescription: course.fullDescription,
			thumbnail: course.thumbnail,
			youtubeUrl: course.youtubeUrl,
			views: course.views,
			createdAt: course.createdAt
		}

		await this.redisService.set(
			`courses:${course.slug}`,
			JSON.stringify(dto),
			'EX',
			10 * 60
		)

		return dto
	}

	public async getCourseLessons(id: string) {
		const course = await this.courseRepository.findById(id)

		if (!course || !course.isPublished)
			throw new NotFoundException('Course not found')

		return this.courseRepository.findLessons(course.id)
	}

	public async incrementViews(id: string) {
		await this.courseRepository.incrementViews(id)

		return true
	}

	public async generateDownloadLink(id: string, user: User) {
		const course = await this.courseRepository.findById(id)

		if (!course || !course.attachment)
			throw new NotFoundException('Course not found')

		const token = randomBytes(16).toString('hex')

		await this.redisService.set(
			`course:download:${token}`,
			JSON.stringify({ courseId: course.id, userId: user.id }),
			'EX',
			60 * 5
		)

		return {
			url: `${this.configService.get('hosts.rest', { infer: true })}/courses/download/${token}`
		}
	}

	public async resolveDownloadToken(
		token: string,
		ip: string,
		userAgent: string
	) {
		const data = await this.redisService.get(`course:download:${token}`)

		if (!data) throw new NotFoundException('Link is invalid or expired')

		const { courseId, userId } = JSON.parse(data)

		const course = await this.courseRepository.findById(courseId)

		if (!course) throw new NotFoundException('Course not found')

		await this.courseRepository.logDownload({
			token,
			ip,
			userAgent,
			downloadedAt: new Date(),
			userId,
			courseId: course.id
		})

		return {
			id: course.id,
			title: course.title,
			attachment: course.attachment
		}
	}

	public async fetchAttachmentStream(attachment: string) {
		const fileUrl = `${process.env.STORAGE_URL}/attachments/${attachment}`

		const response = await firstValueFrom(
			this.httpService.get(fileUrl, {
				responseType: 'stream'
			})
		)

		return {
			stream: response.data,
			contentType:
				response.headers['content-type'] || 'application/octet-stream'
		}
	}

	public async create(request: { title: string }) {
		const slug = slugify(request.title)

		const created = await this.courseRepository.create({
			title: request.title,
			slug
		})

		return { id: created.id }
	}
}
