import { Button, Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface SubscriptionPurchaseEmailProps {
	username?: string
	expiresAt: string

	extended?: boolean
	coursesUrl?: string
}

export const SubscriptionPurchaseEmail = ({
	username = 'Elon Mask',
	expiresAt = '17 октября 2026',
	extended = false,
	coursesUrl = 'https://teacoder.ru/courses'
}: SubscriptionPurchaseEmailProps) => (
	<EmailLayout
		preview={
			extended
				? `Премиум продлён до ${expiresAt}`
				: 'Премиум активирован - добро пожаловать в TeaCoder'
		}
	>
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			{extended ? 'Премиум продлён!' : 'Премиум активирован!'}
		</Heading>
		<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
			{' '}
			Привет, {username}!{' '}
			{extended
				? 'Оплата прошла - новый период добавлен к текущему, оставшиеся дни не сгорают.'
				: 'Теперь Вам доступны все курсы, входящие в перечень курсов, доступных по Премиум-подписке.'}{' '}
		</Text>{' '}
		{!extended && (
			<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
				{' '}
				Курсы, не входящие в этот перечень, приобретаются отдельно.{' '}
			</Text>
		)}
		<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
			Подписка действует до <span className="text-gray-600 font-medium">{expiresAt}</span>.
		</Text>
		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={coursesUrl}
			>
				Перейти к курсам
			</Button>
		</Section>
		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Спасибо, что учитесь с TeaCoder!
		</Text>
	</EmailLayout>
)

export default SubscriptionPurchaseEmail
