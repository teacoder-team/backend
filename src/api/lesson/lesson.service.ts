import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/generated'
import { randomBytes } from 'crypto'

import { slugify } from '@/common/utils'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { KinescopeService } from '@/libs/kinescope/kinescope.service'

import { CreateLessonRequest } from './dto'

@Injectable()
export class LessonService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly kinescopeService: KinescopeService
	) {}

	public async findBySlug(slug: string) {
		const lesson = await this.prismaService.lesson.findUnique({
			where: {
				slug,
				isPublished: true
			},
			include: {
				course: true
			}
		})

		if (!lesson) throw new NotFoundException('Lesson not found')

		return lesson
	}

	public async getCompletedLessons(user: User, courseId: string) {
		const lessons = await this.prismaService.lesson.findMany({
			where: { courseId },
			select: { id: true }
		})

		const lessonIds = lessons.map(lesson => lesson.id)

		const completedLessons = await this.prismaService.userProgress.findMany(
			{
				where: {
					userId: user.id,
					lessonId: { in: lessonIds },
					isCompleted: true
				},
				select: { lessonId: true }
			}
		)

		const completedLessonIds = completedLessons.map(
			lessonProgress => lessonProgress.lessonId
		)

		return completedLessonIds
	}

	public async create(dto: CreateLessonRequest) {
		const { title, courseId } = dto

		const course = await this.prismaService.course.findUnique({
			where: {
				id: courseId
			}
		})

		if (!course) throw new NotFoundException('Course not found')

		const lastLesson = await this.prismaService.lesson.findFirst({
			where: {
				courseId: course.id
			},
			orderBy: {
				position: 'desc'
			}
		})

		const newPosition = lastLesson ? lastLesson.position + 1 : 1

		const lesson = await this.prismaService.lesson.create({
			data: {
				title,
				slug: this.slugifyWithSuffix(title),
				position: newPosition,
				course: {
					connect: {
						id: course.id
					}
				}
			}
		})

		return { id: lesson.id }
	}

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
