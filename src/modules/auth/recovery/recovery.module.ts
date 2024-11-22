import { Module } from '@nestjs/common'

import { RecoveryController } from './recovery.controller'
import { RecoveryService } from './recovery.service'

@Module({
	controllers: [RecoveryController],
	providers: [RecoveryService]
})
export class RecoveryModule {}
