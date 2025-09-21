import type {
	Payment,
	Subscription,
	User,
	UserPaymentMethod
} from '@prisma/generated'

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

<b>👨‍💻 Общее количество пользователей:</b> ${count}`
}
