import { Button, Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface SubscriptionExpiringEmailProps {
	username?: string
	/** Whether a charge will be attempted at the end of the period. */
	isAutoBilling: boolean
	/** Moscow date and time - of the nightly charge with auto-renewal, of the access cutoff without. */
	date: string
	time: string
	amount?: number
	currency?: string
	manageUrl?: string
	premiumUrl?: string
}

export const SubscriptionExpiringEmail = ({
	username = 'Elon Mask',
	isAutoBilling = true,
	date = '17 октября 2026',
	time = '03:00',
	amount = 849,
	currency = 'RUB',
	manageUrl = 'https://teacoder.ru/account/settings',
	premiumUrl = 'https://teacoder.ru/premium'
}: SubscriptionExpiringEmailProps) => (
	<EmailLayout
		preview={
			isAutoBilling ? 'Скоро продление подписки на TeaCoder' : 'Подписка на TeaCoder скоро закончится'
		}
	>
		{isAutoBilling ? (
			<>
				<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
					Скоро продление подписки
				</Heading>

				<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
					Привет, {username}! Ночью{' '}
					<span className="text-gray-900 font-medium">
						{date}, около {time} по Москве
					</span>
					, мы автоматически спишем{' '}
					<span className="text-gray-900 font-medium">
						{amount} {currency}
					</span>{' '}
					за следующий месяц премиума.
				</Text>

				<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
					Попытка списания будет одна: если оплата не пройдёт, подписка закончится. Отключить
					автопродление можно в настройках аккаунта.
				</Text>

				<Section className="mb-8">
					<Button
						className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
						href={manageUrl}
					>
						Управлять подпиской
					</Button>
				</Section>
			</>
		) : (
			<>
				<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
					Подписка скоро закончится
				</Heading>

				<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
					Привет, {username}! Автопродление отключено, поэтому{' '}
					<span className="text-gray-900 font-medium">
						{date} в {time} по Москве
					</span>{' '}
					доступ к премиум-курсам будет закрыт.
				</Text>

				<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
					Чтобы не терять доступ, продлите подписку заранее - оставшиеся дни сохранятся.
				</Text>

				<Section className="mb-8">
					<Button
						className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
						href={premiumUrl}
					>
						Продлить подписку
					</Button>
				</Section>
			</>
		)}
	</EmailLayout>
)

export default SubscriptionExpiringEmail
