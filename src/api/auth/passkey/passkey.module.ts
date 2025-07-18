import { Module } from '@nestjs/common'

import { PasskeyController } from './passkey.controller'
import { PasskeyService } from './passkey.service'

@Module({
	controllers: [PasskeyController],
	providers: [PasskeyService]
})
export class PasskeyModule {}
