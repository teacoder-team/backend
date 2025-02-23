import { Injectable, NotFoundException } from '@nestjs/common'

import { slugify } from '@/common/utils/slugify'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'
import { StorageService } from '@/libs/storage/storage.service'

import { CreateCourseRequest } from './dto'

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
			include: {
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

	public async findBySlug(slug: string) {
		const cachedCourse = await this.redisService.get(`courses:${slug}`)

		if (cachedCourse) return JSON.parse(cachedCourse)

		const course = await this.prismaService.course.findUnique({
			where: {
				slug,
				isPublished: true
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
				slug: true
			}
		})

		return lessons
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
