import { Injectable, NotFoundException } from '@nestjs/common'
import type { User } from '@prisma/generated'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { CreateProgressRequest } from './dto/create-progress.dto'

@Injectable()
export class ProgressService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async getProgress(user: User, courseId: string) {
		const lessons = await this.prismaService.lesson.findMany({
			where: {
				courseId,
				isPublished: true
			},
			select: {
				id: true
			}
		})

		const lessonIds = lessons.map(lesson => lesson.id)

		const validCompletedLessons =
			await this.prismaService.userProgress.count({
				where: {
					isCompleted: true,
					userId: user.id,
					lessonId: {
						in: lessonIds
					}
				}
			})

		const progressPercentage =
			(validCompletedLessons / lessonIds.length) * 100

		return Math.round(progressPercentage)
	}

	public async create(user: User, dto: CreateProgressRequest) {
		const { isCompleted, lessonId } = dto

		const lesson = await this.prismaService.lesson.findUnique({
			where: {
				id: lessonId
			},
			include: {
				course: true
			}
		})

		if (!lesson) throw new NotFoundException('Lesson not found')

		await this.prismaService.userProgress.upsert({
			where: {
				userId_lessonId: {
					userId: user.id,
					lessonId: lesson.id
				}
			},
			update: {
				isCompleted
			},
			create: {
				isCompleted,
				user: {
					connect: {
						id: user.id
					}
				},
				lesson: {
					connect: {
						id: lesson.id
					}
				}
			}
		})

		if (isCompleted) {
			const nextLesson = await this.prismaService.lesson.findFirst({
				where: {
					courseId: lesson.courseId,
					position: lesson.position + 1
				}
			})

			return { nextLesson: nextLesson.slug }
		}

		return { nextLesson: null }
	}
}
