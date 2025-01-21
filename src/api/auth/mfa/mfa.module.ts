import { Module } from '@nestjs/common'

import { MfaController } from './mfa.controller'
import { MfaService } from './mfa.service'

@Module({
	controllers: [MfaController],
	providers: [MfaService]
})
export class MfaModule {}
