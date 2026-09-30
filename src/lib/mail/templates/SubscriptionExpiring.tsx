import { Button, Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface SubscriptionExpiringEmailProps {
	username?: string
	/** Whether Robokassa recurring billing will attempt a charge. */
	isAutoBilling: boolean
	/** Pre-formatted date and time - either the next charge or the access cutoff. */
	renewsAt: string
	amount?: number
	currency?: string
	manageUrl?: string
}

export const SubscriptionExpiringEmail = ({
	username = 'Elon Mask',
	isAutoBilling = true,
	renewsAt = '17 октября 2026 в 14:00',
	amount = 449,
	currency = 'RUB',
	manageUrl = 'https://teacoder.ru/account/subscription'
}: SubscriptionExpiringEmailProps) => (
	<EmailLayout preview="Подписка на TeaCoder скоро закончится">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Подписка скоро закончится
		</Heading>

		{isAutoBilling ? (
			<>
				<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
					Привет, {username}! Через 3 дня, {renewsAt}, мы спишем{' '}
					<span className="text-gray-900 font-medium">
						{amount} {currency}
					</span>{' '}
					за продление подписки - доступ к премиум-курсам сохранится, если на карте будет
					достаточно средств.
				</Text>

				<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
					Изменить способ оплаты или отключить автопродление можно в настройках аккаунта.
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
				<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
					Привет, {username}! Автопродление отключено, поэтому{' '}
					<span className="text-gray-900 font-medium">{renewsAt}</span> доступ к
					премиум-курсам будет закрыт.
				</Text>

				<Text className="text-sm leading-relaxed text-gray-400 mb-8 tracking-wide">
					Чтобы не терять доступ, включите автопродление в настройках или продлите подписку
					вручную.
				</Text>

				<Section className="mb-8">
					<Button
						className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
						href="https://teacoder.ru/premium"
					>
						Продлить подписку
					</Button>
				</Section>
			</>
		)}

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Если вы уже всё решили - просто проигнорируйте это письмо.
		</Text>
	</EmailLayout>
)

export default SubscriptionExpiringEmail
