import React from 'react'

import { Body, Button, Container, Font, Head, Heading, Html, Img, Preview, Section, Tailwind, Text } from '@react-email/components'
import { Payment, PaymentMethod, User } from '@prisma/generated'

interface SubscriptionBlockedTemplateProps {
	user: User
	payment: Payment
	payUrl: string
}

const baseUrl = process.env['HOSTS_APP']

const paymentMethodLabels: Record<PaymentMethod, string> = {
	BANK_CARD: 'Банковская карта',
	SBP: 'СБП',
	T_PAY: 'T-Pay',
	SBER_PAY: 'SberPay',
	CRYPTO: 'Криптовалюта',
	INTERNATIONAL_CARD: 'Международная карта',
	TELEGRAM_STARS: 'Телеграм звёзды',
	YOOMONEY: 'ЮMoney'
}

export function SubscriptionBlockedTemplate({
	user,
	payment,
	payUrl
}: SubscriptionBlockedTemplateProps) {
	const logo = `${baseUrl}/touch-icons/512x512.png`

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
				<Body className='bg-gray-50'>
					<Preview>Ваша подписка была приостановлена</Preview>
					<Container className='mx-auto my-10 max-w-[700px] rounded-xl bg-white p-10 shadow-lg border border-gray-100'>
						<Section className='text-center'>
							<Img src={logo} width='80' height='80' alt='TeaCoder' className='mx-auto mb-4' />
							<Heading className='text-2xl font-bold text-red-600 mb-2' style={{ fontFamily: 'Geist, Arial' }}>
								Подписка приостановлена
							</Heading>
							<Text className='text-gray-600 mb-4 leading-relaxed text-[15px]' style={{ fontFamily: 'Geist, Arial' }}>
								Здравствуйте, {user.displayName}! Мы временно приостановили вашу подписку, так как автоматические списания были отключены. Чтобы снова получить доступ к материалам и скачивать код, пожалуйста, оплатите выставленный счёт.
							</Text>
							<Text className='text-gray-600 mb-6 leading-relaxed text-[15px]' style={{ fontFamily: 'Geist, Arial' }}>
								Если вам удобнее использовать другой способ оплаты, вы можете выбрать подходящий вариант на нашем сайте. Мы поддерживаем оплату банковской картой, СБП, криптовалютой и международными картами.
							</Text>
							<Section className='rounded-xl bg-red-50 p-6 border border-red-100 mb-6'>
								<table className='w-full text-sm text-gray-700' style={{ fontFamily: 'Geist, Arial', borderCollapse: 'collapse' }}>
									<tbody>
										<tr className='border-b border-gray-200'>
											<td className='py-2.5 text-gray-500 text-left'>Сумма</td>
											<td className='py-2.5 text-right font-medium text-gray-900'>{payment.amount} {payment.currency}</td>
										</tr>
										<tr className='border-b border-gray-200'>
											<td className='py-2.5 text-gray-500 text-left'>Способ оплаты</td>
											<td className='py-2.5 text-right font-medium text-gray-900'>{paymentMethodLabels[payment.method]}</td>
										</tr>
										<tr>
											<td className='py-2.5 text-gray-500 text-left'>Срок действия счёта</td>
											<td className='py-2.5 text-right font-medium text-gray-900'>
												{payment.method === PaymentMethod.CRYPTO ? '12 часов' : '3 дня'}
											</td>
										</tr>
									</tbody>
								</table>
								<div className='text-center mt-6'>
									<Button
										href={payUrl}
										className='inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-sm font-medium text-white hover:bg-red-700 leading-none transition-colors'
										style={{ fontFamily: 'Geist, Arial' }}
									>
										Оплатить счёт
									</Button>
								</div>
							</Section>
							<Text className='text-gray-600 mb-4 leading-relaxed text-[13px]' style={{ fontFamily: 'Geist, Arial' }}>
								После оплаты ваша подписка будет автоматически возобновлена, и вы снова получите полный доступ ко всем материалам, включая скачивание кода.
							</Text>
							<Text className='mt-6 text-xs text-gray-400' style={{ fontFamily: 'Geist, Arial' }}>
								© {new Date().getFullYear()} TeaCoder. Все права защищены.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
