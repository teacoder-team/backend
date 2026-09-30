import type { ElysiaOpenAPIConfig } from '@elysiajs/openapi'

import { API_VERSION } from './version'

/** Section names in the docs. Always reference these - a typo would silently open a new section. */
export const TAG = {
	core: 'Система',
	auth: 'Аутентификация',
	oauth: 'Вход через соцсети',
	sessions: 'Сессии',
	users: 'Профиль',
	mfa: 'Двухфакторная аутентификация',
	webauthn: 'Ключи доступа',
	courses: 'Курсы',
	lessons: 'Уроки',
	progress: 'Прогресс',
	billing: 'Оплата',
	webhooks: 'Вебхуки'
} as const

const DESCRIPTION = `
API образовательной платформы [TeaCoder](https://teacoder.ru): курсы и уроки, прогресс обучения, аккаунты, оплата.

## Авторизация

После входа сессия держится на двух токенах, и каждый живёт только в одном месте:

- **access** - короткоживущий JWT, приходит **только в теле ответа** (\`accessToken\`). В cookie сервер его не кладёт. Храните его в памяти приложения (не в \`localStorage\`) и передавайте в заголовке \`Authorization: Bearer <token>\`.
- **refresh** - долгоживущий токен, приходит **только в httpOnly-cookie \`tc_refresh\`**. В теле ответа его нет, и JavaScript на странице его не видит. Cookie ограничена путём \`/auth/refresh\`, так что к остальным запросам браузер её не прикладывает.

Когда access-токен истёк (ответ 401) или приложение открыли заново, вызовите \`POST /auth/refresh\` без тела, с \`credentials: 'include'\`. Браузер сам отправит cookie, в ответ придёт новый \`accessToken\`, а cookie обновится. Refresh-токен одноразовый: повторное использование старого завершает сессию целиком.

Защищённые методы помечены замком.

## Ошибки

Успешный ответ - сами данные, без обёртки. Любая ошибка приходит в одном формате:

\`\`\`json
{ "status": 400, "messages": ["Invalid email or password"] }
\`\`\`

\`status\` совпадает с HTTP-кодом, в \`messages\` - по одной строке на проблему (при ошибках валидации их может быть несколько).

## Повторные запросы и оплата

На один курс (или подписку) у пользователя всегда не больше одного открытого счёта - второй, который можно случайно оплатить, не создаётся. Повторное создание платежа тем же способом возвращает уже открытый счёт.

\`POST /billing/create\` принимает заголовок \`Idempotency-Key\` (например, UUID): повтор с тем же ключом и теми же параметрами вернёт тот же платёж, с другими параметрами - ошибку 422. Подробности - в описании метода.
`.trim()

export const documentation: ElysiaOpenAPIConfig['documentation'] = {
	info: {
		title: 'TeaCoder API',
		description: DESCRIPTION,
		version: API_VERSION,
		contact: {
			name: 'Поддержка TeaCoder',
			email: 'support@teacoder.ru'
		},
		termsOfService: 'https://teacoder.ru/documents/terms-of-use'
	},
	tags: [
		{
			name: TAG.core,
			description: 'Конфигурация для клиентов и проверка работоспособности сервиса.'
		},
		{
			name: TAG.auth,
			description:
				'Регистрация по email с подтверждением кодом, вход, обновление токенов и восстановление пароля.'
		},
		{
			name: TAG.oauth,
			description:
				'Вход через Google, GitHub, Discord, Яндекс и Telegram, привязка и отвязка соцсетей в настройках аккаунта.'
		},
		{
			name: TAG.sessions,
			description: 'Устройства, на которых выполнен вход, и завершение сессий.'
		},
		{
			name: TAG.users,
			description: 'Профиль текущего пользователя: аватар, смена почты и пароля.'
		},
		{
			name: TAG.mfa,
			description:
				'Второй фактор входа: приложение-аутентификатор (TOTP) и резервные коды на случай потери телефона.'
		},
		{
			name: TAG.webauthn,
			description:
				'WebAuthn: ключи доступа (Touch ID, Face ID, Windows Hello, менеджеры паролей) и аппаратные ключи. Работают и для входа без пароля, и как второй фактор.'
		},
		{
			name: TAG.courses,
			description: 'Каталог курсов и их программа.'
		},
		{
			name: TAG.lessons,
			description: 'Содержимое уроков с учётом доступа.'
		},
		{
			name: TAG.progress,
			description: 'Прохождение курсов и отметки о пройденных уроках.'
		},
		{
			name: TAG.billing,
			description: 'Способы оплаты, создание платежей и управление подпиской.'
		},
		{
			name: TAG.webhooks,
			description:
				'Уведомления от платёжных провайдеров. Вызываются только самими провайдерами - клиентам не нужны.'
		}
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Access-токен'
			}
		}
	}
}
