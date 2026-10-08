import { Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface AccountLinkedEmailProps {
	username?: string
	provider?: string
	automatic?: boolean
	time?: string
}

export const AccountLinkedEmail = ({
	username = 'Elon Mask',
	provider = 'GitHub',
	automatic = true,
	time = '30 сентября 2026, 15:14 МСК'
}: AccountLinkedEmailProps) => (
	<EmailLayout preview={`К аккаунту TeaCoder привязан вход через ${provider}`}>
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Привязан вход через {provider}
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}!{' '}
			{automatic
				? `Вы вошли через ${provider} с той же почтой, что и у аккаунта TeaCoder, поэтому мы автоматически объединили их. Теперь входить можно и через ${provider}.`
				: `К Вашему аккаунту TeaCoder привязан вход через ${provider}.`}
		</Text>

		<Section className="bg-[#f3f4f6] rounded-xl py-4 px-6 border border-gray-100 mb-8">
			<Text className="m-0 text-sm leading-relaxed text-gray-900">{time}</Text>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Если это были не Вы - отвяжите {provider} в настройках аккаунта, смените пароль и
			завершите остальные сессии.
		</Text>
	</EmailLayout>
)

export default AccountLinkedEmail
