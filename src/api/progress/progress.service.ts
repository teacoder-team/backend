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

		const existingProgress =
			await this.prismaService.userProgress.findUnique({
				where: {
					userId_lessonId: {
						userId: user.id,
						lessonId: lesson.id
					}
				}
			})

		let userProgress

		if (existingProgress) {
			const wasCompleted = existingProgress.isCompleted

			userProgress = await this.prismaService.userProgress.update({
				where: {
					userId_lessonId: {
						userId: user.id,
						lessonId: lesson.id
					}
				},
				data: { isCompleted }
			})

			if (!wasCompleted && isCompleted) {
				await this.prismaService.user.update({
					where: {
						id: user.id
					},
					data: {
						points: {
							increment: 5
						}
					}
				})
			} else if (wasCompleted && !isCompleted) {
				await this.prismaService.user.update({
					where: {
						id: user.id
					},
					data: {
						points: {
							decrement: 5
						}
					}
				})
			}
		} else {
			userProgress = await this.prismaService.userProgress.create({
				data: {
					userId: user.id,
					lessonId: lesson.id,
					isCompleted
				}
			})

			if (isCompleted) {
				await this.prismaService.user.update({
					where: { id: user.id },
					data: {
						points: {
							increment: 5
						}
					}
				})
			}
		}

		const nextLesson = await this.prismaService.lesson.findFirst({
			where: {
				courseId: lesson.courseId,
				position: {
					gt: lesson.position
				},
				isPublished: true
			},
			orderBy: {
				position: 'asc'
			}
		})

		return { nextLesson: nextLesson ? nextLesson.slug : null }
	}
}
