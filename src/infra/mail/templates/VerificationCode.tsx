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
} from '@react-email/components'

interface VerificationEmailProps {
	code: string
}

const baseUrl = 'https://teacoder.ru'

export const VerificationEmail = ({
	code = '123456',
}: VerificationEmailProps) => {
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
			<Preview>{code} - Ваш код подтверждения TeaCoder</Preview>
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
							Ваш код <br /> подтверждения
						</Heading>

						<Text className='text-base leading-relaxed text-[#606369] mb-8 tracking-wide'>
							Введите этот код в приложении, чтобы завершить
							регистрацию. Код действителен в течение 15 минут.
						</Text>

						<Section className='bg-[#f3f4f6] rounded-xl py-8 px-4 border border-gray-100 mb-8'>
							<Text className='m-0 text-[36px] font-semibold tracking-[12px] text-gray-900 leading-none'>
								{code}
							</Text>
						</Section>

						<Text className='text-sm leading-relaxed text-gray-400 mb-10 tracking-wide'>
							Если Вы не запрашивали этот код, просто
							проигнорируйте данное письмо.
						</Text>

						<Section className='border-t border-gray-100'>
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

export default VerificationEmail
