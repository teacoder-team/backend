import { type Static, t } from 'elysia'

import { CourseAccessMode, CourseStage, type Prisma } from '@prisma/generated/client'

import { PrismaEnum } from '~/lib/utils/schema'

const CourseId = t.String({
	description: 'Идентификатор курса.',
	examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
})

const CourseTitle = t.String({ description: 'Название курса.', examples: ['Основы TypeScript'] })

const CourseSlug = t.String({
	description: 'Идентификатор курса для URL.',
	examples: ['osnovy-typescript']
})

const CourseShortDescription = t.Nullable(
	t.String({
		description: 'Краткое описание для карточки.',
		examples: ['Погружение в типизацию с нуля']
	})
)

const CourseThumbnail = t.Nullable(
	t.String({
		description: 'Обложка курса.',
		examples: ['https://orion.teacoder.ru/courses/Q2J4N7SP7OJLZFFJLTCAQ3GGO5']
	})
)

const CoursePrice = t.Nullable(
	t.Number({
		description:
			'Цена разовой покупки в рублях без скидки, если курс платный. Пока действует скидка, списывается `discountPrice`. `null` - бесплатный курс (платные уроки в нём, если есть, открываются подпиской).',
		examples: [1990]
	})
)

const CourseDiscountPrice = t.Nullable(
	t.Number({
		description:
			'Цена со скидкой в рублях: именно она списывается при оплате, пока скидка действует, и всегда ниже `price`. `null` - скидки нет, платите `price`.',
		examples: [1490]
	})
)

const CourseLearningOutcomes = t.Array(
	t.String({
		description: 'Чему научится студент.',
		examples: ['Типизировать функции и классы']
	}),
	{
		description:
			'Что вы узнаете на курсе: пункты списка в порядке показа. Пустой массив, если не заполнено.'
	}
)

const CourseAccessModeSchema = PrismaEnum(CourseAccessMode, {
	description:
		'Как открываются закрытые уроки и материалы: `FREE` - курс полностью бесплатный, `PREMIUM` - только по премиум-подписке, `PURCHASE` - только покупкой курса, `PREMIUM_OR_PURCHASE` - по подписке или покупке на выбор. Купленный курс открыт навсегда в любом режиме, даже если режим потом изменили.',
	examples: [CourseAccessMode.PREMIUM]
})

const CourseStageSchema = PrismaEnum(CourseStage, {
	description:
		'Стадия производства курса: `DRAFT` - готовится, публично недоступен, `IN_PRODUCTION` - записывается и выходит поэтапно, `COMPLETED` - записан и собран полностью, `ARCHIVED` - больше не развивается и убран из каталога. Стадия не отвечает за оплату: за неё отвечает `accessMode`.',
	examples: [CourseStage.IN_PRODUCTION]
})

const CourseStatusSchema = t.UnionEnum(
	[
		'DRAFT',
		'IN_PRODUCTION',
		'EARLY_ACCESS',
		'COMPLETED',
		'PUBLICLY_RELEASED',
		'ARCHIVED'
	] as const,
	{
		description:
			'Главный статус курса - его и показывайте, остальные признаки идут отдельными полями. Считается на сервере: `DRAFT` - «В разработке» (публично не отдаётся), `IN_PRODUCTION` - «Выходит поэтапно», `EARLY_ACCESS` - «Ранний доступ» (выходит поэтапно и доступен по подписке или покупке), `COMPLETED` - «Курс завершён», `PUBLICLY_RELEASED` - «Полная версия на YouTube», `ARCHIVED` - «В архиве».',
		examples: ['EARLY_ACCESS']
	}
)

const CourseRelease = t.Object(
	{
		status: CourseStatusSchema,
		stage: CourseStageSchema,
		isReleasing: t.Boolean({
			description:
				'Выходят ли ещё новые уроки. `true` - курс записывается прямо сейчас, в программе могут быть уроки со статусом «скоро».',
			examples: [true]
		}),
		publishedLessons: t.Number({
			description: 'Сколько уроков уже открыто - считается по реальным урокам курса.',
			examples: [12]
		}),
		upcomingLessons: t.Number({
			description:
				'Сколько уроков анонсировано, но ещё не вышло. Не включает уроки, которые ещё не анонсированы, поэтому это не план по всему курсу.',
			examples: [3]
		})
	},
	{ description: 'Стадия выпуска курса и прогресс выхода уроков.' }
)

const CourseEntitlements = t.Object(
	{
		premium: t.Boolean({
			description: 'Открывает ли курс премиум-подписка - «Доступно по Premium».',
			examples: [true]
		}),
		purchase: t.Boolean({
			description:
				'Можно ли купить курс отдельно прямо сейчас - показывайте «Купить курс». Учитывает режим доступа, цену, публикацию и архив: если `false`, `POST /billing/create` с этим курсом вернёт 404.',
			examples: [true]
		})
	},
	{ description: 'Как курс можно открыть: подписка, разовая покупка или оба способа.' }
)

const HasMaterials = t.Boolean({
	description:
		'Есть ли у курса материалы (исходный код). Скачать - `POST /courses/{slug}/materials/link`.'
})

export const CourseListItem = t.Object(
	{
		id: CourseId,
		title: CourseTitle,
		slug: CourseSlug,
		shortDescription: CourseShortDescription,
		thumbnail: CourseThumbnail,
		price: CoursePrice,
		discountPrice: CourseDiscountPrice,
		accessMode: CourseAccessModeSchema,
		status: CourseStatusSchema,
		hasMaterials: HasMaterials,
		lessons: t.Number({ description: 'Количество опубликованных уроков.', examples: [10] }),
		upcomingLessons: t.Number({
			description: 'Сколько уроков анонсировано, но ещё не вышло.',
			examples: [3]
		})
	},
	{ description: 'Карточка курса в каталоге.' }
)

export const CourseListResponse = t.Array(CourseListItem, {
	description: 'Опубликованные курсы, кроме архивных.'
})

export const CourseLibraryResponse = t.Array(CourseListItem, {
	description:
		'Библиотека пользователя: опубликованные купленные курсы и Premium-курсы при действующей подписке. Бесплатные курсы исключены.'
})

export const CourseSlugParams = t.Object({
	slug: CourseSlug
})

export const CourseAccessResponse = t.Object(
	{
		hasAccess: t.Boolean({
			description: 'Открыты ли текущему пользователю закрытые уроки и материалы курса.'
		}),
		via: t.Nullable(
			t.UnionEnum(['FREE', 'PURCHASE', 'PREMIUM'], {
				description:
					'Почему открыт: `FREE` - курс бесплатный, `PURCHASE` - курс куплен, `PREMIUM` - по подписке. `null` - закрыт.',
				examples: ['PREMIUM']
			})
		)
	},
	{
		description:
			'Доступ текущего пользователя. Без входа открыт только бесплатный курс (ознакомительные уроки открыты всем в любом случае).'
	}
)

export const CourseResponse = t.Object(
	{
		id: CourseId,
		title: CourseTitle,
		slug: CourseSlug,
		shortDescription: CourseShortDescription,
		fullDescription: t.Nullable(
			t.String({ description: 'Полное описание для страницы курса.' })
		),
		thumbnail: CourseThumbnail,
		youtubeUrl: t.Nullable(
			t.String({
				description:
					'Ссылка на бесплатную полную версию курса на YouTube. Пока ссылки нет - `null`. Выход на YouTube не отменяет платный доступ к урокам и материалам на сайте: уроки, программа и исходники остаются по текущему `accessMode`.',
				examples: ['https://youtube.com/watch?v=...']
			})
		),
		price: CoursePrice,
		discountPrice: CourseDiscountPrice,
		learningOutcomes: CourseLearningOutcomes,
		accessMode: CourseAccessModeSchema,
		release: CourseRelease,
		entitlements: CourseEntitlements,
		hasMaterials: HasMaterials,
		access: CourseAccessResponse,
		views: t.Number({ description: 'Сколько раз открывали страницу курса.', examples: [4213] })
	},
	{ description: 'Курс.' }
)

export const CourseLessonListItem = t.Object(
	{
		id: t.String({
			description: 'Идентификатор урока.',
			examples: ['550e8400-e29b-41d4-a716-446655440000']
		}),
		title: t.String({ description: 'Название урока.', examples: ['Переменные и типы'] }),
		slug: t.String({
			description: 'Идентификатор урока для URL.',
			examples: ['peremennye-i-tipy']
		}),
		isAvailable: t.Boolean({
			description:
				'Открыт ли урок. `false` - урок анонсирован, но ещё не вышел: показывайте его как «скоро» и не ведите на страницу урока, `GET /lessons/{id}` ответит 404.',
			examples: [true]
		}),
		plannedReleaseAt: t.Nullable(
			t.String({
				description:
					'Когда урок планируют открыть. `null` - дата не назначена, даже если урок ещё не вышел.',
				examples: ['2026-11-01T09:00:00.000Z']
			})
		),
		isCompleted: t.Optional(
			t.Boolean({
				description:
					'Пройден ли урок текущим пользователем. Возвращается только при авторизации. У невышедшего урока всегда `false`.',
				examples: [true]
			})
		)
	},
	{ description: 'Урок в программе курса: вышедший или анонсированный.' }
)

export const CourseSectionListItem = t.Object(
	{
		id: t.String({
			description: 'Идентификатор секции курса.',
			examples: ['9704cd4b-d3b2-4fbc-ae81-037f9fe58659']
		}),
		title: t.String({ description: 'Название секции.', examples: ['Введение'] }),
		lessons: t.Array(CourseLessonListItem, {
			description:
				'Уроки секции в порядке прохождения: вышедшие и анонсированные, см. `isAvailable`.'
		})
	},
	{ description: 'Секция программы курса с вложенными уроками.' }
)

export const CourseLessonListResponse = t.Array(
	t.Union([CourseSectionListItem, CourseLessonListItem]),
	{
		description:
			'Программа курса: секции и отдельные уроки по порядку. Секция содержит массив lessons. Без секций возвращается обычный список уроков.\n\nПомимо вышедших уроков в программу попадают анонсированные - у них `isAvailable: false` и, если назначена, дата в `plannedReleaseAt`. Неанонсированные черновики не отдаются никому.'
	}
)

export type CourseSlugParamsInput = Static<typeof CourseSlugParams>

export const MaterialsLinkResponse = t.Object(
	{
		url: t.String({
			description:
				'Ссылка на архив с материалами - откройте её в браузере, начнётся скачивание. Действует 5 минут.',
			examples: [
				'https://api.teacoder.ru/downloads/q2fSx1Gd0Yk7uJ9ZlQm3cW8vB4nR6tHpE5aT1oKyL0s'
			]
		}),
		expiresIn: t.Number({
			description: 'Через сколько секунд ссылка перестанет работать.',
			examples: [300]
		})
	},
	{ description: 'Временная ссылка на материалы курса.' }
)

export const DownloadParams = t.Object({
	token: t.String({
		pattern: '^[A-Za-z0-9_-]{43}$',
		description: 'Токен из ссылки на материалы.',
		error: 'Invalid download token'
	})
})

export type CourseAccessSource = 'FREE' | 'PURCHASE' | 'PREMIUM'

export interface CourseEntitlement {
	hasAccess: boolean

	via: CourseAccessSource | null
}

export interface GatedCourse {
	id: string
	accessMode: CourseAccessMode
}

export type CourseStatus = Static<typeof CourseStatusSchema>

export const PREMIUM_ACCESS_MODES: CourseAccessMode[] = [
	CourseAccessMode.PREMIUM,
	CourseAccessMode.PREMIUM_OR_PURCHASE
]

export const PURCHASABLE_ACCESS_MODES: CourseAccessMode[] = [
	CourseAccessMode.PURCHASE,
	CourseAccessMode.PREMIUM_OR_PURCHASE
]

export interface CourseReleaseState {
	isPublished: boolean
	stage: CourseStage
	accessMode: CourseAccessMode
	youtubeUrl: string | null
}

export interface PurchasableCourse {
	isPublished: boolean
	stage: CourseStage
	accessMode: CourseAccessMode
	price: Prisma.Decimal | null
	discountPrice: Prisma.Decimal | null
}
