import { IsString } from 'class-validator'

export class TelegramValidator {
	@IsString()
	public TELEGRAM_BOT_TOKEN: string

	@IsString()
	public TELEGRAM_OWNER_ID: string
}
