import { Button, Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface SubscriptionRenewedEmailProps {
	username?: string
	amount: number
	currency?: string
	expiresAt: string
	manageUrl?: string
}

export const SubscriptionRenewedEmail = ({
	username = 'Elon Mask',
	amount = 449,
	currency = 'RUB',
	expiresAt = '17 ноября 2026',
	manageUrl = 'https://teacoder.ru/account/billing'
}: SubscriptionRenewedEmailProps) => (
	<EmailLayout preview="Подписка на TeaCoder продлена">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Подписка продлена!
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
			Привет, {username}! Мы успешно списали{' '}
			<span className="text-gray-900 font-medium">
				{amount} {currency}
			</span>{' '}
			и продлили Вашу подписку - доступ к премиум-курсам продолжает работать без перерывов.
		</Text>

		<Section className="bg-[#f3f4f6] rounded-xl py-6 px-6 border border-gray-100 mb-8">
			<Text className="m-0 text-xs uppercase tracking-wider text-gray-400 mb-1">
				Новая дата окончания
			</Text>
			<Text className="m-0 text-lg font-semibold text-gray-900">{expiresAt}</Text>
		</Section>

		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={manageUrl}
			>
				Перейти в личный кабинет
			</Button>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Спасибо, что остаётесь с TeaCoder 💛
		</Text>
	</EmailLayout>
)

export default SubscriptionRenewedEmail
