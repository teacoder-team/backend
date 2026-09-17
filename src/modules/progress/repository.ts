import { db } from '~/infra/db'

const POINTS_PER_LESSON = 5

export const findPublishedLessonIds = (courseId: string) =>
	db.lesson
		.findMany({ where: { courseId, isPublished: true }, select: { id: true } })
		.then((rows) => rows.map((row) => row.id))

export const findCompletedLessonIds = (userId: string, lessonIds: string[]) =>
	db.userProgress
		.findMany({
			where: { userId, lessonId: { in: lessonIds }, isCompleted: true },
			select: { lessonId: true }
		})
		.then((rows) => rows.map((row) => row.lessonId))

export const findLessonForProgress = (lessonId: string) =>
	db.lesson.findUnique({
		where: { id: lessonId, isPublished: true },
		select: { id: true, courseId: true, position: true, access: true }
	})

export const findNextLessonId = (courseId: string, afterPosition: number) =>
	db.lesson
		.findFirst({
			where: { courseId, position: { gt: afterPosition }, isPublished: true },
			orderBy: { position: 'asc' },
			select: { id: true }
		})
		.then((row) => row?.id ?? null)

/** Atomically flips completion and awards/revokes points for it - never one without the other. */
export const upsertProgressWithPoints = (userId: string, lessonId: string, isCompleted: boolean) =>
	db.$transaction(async (tx) => {
		const existing = await tx.userProgress.findUnique({
			where: { userId_lessonId: { userId, lessonId } }
		})

		const progress = existing
			? await tx.userProgress.update({
					where: { userId_lessonId: { userId, lessonId } },
					data: { isCompleted }
				})
			: await tx.userProgress.create({ data: { userId, lessonId, isCompleted } })

		const wasCompleted = existing?.isCompleted ?? false

		if (!wasCompleted && isCompleted) {
			await tx.user.update({
				where: { id: userId },
				data: { points: { increment: POINTS_PER_LESSON } }
			})
		} else if (wasCompleted && !isCompleted) {
			await tx.user.update({
				where: { id: userId },
				data: { points: { decrement: POINTS_PER_LESSON } }
			})
		}

		return progress
	})
