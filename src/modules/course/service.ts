import { randomBytes } from 'node:crypto'

import { CourseAccessMode, CourseStage, LessonAccess, type Prisma } from '@prisma/generated/client'

import { env } from '~/config/env'
import { ForbiddenError, InternalError, NotFoundError } from '~/lib/errors'
import { orion, orionUrl } from '~/lib/integrations/orion'
import { logger } from '~/lib/logger'
import { redis } from '~/lib/redis'
import { findCompletedLessonIds } from '~/modules/progress/repository'
import { hasActiveSubscription } from '~/modules/subscription/repository'

import {
	type CourseEntitlement,
	type CourseReleaseState,
	type CourseStatus,
	type GatedCourse,
	PREMIUM_ACCESS_MODES,
	PURCHASABLE_ACCESS_MODES,
	type PurchasableCourse
} from './model'
import {
	findCourseAttachment,
	findCoursePurchase,
	findPublishedCourseBySlug,
	findPublishedCourseProgram,
	incrementCourseViews,
	listLibraryCourses,
	listPublishedCourses,
	logCourseDownload
} from './repository'

const VIEW_DEDUP_TTL = 30 * 60
const DOWNLOAD_LINK_TTL = 5 * 60
const UPSTREAM_TIMEOUT_MS = 30_000

export const resolveCoursePrice = (
	price: Prisma.Decimal | null,
	discountPrice: Prisma.Decimal | null
) => {
	if (!price?.gt(0)) {
		return { price: null, discountPrice: null, payable: null }
	}

	if (discountPrice?.gt(0) && discountPrice.lt(price)) {
		return {
			price: price.toNumber(),
			discountPrice: discountPrice.toNumber(),
			payable: discountPrice.toNumber()
		}
	}

	return { price: price.toNumber(), discountPrice: null, payable: price.toNumber() }
}

const publicPrices = (price: Prisma.Decimal | null, discountPrice: Prisma.Decimal | null) => {
	const resolved = resolveCoursePrice(price, discountPrice)

	return { price: resolved.price, discountPrice: resolved.discountPrice }
}

export const resolveCourseStatus = (course: CourseReleaseState): CourseStatus => {
	if (!course.isPublished || course.stage === CourseStage.DRAFT) {
		return 'DRAFT'
	}

	if (course.stage === CourseStage.ARCHIVED) {
		return 'ARCHIVED'
	}

	if (course.stage === CourseStage.ANNOUNCED) {
		return 'ANNOUNCED'
	}

	if (course.youtubeUrl) {
		return 'PUBLICLY_RELEASED'
	}

	if (course.stage === CourseStage.COMPLETED) {
		return 'COMPLETED'
	}

	return course.accessMode === CourseAccessMode.FREE ? 'IN_PRODUCTION' : 'EARLY_ACCESS'
}

const UNSELLABLE_STAGES: CourseStage[] = [
	CourseStage.DRAFT,
	CourseStage.ANNOUNCED,
	CourseStage.ARCHIVED
]

export const isCoursePurchasable = (course: PurchasableCourse) =>
	course.isPublished &&
	PURCHASABLE_ACCESS_MODES.includes(course.accessMode) &&
	resolveCoursePrice(course.price, course.discountPrice).payable !== null &&
	!UNSELLABLE_STAGES.includes(course.stage)

const countLessons = (lessons: { isPublished: boolean }[]) => {
	const published = lessons.filter((lesson) => lesson.isPublished).length

	return { publishedLessons: published, upcomingLessons: lessons.length - published }
}

const viewDedupKey = (courseId: string, ip: string) => `course:view:${courseId}:${ip}`
const downloadKey = (token: string) => `course:materials:${token}`

const registerView = async (courseId: string, ip: string) => {
	const isFirstSeen = await redis.set(viewDedupKey(courseId, ip), '1', 'EX', VIEW_DEDUP_TTL, 'NX')

	if (!isFirstSeen) {
		return
	}

	await incrementCourseViews(courseId)
}

const findCourse = async (slug: string) => {
	const course = await findPublishedCourseBySlug(slug)

	if (!course) {
		throw new NotFoundError('Course not found')
	}

	return course
}

const toCourseListItem = ({
	lessons,
	price,
	discountPrice,
	attachment,
	isPublished,
	stage,
	youtubeUrl,
	...course
}: Awaited<ReturnType<typeof listPublishedCourses>>[number]) => {
	const { publishedLessons, upcomingLessons } = countLessons(lessons)

	return {
		...course,
		thumbnail: orionUrl('courses', course.thumbnail),
		...publicPrices(price, discountPrice),
		status: resolveCourseStatus({
			isPublished,
			stage,
			youtubeUrl,
			accessMode: course.accessMode
		}),
		hasMaterials: Boolean(attachment),
		lessons: publishedLessons,
		upcomingLessons
	}
}

export const listCourses = async () => {
	const courses = await listPublishedCourses()

	return courses.map(toCourseListItem)
}

export const getCourseLibrary = async (userId: string) => {
	const hasPremium = await hasActiveSubscription(userId)
	const courses = await listLibraryCourses(userId, hasPremium)

	return courses.map(toCourseListItem)
}

export const getCourseBySlug = async (slug: string, ip: string, userId: string | null) => {
	const { attachment, price, discountPrice, lessons, isPublished, stage, ...course } =
		await findCourse(slug)

	void registerView(course.id, ip).catch((err) => {
		logger.warn({ err, courseId: course.id }, 'course_view_increment_failed')
	})

	const releaseState = {
		isPublished,
		stage,
		youtubeUrl: course.youtubeUrl,
		accessMode: course.accessMode
	}

	return {
		...course,
		thumbnail: orionUrl('courses', course.thumbnail),
		...publicPrices(price, discountPrice),
		release: {
			status: resolveCourseStatus(releaseState),
			stage,
			isReleasing: stage === CourseStage.IN_PRODUCTION,
			...countLessons(lessons)
		},
		entitlements: {
			premium: PREMIUM_ACCESS_MODES.includes(course.accessMode),
			purchase: isCoursePurchasable({ ...releaseState, price, discountPrice })
		},
		hasMaterials: Boolean(attachment),
		access: await resolveCourseAccess(userId, course)
	}
}

interface ProgramLesson {
	id: string
	title: string
	slug: string
	isPublished: boolean
	plannedReleaseAt: Date | null
}

export const getCourseLessons = async (slug: string, userId: string | null) => {
	const program = await findPublishedCourseProgram(slug)

	if (!program) {
		throw new NotFoundError('Course not found')
	}

	const availableIds = [
		...program.sections.flatMap((section) => section.lessons),
		...program.lessons
	]
		.filter((lesson) => lesson.isPublished)
		.map((lesson) => lesson.id)
	const completed = userId
		? new Set(availableIds.length > 0 ? await findCompletedLessonIds(userId, availableIds) : [])
		: null

	const withProgress = ({ isPublished, plannedReleaseAt, ...lesson }: ProgramLesson) => ({
		...lesson,
		isAvailable: isPublished,
		plannedReleaseAt: plannedReleaseAt?.toISOString() ?? null,
		...(completed ? { isCompleted: completed.has(lesson.id) } : {})
	})

	const sections = program.sections.map(({ position, lessons, ...section }) => ({
		position,
		item: { ...section, lessons: lessons.map(withProgress) }
	}))
	const lessons = program.lessons.map(({ position, ...lesson }) => ({
		position,
		item: withProgress(lesson)
	}))

	return [...sections, ...lessons]
		.sort(
			(left, right) =>
				left.position - right.position || left.item.id.localeCompare(right.item.id)
		)
		.map(({ item }) => item)
}

export const createMaterialsLink = async (slug: string, userId: string) => {
	const course = await findCourse(slug)

	if (!course.attachment) {
		throw new NotFoundError('This course has no materials')
	}

	if (!(await resolveCourseAccess(userId, course)).hasAccess) {
		throw new ForbiddenError(MATERIALS_LOCKED_REASON[course.accessMode])
	}

	const token = randomBytes(32).toString('base64url')

	await redis.set(
		downloadKey(token),
		JSON.stringify({ courseId: course.id, userId }),
		'EX',
		DOWNLOAD_LINK_TTL
	)

	return { url: `${env.GATEWAY_URL}/downloads/${token}`, expiresIn: DOWNLOAD_LINK_TTL }
}

const EXTENSION = /\.[a-z0-9]{1,8}$/i

const archiveName = (slug: string, attachment: string, contentType: string | null) => {
	const extension =
		attachment.split('/').pop()?.match(EXTENSION)?.[0] ??
		(contentType?.includes('zip') ? '.zip' : '')

	return `${slug}${extension}`
}

export const openMaterialsDownload = async (token: string, ip: string, userAgent: string) => {
	const parked = await redis.get(downloadKey(token))

	if (!parked) {
		throw new NotFoundError('Download link is invalid or expired')
	}

	const { courseId, userId } = JSON.parse(parked) as { courseId: string; userId: string }
	const course = await findCourseAttachment(courseId)

	if (!course?.attachment) {
		throw new NotFoundError('This course has no materials')
	}

	const source = orion.resolveUrl('attachments', course.attachment)

	const upstream = await fetch(source, {
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
	}).catch((err: unknown) => {
		logger.error({ context: 'course', courseId, err }, 'course_materials_fetch_failed')

		return null
	})

	if (!upstream?.ok || !upstream.body) {
		logger.error(
			{ context: 'course', courseId, status: upstream?.status },
			'course_materials_unavailable'
		)

		throw new InternalError('Course materials are temporarily unavailable')
	}

	await logCourseDownload({ token, userId, courseId, ip, userAgent }).catch((err: unknown) => {
		logger.warn({ context: 'course', courseId, err }, 'course_download_log_failed')
	})

	const contentType = upstream.headers.get('content-type')

	return {
		body: upstream.body,
		contentType: contentType ?? 'application/octet-stream',
		contentLength: upstream.headers.get('content-length'),
		filename: archiveName(course.slug, course.attachment, contentType)
	}
}

export const resolveCourseAccess = async (
	userId: string | null,
	course: GatedCourse
): Promise<CourseEntitlement> => {
	if (course.accessMode === CourseAccessMode.FREE) {
		return { hasAccess: true, via: 'FREE' }
	}

	if (!userId) {
		return { hasAccess: false, via: null }
	}

	if (await findCoursePurchase(userId, course.id)) {
		return { hasAccess: true, via: 'PURCHASE' }
	}

	if (PREMIUM_ACCESS_MODES.includes(course.accessMode) && (await hasActiveSubscription(userId))) {
		return { hasAccess: true, via: 'PREMIUM' }
	}

	return { hasAccess: false, via: null }
}

export const isLessonOpen = (access: LessonAccess, entitlement: CourseEntitlement) =>
	access === LessonAccess.FREE || entitlement.hasAccess

export const resolveLessonAccess = async (
	userId: string | null,
	course: GatedCourse,
	access: LessonAccess
): Promise<CourseEntitlement> => {
	if (access === LessonAccess.FREE) {
		return { hasAccess: true, via: 'FREE' }
	}

	const entitlement = await resolveCourseAccess(userId, course)

	if (entitlement.hasAccess || !userId) {
		return entitlement
	}

	if (access === LessonAccess.PREMIUM && (await hasActiveSubscription(userId))) {
		return { hasAccess: true, via: 'PREMIUM' }
	}

	return entitlement
}

const BOTH_WAYS = 'TeaCoder Premium or buying the course'

const LESSON_LOCKED_REASON: Record<CourseAccessMode, string> = {
	[CourseAccessMode.FREE]: `This lesson requires ${BOTH_WAYS}`,
	[CourseAccessMode.PREMIUM]: 'This lesson requires TeaCoder Premium',
	[CourseAccessMode.PURCHASE]: 'This lesson requires buying the course',
	[CourseAccessMode.PREMIUM_OR_PURCHASE]: `This lesson requires ${BOTH_WAYS}`
}

const MATERIALS_LOCKED_REASON: Record<CourseAccessMode, string> = {
	[CourseAccessMode.FREE]: `Course materials require ${BOTH_WAYS}`,
	[CourseAccessMode.PREMIUM]: 'Course materials require TeaCoder Premium',
	[CourseAccessMode.PURCHASE]: 'Course materials require buying the course',
	[CourseAccessMode.PREMIUM_OR_PURCHASE]: `Course materials require ${BOTH_WAYS}`
}

export const lockedReason = (course: GatedCourse) => LESSON_LOCKED_REASON[course.accessMode]
