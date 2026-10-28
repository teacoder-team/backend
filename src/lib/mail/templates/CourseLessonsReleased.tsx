import { Button, Heading, Img, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface CourseLessonsReleasedEmailProps {
	username?: string
	courseTitle: string
	courseThumbnail?: string | null
	courseUrl: string
	lessons: string[]
}

export const CourseLessonsReleasedEmail = ({
	username = 'Elon Mask',
	courseTitle = 'Полный курс по Bun',
	courseThumbnail = 'https://orion.teacoder.ru/courses/VMVCSFDKTIRJ42GLU23CYV6ZLV',
	courseUrl = 'https://teacoder.ru/courses/bun-course',
	lessons = ['Запуск кода', 'Watch и hot', 'TypeScript и JSX']
}: CourseLessonsReleasedEmailProps) => {
	const isSingle = lessons.length === 1

	return (
		<EmailLayout
			preview={
				isSingle
					? `Новый урок в курсе «${courseTitle}»`
					: `Новые уроки в курсе «${courseTitle}»: ${lessons.length}`
			}
		>
			<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
				{isSingle ? 'Вышел новый урок' : 'Вышли новые уроки'}
			</Heading>

			<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
				Привет, {username}! В курсе «{courseTitle}»{' '}
				{isSingle ? 'открыт новый урок' : `открыто новых уроков: ${lessons.length}`}.
			</Text>

			{courseThumbnail && (
				<Section className="mb-6">
					<Img
						src={courseThumbnail}
						width="380"
						height="200"
						alt={courseTitle}
						className="mx-auto w-full max-w-[380px] h-auto rounded-xl object-cover border border-gray-100"
					/>
				</Section>
			)}

			<Section className="mb-8 rounded-xl border border-gray-100 px-6 py-4">
				{lessons.map((lesson) => (
					<Text
						key={lesson}
						className="text-base leading-relaxed text-black my-2 tracking-wide"
					>
						- {lesson}
					</Text>
				))}
			</Section>

			<Section className="mb-8">
				<Button
					className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
					href={courseUrl}
				>
					{isSingle ? 'Смотреть урок' : 'Смотреть уроки'}
				</Button>
			</Section>

			<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
				Курс выходит поэтапно - мы напишем снова, когда откроются следующие уроки.
			</Text>
		</EmailLayout>
	)
}

export default CourseLessonsReleasedEmail
