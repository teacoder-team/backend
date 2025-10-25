import { Module } from '@nestjs/common'

import { TeamanagerBotModule } from '@/bots/teamanager/teamanager.bot.module'

import { AccountController } from './account.controller'
import { AccountService } from './account.service'

@Module({
	imports: [TeamanagerBotModule],
	controllers: [AccountController],
	providers: [AccountService]
})
export class AccountModule {}
