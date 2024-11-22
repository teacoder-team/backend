import { User } from '@prisma/generated'

import { SessionMetadata } from '@/modules/auth/session/entities/session.entity'

export const MESSAGES = {
	botUnavailable: 'Эй-эй! Этот бот только для владельца, а не для вас! 😜',
	welcomeMessage: `
    <b>Привет, хозяин!</b> 👋

    Вы используете бота <b>TeaManager</b>, который будет информировать вас о новых пользователях на вашем сайте.

    Бот готов к работе. Если появятся новые пользователи, вы получите уведомления здесь!
  `,
	newUserMessage: (user: User, metadata: SessionMetadata, count: number) => `
🚨 <b>Новый пользователь зарегистрировался! 🎉</b>

<b>👤 Имя:</b> ${user.displayName}  
<b>📧 Email:</b> ${user.email}  
<b>🔑 Метод авторизации:</b> ${user.method}

<b>🌍 Местоположение:</b> ${metadata.location.city}, ${metadata.location.country}
<b>📱 Операционная система:</b> ${metadata.device.os}  
<b>🌐 Браузер:</b> ${metadata.device.browser}  
<b>💻 IP-адрес:</b> ${metadata.ip}

<b>🕒 Время регистрации:</b> ${new Date().toLocaleString()}

<b>👨‍💻 Общее количество пользователей:</b> ${count}`
}
