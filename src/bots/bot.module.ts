import { Module } from '@nestjs/common'

import { TeacoderBotModule } from './teacoder/teacoder.bot.module'
import { TeamanagerBotModule } from './teamanager/teamanager.bot.module'

@Module({
	imports: [TeamanagerBotModule, TeacoderBotModule],
	exports: [TeamanagerBotModule, TeacoderBotModule]
})
export class BotModule {}
