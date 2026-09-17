import { Button, Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface ResetPasswordEmailProps {
	resetLink: string
	username?: string
}

export const ResetPasswordEmail = ({
	resetLink = 'https://teacoder.ru/reset-password?token=test',
	username = 'Elon Mask'
}: ResetPasswordEmailProps) => (
	<EmailLayout preview="Сброс пароля в TeaCoder">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Сброс пароля
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}! <br />
			Мы получили запрос на восстановление пароля для Вашего аккаунта. Нажмите на кнопку ниже,
			чтобы установить новый пароль.
		</Text>

		<Section className="mb-10">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={resetLink}
			>
				Сбросить пароль
			</Button>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Ссылка действительна в течение 1 часа. <br />
			Если Вы не запрашивали сброс пароля, просто проигнорируйте данное письмо.
		</Text>
	</EmailLayout>
)

export default ResetPasswordEmail
