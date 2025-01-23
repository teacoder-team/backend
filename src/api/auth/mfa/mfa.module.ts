import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Account } from '../account/entities'

import { MultiFactorAuthentication } from './entities'
import { MfaController } from './mfa.controller'
import { MfaService } from './mfa.service'

@Module({
	imports: [TypeOrmModule.forFeature([Account, MultiFactorAuthentication])],
	controllers: [MfaController],
	providers: [MfaService]
})
export class MfaModule {}
