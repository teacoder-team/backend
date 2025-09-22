import { Module } from '@nestjs/common'

import { PasskeyService } from '../passkey/passkey.service'

import { MfaController } from './mfa.controller'
import { MfaService } from './mfa.service'

@Module({
	controllers: [MfaController],
	providers: [MfaService, PasskeyService]
})
export class MfaModule {}
