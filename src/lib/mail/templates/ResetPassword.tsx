import { Button, Heading, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface ResetPasswordEmailProps {
	url: string
	username?: string
}

export const ResetPasswordEmail = ({
	url = 'https://teacoder.ru/auth/recovery/q2fSx1Gd0Yk7uJ9ZlQm3cW8vB4nR6tHpE5aT1oKyL0s',
	username = 'Elon Mask'
}: ResetPasswordEmailProps) => (
	<EmailLayout preview="Ссылка для сброса пароля TeaCoder">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Сброс пароля
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}! Мы получили запрос на сброс пароля. Нажмите на кнопку ниже, чтобы
			установить новый пароль.
		</Text>

		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={url}
			>
				Установить новый пароль
			</Button>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Если кнопка не работает, скопируйте ссылку в адресную строку браузера:
		</Text>

		<Text className="text-sm leading-relaxed mb-8 break-all">
			<Link href={url} className="text-[#2563EB] underline">
				{url}
			</Link>
		</Text>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Ссылка действительна в течение 30 минут и сработает один раз. Если Вы не запрашивали
			сброс пароля, просто проигнорируйте данное письмо.
		</Text>
	</EmailLayout>
)

export default ResetPasswordEmail
