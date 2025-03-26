import React from 'react'

import { Restriction, User } from '@prisma/generated'
import {
	Body,
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

interface RestrictionLiftedEmailProps {
	user: User
	violations: number
}

const baseUrl = process.env['SITE_URL']

export function RestrictionLiftedEmail({ user, violations }: RestrictionLiftedEmailProps) {
	const logo = `${baseUrl}/touch-icons/512x512.png`

	const remainingViolations = Math.max(0, 3 - violations)

	const getViolationText = (count: number) => {
		if (count === 1) return 'нарушение'
		if (count > 1 && count < 5) return 'нарушения'
		return 'нарушений'
	}

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
					<Preview>Ограничение снято</Preview>
					<Container className='mx-auto my-10 max-w-[500px] rounded-lg bg-white p-8 shadow-lg'>
						<Section className='text-center'>
							<Img
								src={logo}
								width='100'
								height='100'
								alt='TeaCoder'
								className='mx-auto mb-4'
							/>
							<Heading className='text-2xl font-bold text-blue-600' style={{ fontFamily: 'Geist, Arial' }}>
								Ограничение снято
							</Heading>
							<Text className='mb-6 text-gray-500' style={{ fontFamily: 'Geist, Arial' }}>
								Привет, {user.displayName}! Мы рады сообщить, что ограничение на ваш аккаунт было снято.
							</Text>
							

							{violations === 0 && (
								<Section className='mb-8 rounded-lg border border-yellow-100 bg-yellow-50 p-6'>
									<Heading className='text-xl font-semibold text-yellow-700'>
										Внимание!
									</Heading>
									<Text className='text-gray-700 mt-4'>
										Это ваше первое нарушение. Если вы продолжите нарушать правила, следующие нарушения приведут к более строгим мерам, включая временные и бессрочные блокировки.
									</Text>
								</Section>
							)}

							{remainingViolations > 0 && (
								<Section className='mb-8 rounded-lg border border-yellow-100 bg-yellow-50 p-6'>
									<Heading className='text-xl font-semibold text-yellow-700'>
										Внимание!
									</Heading>
									<Text className='text-gray-700 mt-4'>
										Теперь, когда ваше ограничение снято, у вас осталось {remainingViolations} {getViolationText(remainingViolations)} до полной блокировки аккаунта.
									</Text>
									<Text className='text-gray-700 mt-4'>
										Пожалуйста, соблюдайте наши правила, чтобы избежать дальнейших санкций.
									</Text>
								</Section>
							)}

							{remainingViolations === 0 && (
								<Section className='mb-8 rounded-lg border border-red-100 bg-red-50 p-6'>
									<Heading className='text-xl font-semibold text-red-700'>
										Последний шанс
									</Heading>
									<Text className='text-gray-700 mt-4'>
										Это последний шанс избежать бессрочного блокирования. Пожалуйста, постарайтесь соблюдать правила платформы.
									</Text>
								</Section>
							)}
							
							<Section className='mb-8 rounded-lg border border-green-100 bg-green-50 p-6'>
								<Heading className='text-xl font-semibold text-green-700'>
									Что это значит?
								</Heading>
								<Text className='text-gray-700 mt-4'>
									Ваш аккаунт снова активен! Мы понимаем, что все могут ошибаться, и рады видеть вас обратно на платформе. Пожалуйста, следите за соблюдением наших правил в будущем.
								</Text>
								<Text className='text-gray-700 mt-4'>
									Спасибо, что вернулись в сообщество TeaCoder! Мы ценим вашу активность.
								</Text>
							</Section>

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
