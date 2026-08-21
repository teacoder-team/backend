import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Preview,
	Section,
	Tailwind,
	Text,
	Font,
	Button,
} from '@react-email/components'

interface ResetPasswordEmailProps {
	resetLink: string
	username?: string
}

const baseUrl = 'https://teacoder.ru'

export const ResetPasswordEmail = ({
	resetLink = 'https://teacoder.ru/reset-password?token=test',
	username = 'Elon Mask',
}: ResetPasswordEmailProps) => {
	return (
		<Html>
			<Head>
				<Font
					fontFamily='Golos Text'
					fallbackFontFamily='Arial'
					webFont={{
						url: 'https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600&display=swap',
						format: 'woff2',
					}}
				/>
			</Head>
			<Preview>Сброс пароля в TeaCoder</Preview>
			<Tailwind>
				<Body className='bg-[#F3F5F9] py-12'>
					<Container className='mx-auto max-w-[460px] rounded-2xl bg-[#FBFCFD] p-10 border border-gray-100 text-center'>
						<Section className='mb-2'>
							<Img
								src={`${baseUrl}/touch-icons/512x512.png`}
								width='100'
								height='100'
								alt='TeaCoder'
								className='mx-auto'
							/>
						</Section>

						<Heading className='font-serif text-3xl font-medium leading-tight text-black mb-4'>
							Сброс пароля
						</Heading>

						<Text className='text-base leading-relaxed text-[#606369] mb-8 tracking-wide'>
							Привет, {username}! <br />
							Мы получили запрос на восстановление пароля для
							Вашего аккаунта. Нажмите на кнопку ниже, чтобы
							установить новый пароль.
						</Text>

						<Section className='mb-10'>
							<Button
								className='bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4'
								href={resetLink}
							>
								Сбросить пароль
							</Button>
						</Section>

						<Text className='text-sm leading-relaxed text-gray-400 mb-10 tracking-wide'>
							Ссылка действительна в течение 1 часа. <br />
							Если Вы не запрашивали сброс пароля, просто
							проигнорируйте данное письмо.
						</Text>

						<Section className='border-t border-gray-100 pt-8'>
							<Text className='text-[12px] text-gray-400 m-0 font-sans uppercase tracking-wider'>
								&copy; {new Date().getFullYear()} TeaCoder
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default ResetPasswordEmail
