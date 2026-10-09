import { Button, Heading, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface EmailVerificationProps {
	url: string
	username?: string
}

export const EmailVerification = ({
	url = 'https://teacoder.ru/auth/verify/q2fSx1Gd0Yk7uJ9ZlQm3cW8vB4nR6tHpE5aT1oKyL0s',
	username = 'Linus Torvalds'
}: EmailVerificationProps) => (
	<EmailLayout preview="Подтвердите почту и войдите в TeaCoder">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Подтвердите почту
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}! Нажмите на кнопку ниже, чтобы подтвердить адрес электронной почты и
			войти в TeaCoder.
		</Text>

		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={url}
			>
				Подтвердить почту и войти
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
			Ссылка действует 30 минут и может быть использована только один раз. Новая ссылка
			заменяет предыдущую. Если Вы не запрашивали подтверждение, просто проигнорируйте это
			письмо.
		</Text>
	</EmailLayout>
)

export default EmailVerification
