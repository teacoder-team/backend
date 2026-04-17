import { Injectable } from '@nestjs/common'
import { type Course, DownloadLog, Lesson, Prisma } from '@prisma/generated'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class CourseRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findAll(params: {
		skip?: number
		take?: number
		cursor?: Prisma.CourseWhereUniqueInput
		where?: Prisma.CourseWhereInput
		orderBy?: Prisma.CourseOrderByWithRelationInput
	}): Promise<Course[]> {
		return this.prismaService.course.findMany(params)
	}

	public async findPopular(limit?: number): Promise<Course[]> {
		return this.prismaService.course.findMany({
			take: limit,
			orderBy: {
				views: 'desc'
			}
		})
	}

	public async findBySlug(slug: string): Promise<Course | null> {
		return this.prismaService.course.findUnique({
			where: { slug }
		})
	}

	public async findById(id: string): Promise<Course | null> {
		return this.prismaService.course.findUnique({
			where: { id }
		})
	}

	public async findLessons(courseId: string): Promise<Lesson[]> {
		return this.prismaService.lesson.findMany({
			where: { courseId },
			orderBy: { position: 'asc' }
		})
	}

	public async incrementViews(id: string): Promise<void> {
		await this.prismaService.course.update({
			where: { id },
			data: {
				views: { increment: 1 }
			}
		})
	}

	public async create(data: Prisma.CourseCreateInput): Promise<Course> {
		return this.prismaService.course.create({
			data
		})
	}

	public async logDownload(
		data: Prisma.DownloadLogUncheckedCreateInput
	): Promise<DownloadLog> {
		return this.prismaService.downloadLog.create({
			data
		})
	}
}
