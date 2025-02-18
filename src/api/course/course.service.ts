import { Injectable, NotFoundException } from '@nestjs/common'

import { slugify } from '@/common/utils/slugify'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'
import { StorageService } from '@/libs/storage/storage.service'

import { CreateCourseDto } from './dto'

@Injectable()
export class CourseService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly storageService: StorageService
	) {}

	public async findAll() {
		const courses = await this.prismaService.course.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			select: {
				id: true,
				title: true,
				slug: true,
				description: true,
				thumbnail: true
			}
		})

		return courses
	}

	public async findBySlug(slug: string) {
		const cachedCourse = await this.redisService.get(`courses:${slug}`)

		if (cachedCourse) return JSON.parse(cachedCourse)

		const course = await this.prismaService.course.findUnique({
			where: {
				slug
			}
		})

		if (!course) throw new NotFoundException('Course not found')

		await this.redisService.set(
			`courses:${course.slug}`,
			JSON.stringify(course),
			'EX',
			10 * 60
		)

		return course
	}

	public async create(dto: CreateCourseDto) {
		const { title } = dto

		await this.prismaService.course.create({
			data: {
				title,
				slug: slugify(title)
			}
		})

		return true
	}
}
