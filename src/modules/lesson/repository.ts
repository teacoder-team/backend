import { db } from '~/lib/db'

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
			resources: true,
			homeworkTask: true,
			homeworkChecklist: true,
			course: { select: { id: true, title: true, slug: true, accessMode: true } }
		}
	})
