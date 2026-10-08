import { Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface VerificationEmailProps {
	code: string
}

export const VerificationEmail = ({ code = '123456' }: VerificationEmailProps) => (
	<EmailLayout preview={`${code} - Ваш код подтверждения TeaCoder`}>
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Ваш код <br /> подтверждения
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Введите этот код в приложении, чтобы завершить регистрацию. Код действителен в течение 15
			минут.
		</Text>

		<Section className="bg-[#f3f4f6] rounded-xl py-8 px-4 border border-gray-100 mb-8">
			<Text className="m-0 text-[36px] font-semibold tracking-[12px] text-gray-900 leading-none">
				{code}
			</Text>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Если Вы не запрашивали этот код, просто проигнорируйте данное письмо.
		</Text>
	</EmailLayout>
)

export default VerificationEmail
