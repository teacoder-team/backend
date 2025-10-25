import { registerAs } from '@nestjs/config'

import type { TelegramConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { TelegramValidator } from '../validators'

export const telegramEnv = registerAs<TelegramConfig>('telegram', () => {
	validateEnv(process.env, TelegramValidator)

	return {
		teamanagerToken: process.env.TEAMANAGER_BOT_TOKEN,
		teacoderToken: process.env.TEACODER_BOT_TOKEN,
		ownerId: process.env.TELEGRAM_OWNER_ID
	}
})
