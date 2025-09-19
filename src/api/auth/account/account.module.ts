import { Module } from '@nestjs/common'

import { BotService } from '@/bot/bot.service'

import { AccountController } from './account.controller'
import { AccountService } from './account.service'

@Module({
	controllers: [AccountController],
	providers: [AccountService, BotService]
})
export class AccountModule {}
