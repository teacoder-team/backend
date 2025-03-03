import { User } from '@prisma/generated'
import {
	Body,
	Button,
	Container,
	Font,
	Head,
	Heading,
	Html,
	Img,
	Preview,
	Section,
	Tailwind,
	Text
} from '@react-email/components'
import React from 'react'

interface ResetPasswordEmailProps {
	user: User
	token: string
}

const baseUrl = process.env['SITE_URL']

export function ResetPasswordEmail({ user, token }: ResetPasswordEmailProps) {
	const resetLink = `${baseUrl}/auth/recovery/${token}`

	return (
		<Html>
			<Head>
				<Font
					fontFamily='Geist'
					fallbackFontFamily='Arial'
					webFont={{
						url: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;500;700&display=swap',
						format: 'woff2'
					}}
				/>
			</Head>
			<Tailwind>
				<Body>
					<Preview>Сброс пароля на TeaCoder</Preview>
					<Container className='mx-auto my-10 max-w-[500px] rounded-lg bg-white p-8 shadow-lg'>
						<Section className='text-center'>
							<Img
								src='https://52-dev.ru/touch-icons/512x512.png'
								width='100'
								height='100'
								alt='TeaCoder'
								className='mx-auto mb-4'
							/>
							<Heading className='text-2xl font-bold text-blue-600' style={{ fontFamily: 'Geist, Arial' }}>
								Сброс пароля
							</Heading>
							<Text className='mb-6 text-gray-500' style={{ fontFamily: 'Geist, Arial' }}>
								Привет, {user.displayName}! Мы получили запрос на сброс пароля для вашего аккаунта.
							</Text>
							<Section className='mb-8 rounded-lg border border-blue-100 bg-blue-50 p-6'>
								<Text className='mb-4 text-gray-800' style={{ fontFamily: 'Geist, Arial' }}>
									Нажмите на кнопку ниже, чтобы создать новый пароль. Ссылка действительна в течение 1 часа.
								</Text>
								<Button
									href={resetLink}
									className='inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-600/90 leading-none'
									style={{ fontFamily: 'Geist, Arial' }}
								>
									Сбросить пароль
								</Button>
							</Section>
							<Text className='text-sm text-gray-500' style={{ fontFamily: 'Geist, Arial' }}>
								Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
							</Text>
							<Text className='mt-6 text-sm text-gray-400' style={{ fontFamily: 'Geist, Arial' }}>
								© {new Date().getFullYear()} TeaCoder. Все права защищены.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
