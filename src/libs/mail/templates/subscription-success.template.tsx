import React from 'react'

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

import { UserEntity } from '@/modules/payment/domain/repositories/user.repository.port'
import { PaymentEntity } from '@/modules/payment/domain/entities/payment.entity'
import { SubscriptionEntity } from '@/modules/payment/domain/repositories/subscription.repository.port'
import { PaymentMethod } from '@prisma/generated'

interface SubscriptionSuccessTemplateProps {
	user: UserEntity
	payment: PaymentEntity
	subscription: SubscriptionEntity
}

const baseUrl = process.env['HOSTS_APP']

export function SubscriptionSuccessTemplate({
	user,
	payment,
	subscription
}: SubscriptionSuccessTemplateProps) {
	const logo = `${baseUrl}/touch-icons/512x512.png`
	const returnUrl = `${baseUrl}/courses`

	const paymentInfo = paymentMethodInfo(payment.method.value)

	const infoRows = [
		{ label: 'Способ оплаты', value: paymentInfo.label },
		{ label: 'Сумма', value: `${payment.amount.value} ${payment.amount.currency}` },
		{ label: 'Начало подписки', value: new Date(subscription.startedAt).toLocaleDateString() },
		{ label: 'Окончание подписки', value: subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : '-' }
	]

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
					<Preview>Подписка успешно активирована</Preview>

					<Container className='mx-auto my-10 max-w-[700px] rounded-xl bg-white p-10 shadow-lg border border-gray-100'>
						<Section className='text-center'>
							<Img src={logo} width='80' height='80' alt='TeaCoder' className='mx-auto mb-4' />

							<Heading
								className='text-2xl font-bold text-blue-600 mb-2'
								style={{ fontFamily: 'Geist, Arial' }}
							>
								Подписка активирована!
							</Heading>

							<Text
								className='text-gray-600 mb-8 leading-relaxed text-[15px]'
								style={{ fontFamily: 'Geist, Arial' }}
							>
								{user.displayName}, спасибо, что оформили премиум-подписку и поддержали проект. Ниже -
								детали вашей оплаты и подписки.
							</Text>

							<Section className='rounded-xl bg-blue-50 p-6 border border-blue-100'>
								<table
									className='w-full text-sm text-gray-700'
									style={{ fontFamily: 'Geist, Arial', borderCollapse: 'collapse' }}
								>
									<tbody>
										{infoRows.map((row, i) => (
											<tr key={i} className='border-b border-gray-200 last:border-none'>
												<td className='py-2.5 text-gray-500 w-[45%] text-left'>{row.label}</td>
												<td className='py-2.5 w-[55%] text-right font-medium text-gray-900'>
													{row.value}
												</td>
											</tr>
										))}
									</tbody>
								</table>

								<div className='text-center mt-8'>
									<Button
										href={returnUrl}
										className='inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 leading-none transition-colors'
										style={{ fontFamily: 'Geist, Arial' }}
									>
										Перейти к курсам
									</Button>
								</div>
							</Section>

							<Text
								className='mt-8 text-xs text-gray-400'
								style={{ fontFamily: 'Geist, Arial' }}
							>
								© {new Date().getFullYear()} TeaCoder. Все права защищены.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

function paymentMethodInfo(method: string) {
	switch (method) {
		case PaymentMethod.BANK_CARD:
			return { label: 'Банковская карта', logo: `${baseUrl}/payment-logos/bank-card.svg` }
		case PaymentMethod.SBP:
			return { label: 'СБП', logo: `${baseUrl}/payment-logos/sbp.svg` }
		case PaymentMethod.T_PAY:
			return { label: 'T-Pay', logo: `${baseUrl}/payment-logos/sbp.svg` }
		case PaymentMethod.CRYPTO:
			return { label: 'Криптовалюта', logo: `${baseUrl}/payment-logos/crypto.svg` }
		case PaymentMethod.INTERNATIONAL_CARD:
			return { label: 'Международная карта', logo: `${baseUrl}/payment-logos/international-card.svg` }
		default:
			return { label: method, logo: '' }
	}
}
