import { Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface ResetPasswordEmailProps {
	code: string
	username?: string
}

export const ResetPasswordEmail = ({
	code = '123456',
	username = 'Elon Mask'
}: ResetPasswordEmailProps) => (
	<EmailLayout preview={`${code} - код сброса пароля TeaCoder`}>
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Сброс пароля
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}! Мы получили запрос на сброс пароля. Введите этот код, чтобы
			установить новый пароль.
		</Text>

		<Section className="bg-[#f3f4f6] rounded-xl py-8 px-4 border border-gray-100 mb-8">
			<Text className="m-0 text-[36px] font-semibold tracking-[12px] text-gray-900 leading-none">
				{code}
			</Text>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Код действителен в течение 15 минут. Если Вы не запрашивали сброс пароля, просто
			проигнорируйте данное письмо.
		</Text>
	</EmailLayout>
)

export default ResetPasswordEmail
