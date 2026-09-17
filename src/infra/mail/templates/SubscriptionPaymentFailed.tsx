import { Button, Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface SubscriptionPaymentFailedEmailProps {
	username?: string
	premiumUrl?: string
}

export const SubscriptionPaymentFailedEmail = ({
	username = 'Elon Mask',
	premiumUrl = 'https://teacoder.ru/premium'
}: SubscriptionPaymentFailedEmailProps) => (
	<EmailLayout preview="Не получилось продлить подписку на TeaCoder">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Не получилось продлить подписку
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
			Привет, {username}! Не удалось списать оплату за продление - возможно, на карте
			недостаточно средств или платёж отклонён банком.
		</Text>

		<Section className="bg-[#FEF2F2] rounded-xl py-5 px-6 border border-[#FEE2E2] mb-8">
			<Text className="m-0 text-sm leading-relaxed text-[#B91C1C] font-medium">
				Доступ к премиум-курсам приостановлен
			</Text>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
			Ничего страшного - оформить подписку заново можно в любой момент на{' '}
			<span className="text-gray-600 font-medium">teacoder.ru/premium</span>.
		</Text>

		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={premiumUrl}
			>
				Оформить подписку заново
			</Button>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Если возникли вопросы - просто ответьте на это письмо, поможем разобраться.
		</Text>
	</EmailLayout>
)

export default SubscriptionPaymentFailedEmail
