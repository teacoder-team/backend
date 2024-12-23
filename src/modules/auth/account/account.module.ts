import { Module } from '@nestjs/common'

import { TelegramService } from '@/modules/libs/telegram/telegram.service'

import { AccountController } from './account.controller'
import { AccountService } from './account.service'

@Module({
	controllers: [AccountController],
	providers: [AccountService, TelegramService]
})
export class AccountModule {}
