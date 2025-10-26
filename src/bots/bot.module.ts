import { Module } from '@nestjs/common'

import { TeamanagerBotModule } from './teamanager/teamanager.bot.module'

@Module({
	imports: [TeamanagerBotModule],
	exports: [TeamanagerBotModule]
})
export class BotModule {}
