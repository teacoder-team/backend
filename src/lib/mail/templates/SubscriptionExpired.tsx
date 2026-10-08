import { Button, Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface SubscriptionExpiredEmailProps {
	username?: string
	premiumUrl?: string
}

export const SubscriptionExpiredEmail = ({
	username = 'Elon Mask',
	premiumUrl = 'https://teacoder.ru/premium'
}: SubscriptionExpiredEmailProps) => (
	<EmailLayout preview="Премиум-подписка на TeaCoder закончилась">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Подписка закончилась
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
			Привет, {username}! Срок премиум-подписки истёк, а автопродление было отключено, поэтому
			доступ к премиум-курсам закрыт.
		</Text>

		<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
			Курсы, которые Вы купили отдельно, и весь прогресс остаются с Вами. Вернуть премиум можно в
			любой момент.
		</Text>

		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={premiumUrl}
			>
				Оформить подписку снова
			</Button>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Спасибо, что учились с TeaCoder!
		</Text>
	</EmailLayout>
)

export default SubscriptionExpiredEmail
