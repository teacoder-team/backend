import { Module } from '@nestjs/common'

import { TotpController } from './totp.controller'
import { TotpService } from './totp.service'

@Module({
	controllers: [TotpController],
	providers: [TotpService]
})
export class TotpModule {}
