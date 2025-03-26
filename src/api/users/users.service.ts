import { Injectable } from '@nestjs/common'
import { RestrictionStatus, User } from '@prisma/generated'
import sharp from 'sharp'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { StorageService } from '@/libs/storage/storage.service'

import { LastLessonResponse, PatchUserRequest } from './dto'

@Injectable()
export class UsersService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService
	) {}

	public async getAll() {
		const users = await this.prismaService.user.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			select: {
				id: true,
				createdAt: true,
				displayName: true,
				email: true,
				role: true
			}
		})

		return users
	}

	public async getMeStatistics(user: User) {
		const userProgress = await this.prismaService.userProgress.findMany({
			where: {
				userId: user.id,
				isCompleted: true
			},
			include: {
				lesson: {
					include: {
						course: true
					}
				}
			}
		})

		const coursesMap = new Map<
			string,
			{ completedLessons: number; totalLessons: number }
		>()

		for (const progress of userProgress) {
			const lesson = progress.lesson
			const courseId = lesson.course.id

			const totalLessons = await this.prismaService.lesson.count({
				where: { courseId: courseId, isPublished: true }
			})

			const courseData = coursesMap.get(courseId) || {
				completedLessons: 0,
				totalLessons: totalLessons
			}

			coursesMap.set(courseId, {
				completedLessons: courseData.completedLessons + 1,
				totalLessons: courseData.totalLessons
			})
		}

		const completedCourses = Array.from(coursesMap.values()).filter(
			course => course.completedLessons === course.totalLessons
		).length
		const coursesInProgress = Array.from(coursesMap.values()).filter(
			course => course.completedLessons < course.totalLessons
		).length

		const totalLessons = await this.prismaService.lesson.count({
			where: {
				isPublished: true
			}
		})

		const completedLessons = userProgress.length
		const progressPercentage = (completedLessons / totalLessons) * 100

		const rank = await this.prismaService.user.count({
			where: {
				points: {
					gte: user.points
				}
			}
		})

		return {
			totalPoints: user.points,
			ranking: rank,
			lessonsCompleted: `${completedLessons}/${totalLessons}`,
			learningProgressPercentage: Math.round(progressPercentage),
			completedCourses,
			coursesInProgress
		}
	}

	public async getMeProgress(user: User) {
		const courses = await this.prismaService.course.findMany({
			where: {
				lessons: {
					some: {
						isPublished: true
					}
				}
			},
			include: {
				lessons: {
					where: {
						isPublished: true
					},
					select: {
						id: true,
						title: true,
						position: true,
						courseId: true
					}
				}
			}
		})

		const userProgress = await this.prismaService.userProgress.findMany({
			where: {
				userId: user.id
			},
			select: {
				lessonId: true,
				createdAt: true,
				isCompleted: true,
				lesson: {
					select: {
						courseId: true,
						slug: true,
						position: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		const lastAccessMap = new Map<string, Date>()
		const lastLessonMap = new Map<string, LastLessonResponse>()

		for (const record of userProgress) {
			const courseId = record.lesson.courseId

			lastAccessMap.set(courseId, record.createdAt)

			if (!lastLessonMap.has(courseId) || !record.isCompleted) {
				lastLessonMap.set(courseId, {
					id: record.lessonId,
					slug: record.lesson.slug,
					position: record.lesson.position
				})
			}
		}

		const result = courses
			.map(course => {
				const totalLessons = course.lessons.length
				const completedLessons = course.lessons.filter(lesson =>
					userProgress.some(
						progress =>
							progress.lessonId === lesson.id &&
							progress.isCompleted
					)
				).length

				const progress =
					totalLessons > 0
						? Math.round((completedLessons / totalLessons) * 100)
						: 0

				const allLessonsCompleted = completedLessons === totalLessons

				return {
					id: course.id,
					title: course.title,
					totalLessons,
					completedLessons,
					progress,
					lastAccessed: lastAccessMap.get(course.id)
						? lastAccessMap.get(course.id).toISOString()
						: null,
					lastLesson: allLessonsCompleted
						? null
						: lastLessonMap.get(course.id) || null
				}
			})
			.filter(course => course.completedLessons > 0)

		return result.sort((a, b) => {
			if (a.lastAccessed && b.lastAccessed) {
				return (
					new Date(b.lastAccessed).getTime() -
					new Date(a.lastAccessed).getTime()
				)
			}
			return 0
		})
	}

	public async getLeaders() {
		const users = await this.prismaService.user.findMany({
			where: {
				restrictions: {
					none: {
						status: RestrictionStatus.ACTIVE
					}
				}
			},
			orderBy: {
				points: 'desc'
			},
			select: {
				id: true,
				displayName: true,
				avatar: true,
				points: true
			},
			take: 15
		})

		return users
	}

	public async patchUser(user: User, dto: PatchUserRequest) {
		const { displayName } = dto

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				displayName
			},
			select: {
				id: true,
				displayName: true,
				email: true,
				avatar: true
			}
		})

		return true
	}

	public async changeAvatar(user: User, file: Express.Multer.File) {
		if (user.avatar && !user.avatar.startsWith('https://')) {
			await this.storageService.deleteFile('users', user.avatar)
		}

		let processedBuffer: Buffer

		if (
			(file.originalname && file.originalname.endsWith('.gif')) ||
			(file.filename && file.filename.endsWith('.gif'))
		) {
			processedBuffer = await sharp(file.buffer, { animated: true })
				.resize(512, 512)
				.webp()
				.toBuffer()
		} else {
			processedBuffer = await sharp(file.buffer)
				.resize(512, 512)
				.webp()
				.toBuffer()
		}

		const uploadedFile = await this.storageService.uploadFile(
			file,
			processedBuffer,
			'users'
		)

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				avatar: uploadedFile.file_id
			}
		})

		return uploadedFile
	}
}
