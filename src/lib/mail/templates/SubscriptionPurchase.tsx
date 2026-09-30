import { Button, Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface SubscriptionPurchaseEmailProps {
	username?: string
	expiresAt: string
	manageUrl?: string
}

export const SubscriptionPurchaseEmail = ({
	username = 'Elon Mask',
	expiresAt = '17 октября 2026',
	manageUrl = 'https://teacoder.ru/courses'
}: SubscriptionPurchaseEmailProps) => (
	<EmailLayout preview="Премиум активирован - добро пожаловать в TeaCoder">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Премиум активирован!
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
			Привет, {username}! Теперь Вам доступны все курсы TeaCoder без ограничений.
		</Text>

		<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
			Подписка действует до <span className="text-gray-600 font-medium">{expiresAt}</span> и
			продлевается автоматически.
		</Text>

		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={manageUrl}
			>
				Перейти к курсам
			</Button>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Управлять автопродлением можно в любой момент в настройках аккаунта.
		</Text>
	</EmailLayout>
)

export default SubscriptionPurchaseEmail
