import type { ElysiaOpenAPIConfig } from '@elysiajs/openapi'

import { API_VERSION } from './version'

/** Section names in the docs. Always reference these - a typo would silently open a new section. */
export const TAG = {
	core: 'Система',
	auth: 'Аутентификация',
	oauth: 'Вход через соцсети',
	sessions: 'Сессии',
	users: 'Профиль',
	courses: 'Курсы',
	lessons: 'Уроки',
	progress: 'Прогресс',
	billing: 'Оплата',
	webhooks: 'Вебхуки'
} as const

const DESCRIPTION = `
API образовательной платформы [TeaCoder](https://teacoder.ru): курсы и уроки, прогресс обучения, аккаунты, оплата.

## Авторизация

После входа API выдаёт пару токенов - и в теле ответа, и в httpOnly-cookie:

- **access** - короткоживущий JWT (cookie \`tc_access\`). Браузеру достаточно cookie; остальные клиенты передают его в заголовке \`Authorization: Bearer <token>\`.
- **refresh** - долгоживущий токен (cookie \`tc_refresh\`) для получения новой пары через \`POST /auth/refresh\`. Каждый раз меняется на новый; повторное использование старого завершает сессию.

Защищённые методы помечены замком.

## Ошибки

Успешный ответ - сами данные, без обёртки. Любая ошибка приходит в одном формате:

\`\`\`json
{ "status": 400, "messages": ["Invalid email or password"] }
\`\`\`

\`status\` совпадает с HTTP-кодом, в \`messages\` - по одной строке на проблему (при ошибках валидации их может быть несколько).

## Повторные запросы

\`POST /billing/create\` принимает заголовок \`Idempotency-Key\`: повтор с тем же ключом вернёт уже созданный платёж, а не откроет второй счёт.
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
			description: 'Вход через Google, GitHub, Discord, Яндекс и Telegram.'
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
				description: 'Access-токен из ответа на вход или обновление токенов.'
			}
		}
	}
}
