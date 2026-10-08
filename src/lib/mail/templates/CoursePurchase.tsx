import { Button, Heading, Img, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface CoursePurchaseEmailProps {
	username?: string
	courseTitle: string
	courseThumbnail?: string | null
	courseUrl: string
}

export const CoursePurchaseEmail = ({
	username = 'Elon Mask',
	courseTitle = 'Микросервисы на практике',
	courseThumbnail = 'https://orion.teacoder.ru/courses/Q2J4N7SP7OJLZFFJLTCAQ3GGO5',
	courseUrl = 'https://teacoder.ru/courses/mikroservisy-na-praktike-servis-prodazhi-biletov'
}: CoursePurchaseEmailProps) => (
	<EmailLayout preview={`Курс «${courseTitle}» уже ждёт Вас`}>
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Оплата прошла успешно!
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}! Курс уже открыт и ждёт Вас в личном кабинете.
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

		<Heading as="h2" className="font-serif text-xl font-medium leading-snug text-black mb-8">
			{courseTitle}
		</Heading>

		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={courseUrl}
			>
				Перейти к курсу
			</Button>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Спасибо за покупку! Приятного просмотра и успешного обучения.
		</Text>
	</EmailLayout>
)

export default CoursePurchaseEmail
