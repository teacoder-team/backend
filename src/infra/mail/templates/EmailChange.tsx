import { Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface EmailChangeEmailProps {
	code: string
	username?: string
}

export const EmailChangeEmail = ({
	code = '123456',
	username = 'Elon Mask'
}: EmailChangeEmailProps) => (
	<EmailLayout preview={`${code} - код подтверждения новой почты TeaCoder`}>
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Подтверждение почты
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}! Вы указали этот адрес как новую почту для входа в TeaCoder. Введите
			код ниже, чтобы подтвердить, что это действительно Вы.
		</Text>

		<Section className="bg-[#f3f4f6] rounded-xl py-8 px-4 border border-gray-100 mb-8">
			<Text className="m-0 text-[36px] font-semibold tracking-[12px] text-gray-900 leading-none">
				{code}
			</Text>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Код действителен в течение 15 минут.
		</Text>
	</EmailLayout>
)

export default EmailChangeEmail
