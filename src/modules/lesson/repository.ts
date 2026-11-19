import { db } from '~/lib/db'

export const findLessonAttachment = (id: string) =>
	db.lesson.findFirst({
		where: { id, isPublished: true, course: { isPublished: true }, attachment: { not: null } },
		select: { slug: true, attachment: true }
	})

export const findPublishedLessonById = (id: string) =>
	db.lesson.findUnique({
		where: { id, isPublished: true, course: { isPublished: true } },
		select: {
			id: true,
			title: true,
			slug: true,
			description: true,
			position: true,
			access: true,
			kinescopeId: true,
			attachment: true,
			resources: true,
			homeworkTask: true,
			homeworkChecklist: true,
			course: { select: { id: true, title: true, slug: true, accessMode: true } }
		}
	})
