import React from 'react'

import { Restriction, RestrictionReason, User } from '@prisma/generated'
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

interface RestrictionEmailProps {
	user: User
	restriction: Restriction
	violations: number
}

const baseUrl = process.env['SITE_URL']

export function RestrictionEmail({ user, restriction, violations }: RestrictionEmailProps) {
	const logo = `${baseUrl}/touch-icons/512x512.png`

	const isUsernameBan = restriction.reason === RestrictionReason.INAPPROPRIATE_USERNAME;

	const isPermanentBan = isUsernameBan || !restriction.until;
	const remainingTime = isPermanentBan ? 'навсегда' : `до ${new Date(restriction.until).toLocaleDateString('ru-RU', { timeZone: 'UTC' })}`;

	const getReasonText = (reason: string) => {
		switch (reason) {
		  case RestrictionReason.INAPPROPRIATE_USERNAME:
			return 'неподобающие имя пользователя';
		  case RestrictionReason.SPAM:
			return 'распространение спама';
		  case RestrictionReason.OFFENSIVE_BEHAVIOR:
			return 'неприемлемое поведение';
		  default:
			return 'причина неизвестна';
		}
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
					<Preview>Ваш аккаунт был ограничен</Preview>
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
								Ваш аккаунт был ограничен
							</Heading>
							<Text className='mb-6 text-gray-500' style={{ fontFamily: 'Geist, Arial' }}>
								Привет, {user.displayName}. К сожалению, ваша учетная запись была ограничена по причине: <strong>
									{getReasonText(restriction.reason)}
								</strong>.
							</Text>
							<Section className='mb-8 rounded-lg border border-red-100 bg-red-50 p-6'>
								<Heading className='text-xl font-semibold text-red-700'>
									Срок ограничения
								</Heading>
								<Text className='text-gray-700 mt-4'>
									{isPermanentBan 
										? 'Ваше ограничение бессрочное.' 
										: `Ваше ограничение действует ${remainingTime}.`
									}
								</Text>
							</Section>

							{!isUsernameBan && violations === 0 && (
								<Section className='mb-8 rounded-lg border border-yellow-100 bg-yellow-50 p-6'>
									<Heading className='text-xl font-semibold text-yellow-700'>
										Важное предупреждение!
									</Heading>
									<Text className='text-gray-700 mt-4'>
										Это ваше первое нарушение. Если вы продолжите нарушать правила, следующие нарушения приведут к более строгим мерам, включая временные и бессрочные блокировки.
									</Text>
								</Section>
							)}
															
							{!isUsernameBan && violations === 1 && (
								<Section className='mb-8 rounded-lg border border-yellow-100 bg-yellow-50 p-6'>
									<Heading className='text-xl font-semibold text-yellow-700'>
									Важное предупреждение!
									</Heading>
									<Text className='text-gray-700 mt-4'>
										Это ваше {violations + 1}-е нарушение. Если вы нарушите правила еще раз, ваше ограничение станет бессрочным, и доступ к вашему аккаунту будет заблокирован навсегда.
									</Text>
								</Section>
							)}

							{!isUsernameBan && violations === 2 && (
								<Section className='mb-8 rounded-lg border border-red-100 bg-red-50 p-6'>
									<Heading className='text-xl font-semibold text-red-700'>
										Бан навсегда
									</Heading>
									<Text className='text-gray-700 mt-4'>
										Так как вы нарушили правила уже трижды, ваше ограничение будет бессрочным.
									</Text>
									<Text className='text-gray-700 mt-4'>
										Мы надеемся, что вы осознаете последствия вашего поведения и будете соблюдать правила в будущем. На данный момент ваше ограничение становится окончательным, и доступ к вашему аккаунту будет заблокирован навсегда.
									</Text>
								</Section>
							)}

							<Section className='mb-8 rounded-lg border border-red-100 bg-red-50 p-6'>
								<Heading className='text-xl font-semibold text-red-700'>
									Почему это произошло?
								</Heading>
								<Text className='text-gray-700 mt-4'>
									Ваши действия нарушили наши правила и политику. Мы понимаем, что все могут ошибаться, но такие поведения могут повлиять на других пользователей и на общее доверие в нашем сообществе. Важно помнить, что ваше поведение влияет на атмосферу на платформе, и подобные действия не могут быть допущены.
								</Text>
								<Text className='text-gray-700 mt-4'>
									Мы призываем вас пересмотреть свое поведение. В будущем постарайтесь соблюдать правила и быть ответственным участником сообщества.
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
