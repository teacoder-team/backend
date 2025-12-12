import type {
	Payment,
	Subscription,
	User,
	UserPaymentMethod
} from '@prisma/generated'

import { PaymentEntity } from '@/modules/payment/domain/entities/payment.entity'
import { SubscriptionEntity } from '@/modules/payment/domain/repositories/subscription.repository.port'
import { UserEntity } from '@/modules/payment/domain/repositories/user.repository.port'

export const MESSAGES = {
	botUnavailable: 'Эй-эй! Этот бот только для владельца, а не для вас! 😜',
	welcomeMessage: `
    <b>Привет, хозяин!</b> 👋

Вы используете бота <b>TeaManager</b>, который будет информировать вас о новых пользователях на вашем сайте.

Бот готов к работе. Если появятся новые пользователи, вы получите уведомления здесь!
  `,
	newUser: (user: User, session: any, count: number) => `
🚨 <b>Новый пользователь зарегистрировался! 🎉</b>

<b>👤 Имя:</b> ${user.displayName}  
<b>📧 Email:</b> ${user.email}  

<b>🌍 Местоположение:</b> ${session.geo.capital}, ${session.geo.name}
<b>📱 Операционная система:</b> ${session.os.name}  
<b>🌐 Браузер:</b> ${session.browser.name}  
<b>💻 IP-адрес:</b> ${session.ip}

<b>🕒 Время регистрации:</b> ${new Date().toLocaleString()}

<b>👨‍💻 Общее количество пользователей:</b> ${count}`,
	subscriptionPurchased: (
		user: UserEntity,
		payment: PaymentEntity,
		subscription: SubscriptionEntity
	) => `
✅ <b>Новая подписка! 🎉</b>

<b>👤 Пользователь:</b> ${user.displayName}  
<b>📧 Email:</b> ${user.email}  

<b>💰 Сумма платежа:</b> ${payment.amount.value} ${payment.amount.currency}  
<b>📦 Статус платежа:</b> ${payment.status.value}
<b>💳 Способ оплаты:</b> ${payment.method.value}

<b>🕒 Дата платежа:</b> ${payment.createdAt.toLocaleString()}  
<b>🕒 Начало подписки:</b> ${subscription.startedAt.toLocaleString()}  
<b>⏳ Действует до:</b> ${subscription.expiresAt.toLocaleString()}
`
}
