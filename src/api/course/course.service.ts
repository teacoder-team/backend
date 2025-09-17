import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated'
import { randomBytes } from 'crypto'
import { firstValueFrom } from 'rxjs'

import { slugify } from '@/common/utils/slugify'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

import { CreateCourseRequest } from './dto'

@Injectable()
export class CourseService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {}

	public async getAll() {
		const courses = await this.prismaService.course.findMany({
			where: {
				isPublished: true
			},
			orderBy: {
				createdAt: 'desc'
			},
			select: {
				id: true,
				title: true,
				slug: true,
				shortDescription: true,
				thumbnail: true,
				_count: {
					select: {
						lessons: {
							where: {
								isPublished: true
							}
						}
					}
				}
			}
		})

		return courses.map(({ _count, ...course }) => ({
			...course,
			lessons: _count.lessons
		}))
	}

	public async getPopular() {
		const courses = await this.prismaService.course.findMany({
			orderBy: {
				views: 'desc'
			},
			select: {
				id: true,
				title: true,
				slug: true,
				shortDescription: true,
				thumbnail: true,
				_count: {
					select: {
						lessons: {
							where: {
								isPublished: true
							}
						}
					}
				}
			},
			take: 4
		})

		return courses.map(({ _count, ...course }) => ({
			...course,
			lessons: _count.lessons
		}))
	}

	public async getBySlug(slug: string) {
		const cachedCourse = await this.redisService.get(`courses:${slug}`)

		if (cachedCourse) return JSON.parse(cachedCourse)

		const course = await this.prismaService.course.findUnique({
			where: {
				slug,
				isPublished: true
			},
			select: {
				id: true,
				title: true,
				slug: true,
				shortDescription: true,
				fullDescription: true,
				thumbnail: true,
				youtubeUrl: true,
				views: true,
				createdAt: true
			}
		})

		if (!course) throw new NotFoundException('Курс не найден')

		await this.redisService.set(
			`courses:${course.slug}`,
			JSON.stringify(course),
			'EX',
			10 * 60
		)

		return course
	}

	public async getCourseLessons(id: string) {
		const course = await this.prismaService.course.findUnique({
			where: {
				id,
				isPublished: true
			}
		})

		if (!course) throw new NotFoundException('Course not found')

		const lessons = await this.prismaService.lesson.findMany({
			where: {
				courseId: course.id,
				isPublished: true
			},
			orderBy: {
				position: 'asc'
			},
			select: {
				id: true,
				title: true,
				slug: true,
				description: true,
				position: true
			}
		})

		return lessons
	}

	public async incrementViews(id: string) {
		await this.prismaService.course.update({
			where: {
				id
			},
			data: {
				views: {
					increment: 1
				}
			}
		})

		return true
	}

	public async generateDownloadLink(id: string) {
		const course = await this.prismaService.course.findUnique({
			where: {
				id
			}
		})

		if (!course || !course.attachment)
			throw new NotFoundException('Курс не найден')

		const token = randomBytes(16).toString('hex')

		await this.redisService.set(`course:download:${token}`, id, 'EX', 100)

		return { token }
	}

	public async resolveDownloadToken(
		token: string,
		user: User,
		ip: string,
		userAgent: string
	) {
		const courseId = await this.redisService.get(`course:download:${token}`)

		if (!courseId)
			throw new NotFoundException('Ссылка недействительна или истекла')

		const course = await this.prismaService.course.findUnique({
			where: {
				id: courseId
			},
			select: {
				id: true,
				title: true,
				attachment: true
			}
		})

		if (!course) throw new NotFoundException('Курс не найден')

		await this.prismaService.downloadLog.create({
			data: {
				token,
				ip,
				userAgent,
				downloadedAt: new Date(),
				user: {
					connect: {
						id: user.id
					}
				},
				course: {
					connect: {
						id: course.id
					}
				}
			}
		})

		return course
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
				response.headers['Content-Type'] || 'application/octet-stream'
		}
	}

	public async create(dto: CreateCourseRequest) {
		const { title } = dto

		const course = await this.prismaService.course.create({
			data: {
				title,
				slug: slugify(title)
			}
		})

		return { id: course.id }
	}
}
