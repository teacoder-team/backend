import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { Course } from '../domain/entities/course.entity'
import type { CourseRepository } from '../domain/repositories/course.repository.interface'

@Injectable()
export class PrismaCourseRepository implements CourseRepository {
	public constructor(private readonly prisma: PrismaService) {}

	private mapPrismaToEntity(raw: any): Course {
		return new Course(
			raw.id,
			raw.title,
			raw.slug,
			raw.shortDescription,
			raw.fullDescription,
			raw.thumbnail,
			raw.youtubeUrl,
			raw.views ?? 0,
			raw.attachment,
			raw.isPublished,
			raw.createdAt
		)
	}

	public async findAll(filters?: any) {
		const rows = await this.prisma.course.findMany({
			where: {
				isPublished: filters?.isPublished ?? undefined
			},
			orderBy: filters?.orderBy
				? { [filters.orderBy.field]: filters.orderBy.direction }
				: { createdAt: 'desc' },
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

		return rows.map(r => ({
			id: r.id,
			title: r.title,
			slug: r.slug,
			shortDescription: r.shortDescription,
			thumbnail: r.thumbnail,
			lessons: r._count.lessons
		}))
	}

	public async findPopular(limit = 4) {
		const rows = await this.prisma.course.findMany({
			orderBy: {
				views: 'desc'
			},
			take: limit,
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

		return rows.map(r => ({
			id: r.id,
			title: r.title,
			slug: r.slug,
			shortDescription: r.shortDescription,
			thumbnail: r.thumbnail,
			lessons: r._count.lessons
		}))
	}

	public async findBySlug(slug: string) {
		const raw = await this.prisma.course.findUnique({
			where: {
				slug
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
				attachment: true,
				isPublished: true,
				createdAt: true
			}
		})

		if (!raw) return null

		return this.mapPrismaToEntity(raw)
	}

	public async findById(id: string) {
		const raw = await this.prisma.course.findUnique({
			where: {
				id
			}
		})

		if (!raw) return null

		return this.mapPrismaToEntity(raw)
	}

	public async findLessons(courseId: string) {
		const lessons = await this.prisma.lesson.findMany({
			where: {
				courseId,
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
		await this.prisma.course.update({
			where: {
				id
			},
			data: {
				views: {
					increment: 1
				}
			}
		})
	}

	public async create(data: { title: string; slug: string }) {
		const created = await this.prisma.course.create({
			data: {
				title: data.title,
				slug: data.slug
			}
		})

		return { id: created.id }
	}
}
